import { storage } from "../storage";
import { pineconeService } from "./pinecone";
import { configService } from "./config";
import { GoogleGenAI } from "@google/genai";
import type { Message, ChatbotMode, LeadGenField, Product } from "../../shared/schema";

export class ChatbotModeService {
  private ai: GoogleGenAI | null = null;

  private async getAI(): Promise<GoogleGenAI> {
    if (!this.ai) {
      const apiKey = await configService.getApiKey("GEMINI_API_KEY");
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  private async generateResponse(
    systemPrompt: string,
    userMessage: string,
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    const ai = await this.getAI();
    const model = ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 500,
        systemInstruction: systemPrompt,
      },
      contents: userMessage,
    });

    const result = await model;
    return result.text || "I'm having trouble generating a response.";
  }
  async processMessage(message: string, sessionId: string): Promise<{
    response: string;
    quickReplies?: string[];
    requiresInput?: { field: LeadGenField; };
    recommendations?: Product[];
  }> {
    // Get the active chatbot mode
    const activeMode = await storage.getActiveChatbotMode();
    if (!activeMode) {
      return {
        response: "I'm currently unavailable. Please try again later.",
      };
    }

    switch (activeMode.mode) {
      case "qna":
        return this.handleQnAMode(message, activeMode);
      case "lead_gen":
        return this.handleLeadGenMode(message, sessionId, activeMode);
      case "recommendation":
        return this.handleRecommendationMode(message, activeMode);
      default:
        return {
          response: "Invalid chatbot mode configured.",
        };
    }
  }

  private async handleQnAMode(message: string, mode: ChatbotMode): Promise<{
    response: string;
    quickReplies?: string[];
  }> {
    try {
      // Parse configuration
      const config = JSON.parse(mode.configuration);
      
      // Build context from available data
      let context = "Context: General business automation consultation.\n";

      // Generate response using Gemini
      const systemPrompt = `${mode.systemPrompt}\n\nTone: ${mode.tone}\n\nContext:\n${context}`;
      
      const response = await this.generateResponse(
        systemPrompt,
        message,
        {
          temperature: 0.7,
          maxTokens: 500,
        }
      );

      // Generate quick replies if configured
      let quickReplies: string[] = [];
      if (config.enableQuickReplies) {
        quickReplies = await this.generateQuickReplies(message, response);
      }

      return { response, quickReplies };
    } catch (error) {
      console.error("Error in QnA mode:", error);
      return {
        response: "I'm having trouble processing your question. Please try rephrasing it.",
      };
    }
  }

  private async handleLeadGenMode(
    message: string, 
    sessionId: string, 
    mode: ChatbotMode
  ): Promise<{
    response: string;
    requiresInput?: { field: LeadGenField; };
  }> {
    try {
      // Get or create lead for this session
      let lead = await storage.getLeadBySessionId(sessionId);
      if (!lead) {
        lead = await storage.createLead({
          sessionId,
          data: "{}",
          status: "in_progress"
        });
      }

      // Get active lead generation fields
      const activeFields = await storage.getActiveLeadGenFields();
      if (activeFields.length === 0) {
        return {
          response: "Lead generation is not configured. Please contact support.",
        };
      }

      // Parse current lead data
      const leadData = JSON.parse(lead.data);
      
      // Find the next field to collect
      const nextField = activeFields.find(field => !leadData[field.fieldName]);
      
      if (!nextField) {
        // All fields collected, complete the lead
        await storage.updateLead(lead.id, {
          status: "completed",
          completedAt: new Date()
        });

        // Generate completion response
        const response = await this.generateResponse(
          `${mode.systemPrompt}\n\nGenerate a thank you message for completing the lead form. Be ${mode.tone}.`,
          "User has completed all fields",
          { temperature: 0.7 }
        );

        return { response };
      }

      // Store the previous answer if this is not the first field
      const previousField = activeFields[activeFields.indexOf(nextField) - 1];
      if (previousField && message.trim()) {
        leadData[previousField.fieldName] = message;
        await storage.updateLead(lead.id, { data: JSON.stringify(leadData) });
      }

      // Generate a friendly prompt for the next field
      const config = JSON.parse(mode.configuration);
      const prompt = `${mode.systemPrompt}\n\nAsk the user for their ${nextField.label} in a ${mode.tone} way. ${nextField.placeholder ? `Hint: ${nextField.placeholder}` : ''}`;
      
      const response = await this.generateResponse(
        prompt,
        `Need to collect: ${nextField.label}`,
        { temperature: 0.8 }
      );

      return {
        response,
        requiresInput: { field: nextField }
      };
    } catch (error) {
      console.error("Error in Lead Gen mode:", error);
      return {
        response: "I'm having trouble collecting your information. Please try again.",
      };
    }
  }

  private async handleRecommendationMode(
    message: string, 
    mode: ChatbotMode
  ): Promise<{
    response: string;
    recommendations?: Product[];
  }> {
    try {
      // Search for relevant products
      const searchResults = await storage.searchProducts(message);
      
      // Build context
      let context = "Available products:\n";
      searchResults.slice(0, 5).forEach((product, idx) => {
        context += `${idx + 1}. ${product.name}: ${product.description} (${product.price || 'Contact for pricing'})\n`;
      });

      // Generate recommendation response
      const systemPrompt = `${mode.systemPrompt}\n\nTone: ${mode.tone}\n\nContext:\n${context}`;
      
      const response = await this.generateResponse(
        systemPrompt,
        `User query: ${message}\n\nProvide personalized product recommendations based on their needs.`,
        {
          temperature: 0.7,
          maxTokens: 600,
        }
      );

      return {
        response,
        recommendations: searchResults.slice(0, 3)
      };
    } catch (error) {
      console.error("Error in Recommendation mode:", error);
      return {
        response: "I'm having trouble finding recommendations for you. Please try describing what you're looking for in more detail.",
      };
    }
  }

  private async generateQuickReplies(message: string, response: string): Promise<string[]> {
    try {
      const prompt = `Based on this conversation:
User: ${message}
Assistant: ${response}

Generate 3 relevant follow-up questions or actions the user might want to take. Keep them short (max 4 words each).`;

      const quickRepliesResponse = await this.generateResponse(
        "You are a helpful assistant that generates quick reply options.",
        prompt,
        { temperature: 0.8 }
      );

      // Parse the response to extract quick replies
      const lines = quickRepliesResponse.split('\n').filter(line => line.trim());
      return lines.slice(0, 3).map(line => line.replace(/^\d+\.?\s*/, '').trim());
    } catch (error) {
      console.error("Error generating quick replies:", error);
      return [];
    }
  }

  // Initialize default chatbot modes
  async initializeDefaultModes(): Promise<void> {
    const existingModes = await storage.getChatbotModes();
    if (existingModes.length > 0) return;

    // Create default QnA mode
    await storage.createChatbotMode({
      mode: "qna",
      isActive: true,
      configuration: JSON.stringify({
        enableQuickReplies: true,
        maxContextLength: 3,
        useVectorSearch: true
      }),
      systemPrompt: "You are a helpful AI assistant for SellSpark. Answer questions based on the provided context and training data. Be accurate, helpful, and professional.",
      welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
      tone: "professional"
    });

    // Create default Lead Gen mode
    await storage.createChatbotMode({
      mode: "lead_gen",
      isActive: false,
      configuration: JSON.stringify({
        thankYouMessage: "Thank you for providing your information! We'll get back to you soon.",
        progressIndicator: true
      }),
      systemPrompt: "You are a friendly lead generation assistant. Collect user information in a conversational way. Make the process feel natural and engaging.",
      welcomeMessage: "Welcome! I'd love to learn more about you and how we can help. Let's start with a few quick questions.",
      tone: "friendly"
    });

    // Create default Recommendation mode
    await storage.createChatbotMode({
      mode: "recommendation",
      isActive: false,
      configuration: JSON.stringify({
        maxRecommendations: 3,
        showPricing: true,
        enableComparison: true
      }),
      systemPrompt: "You are a product recommendation specialist. Help users find the perfect products based on their needs. Provide personalized suggestions and explain why each product is a good fit.",
      welcomeMessage: "Hi! I'm here to help you find the perfect solution. Tell me what you're looking for, and I'll recommend the best options for you.",
      tone: "casual"
    });

    console.log("Default chatbot modes initialized");
  }
}

export const chatbotModeService = new ChatbotModeService();