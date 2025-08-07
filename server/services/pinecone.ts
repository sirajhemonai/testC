import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import { configService } from "./config";
import { storage } from "../storage";
import type { TrainingContext } from "../../shared/schema";

export class PineconeService {
  private pinecone: Pinecone | null = null;
  private gemini: GoogleGenAI | null = null;
  private index: any = null;
  private readonly indexName = "sellspark-training";
  private readonly embeddingModel = "text-embedding-004";
  
  async initialize() {
    try {
      // Get API keys
      const pineconeKey = await configService.getApiKey("PINECONE_API_KEY");
      const geminiKey = await configService.getApiKey("GEMINI_API_KEY");
      
      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: pineconeKey
      });
      
      // Initialize Gemini for embeddings
      this.gemini = new GoogleGenAI({ apiKey: geminiKey });
      
      // Check if index exists, create if not
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === this.indexName);
      
      if (!indexExists) {
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 768, // Dimension for Gemini text-embedding-004
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1"
            }
          }
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Get index reference
      this.index = this.pinecone.index(this.indexName);
      
      console.log("PineconeService initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PineconeService:", error);
      throw error;
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.gemini) {
      throw new Error("Gemini not initialized");
    }
    
    try {
      // Use the REST API directly for embeddings
      const geminiKey = await configService.getApiKey("GEMINI_API_KEY");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:embedContent`,
        {
          method: 'POST',
          headers: {
            'x-goog-api-key': geminiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.embeddingModel,
            content: {
              parts: [{ text }]
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.embedding?.values || [];
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }
  
  async upsertContext(context: TrainingContext) {
    if (!this.index) {
      await this.initialize();
    }
    
    try {
      const embedding = await this.generateEmbedding(context.content);
      
      await this.index.upsert([{
        id: `context-${context.id}`,
        values: embedding,
        metadata: {
          contextId: context.id,
          fileId: context.fileId,
          title: context.title,
          content: context.content.substring(0, 1000), // Store first 1000 chars for reference
          keywords: context.keywords || []
        }
      }]);
      
      console.log(`Upserted context ${context.id} to Pinecone`);
    } catch (error) {
      console.error("Error upserting to Pinecone:", error);
      throw error;
    }
  }
  
  async searchSimilarContexts(query: string, topK: number = 5): Promise<TrainingContext[]> {
    if (!this.index) {
      await this.initialize();
    }
    
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const results = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true
      });
      
      if (!results.matches || results.matches.length === 0) {
        return [];
      }
      
      // Fetch full contexts from storage
      const contextIds = results.matches
        .map((match: any) => match.metadata?.contextId as number)
        .filter((id: any) => id !== undefined);
      
      const contexts = await Promise.all(
        contextIds.map((id: number) => storage.getTrainingContext(id))
      );
      
      return contexts.filter(ctx => ctx !== undefined) as TrainingContext[];
    } catch (error) {
      console.error("Error searching Pinecone:", error);
      return [];
    }
  }
  
  async deleteContext(contextId: number) {
    if (!this.index) {
      await this.initialize();
    }
    
    try {
      await this.index.delete1({
        ids: [`context-${contextId}`]
      });
      console.log(`Deleted context ${contextId} from Pinecone`);
    } catch (error) {
      console.error("Error deleting from Pinecone:", error);
    }
  }
  
  async deleteAllContextsForFile(fileId: number) {
    if (!this.index) {
      await this.initialize();
    }
    
    try {
      // Query all vectors for this file
      const contexts = await storage.getTrainingContexts(fileId);
      const ids = contexts.map(ctx => `context-${ctx.id}`);
      
      if (ids.length > 0) {
        await this.index.delete1({
          ids
        });
        console.log(`Deleted ${ids.length} contexts for file ${fileId} from Pinecone`);
      }
    } catch (error) {
      console.error("Error deleting file contexts from Pinecone:", error);
    }
  }
}

export const pineconeService = new PineconeService();