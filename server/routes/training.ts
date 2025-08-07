import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
// Dynamic import for pdf-parse to avoid startup issues
import { storage } from "../storage";
import { insertTrainingFileSchema, insertTrainingContextSchema } from "../../shared/schema";
import { z } from "zod";
import { pineconeService } from "../services/pinecone";

const trainingRouter = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept PDFs, text files, and common document formats
    const allowedMimes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, TXT, MD, and DOC files are allowed."));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
  
  const isAdmin = await storage.isAdmin(userId);
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  
  (req as any).userId = userId;
  next();
};

// Apply admin middleware to all routes
trainingRouter.use(requireAdmin);

// Get all training files
trainingRouter.get("/files", async (req: Request, res: Response) => {
  try {
    const files = await storage.getTrainingFiles();
    res.json(files);
  } catch (error) {
    console.error("Error fetching training files:", error);
    res.status(500).json({ error: "Failed to fetch training files" });
  }
});

// Upload a new training file
trainingRouter.post("/files/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: (req as any).userId,
    };

    const trainingFile = await storage.createTrainingFile(fileData);
    
    // Process the file asynchronously
    processFile(trainingFile.id, req.file.path, req.file.mimetype);
    
    res.json({
      message: "File uploaded successfully",
      file: trainingFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Delete a training file
trainingRouter.delete("/files/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const file = await storage.getTrainingFile(id);
    
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Delete the physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error("Error deleting physical file:", error);
    }
    
    // Delete from Pinecone first
    try {
      await pineconeService.deleteAllContextsForFile(id);
    } catch (error) {
      console.error("Error deleting from Pinecone:", error);
    }
    
    await storage.deleteTrainingFile(id);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Get training contexts
trainingRouter.get("/contexts", async (req: Request, res: Response) => {
  try {
    const fileId = req.query.fileId ? parseInt(req.query.fileId as string) : undefined;
    const contexts = await storage.getTrainingContexts(fileId);
    res.json(contexts);
  } catch (error) {
    console.error("Error fetching training contexts:", error);
    res.status(500).json({ error: "Failed to fetch training contexts" });
  }
});

// Create a new training context
trainingRouter.post("/contexts", async (req: Request, res: Response) => {
  try {
    const validatedData = insertTrainingContextSchema.parse(req.body);
    const context = await storage.createTrainingContext(validatedData);
    
    // Store in Pinecone
    try {
      await pineconeService.upsertContext(context);
    } catch (error) {
      console.error("Error storing context in Pinecone:", error);
    }
    
    res.json(context);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating training context:", error);
    res.status(500).json({ error: "Failed to create training context" });
  }
});

// Update a training context
trainingRouter.put("/contexts/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertTrainingContextSchema.partial().parse(req.body);
    
    const context = await storage.updateTrainingContext(id, validatedData);
    
    if (!context) {
      return res.status(404).json({ error: "Context not found" });
    }
    
    res.json(context);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating training context:", error);
    res.status(500).json({ error: "Failed to update training context" });
  }
});

// Delete a training context
trainingRouter.delete("/contexts/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Delete from storage
    await storage.deleteTrainingContext(id);
    
    // Delete from Pinecone
    try {
      await pineconeService.deleteContext(id);
    } catch (error) {
      console.error("Error deleting from Pinecone:", error);
    }
    
    res.json({ message: "Context deleted successfully" });
  } catch (error) {
    console.error("Error deleting context:", error);
    res.status(500).json({ error: "Failed to delete context" });
  }
});

// Search training contexts
trainingRouter.get("/contexts/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const contexts = await storage.searchTrainingContexts(query);
    res.json(contexts);
  } catch (error) {
    console.error("Error searching contexts:", error);
    res.status(500).json({ error: "Failed to search contexts" });
  }
});

// Vector search training contexts with Pinecone
trainingRouter.post("/contexts/vector-search", async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const contexts = await pineconeService.searchSimilarContexts(query, topK);
    res.json(contexts);
  } catch (error) {
    console.error("Error performing vector search:", error);
    res.status(500).json({ error: "Failed to perform vector search" });
  }
});

// Process uploaded file asynchronously
async function processFile(fileId: number, filePath: string, mimeType: string) {
  try {
    let content = "";
    
    if (mimeType === "application/pdf") {
      // Process PDF file with dynamic import
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
      } catch (error) {
        console.error("Error parsing PDF:", error);
        content = "PDF parsing is temporarily unavailable";
      }
    } else if (mimeType.startsWith("text/")) {
      // Process text file
      content = await fs.readFile(filePath, "utf-8");
    } else {
      // For other formats, we'll need additional libraries
      content = "File format not yet supported for content extraction";
    }
    
    // Update the file with extracted content
    await storage.updateTrainingFile(fileId, {
      content,
      status: "completed",
    });
    
    // Automatically create training contexts from the content
    if (content && content.length > 0) {
      await createContextsFromContent(fileId, content);
    }
  } catch (error) {
    console.error("Error processing file:", error);
    await storage.updateTrainingFile(fileId, {
      status: "failed",
      error: (error as Error).message || "Failed to process file",
    });
  }
}

// Create training contexts from file content
async function createContextsFromContent(fileId: number, content: string) {
  // Split content into chunks (simple implementation)
  const chunks = content.split(/\n\n+/).filter(chunk => chunk.trim().length > 50);
  
  for (const chunk of chunks) {
    // Extract title from the first line or first sentence
    const lines = chunk.split("\n");
    const title = lines[0].substring(0, 100) || "Untitled Section";
    
    // Create a training context
    const context = await storage.createTrainingContext({
      fileId,
      title,
      content: chunk,
      category: "document",
      keywords: extractKeywords(chunk),
    });
    
    // Store in Pinecone for vector search
    try {
      await pineconeService.upsertContext(context);
    } catch (error) {
      console.error("Error storing context in Pinecone:", error);
      // Continue processing even if Pinecone fails
    }
  }
}

// Simple keyword extraction
function extractKeywords(text: string): string[] {
  // Remove common words and extract unique terms
  const commonWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "as", "by", "that", "this", "it", "from", "be", "are", "is", "was", "were", "been"]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  
  // Get top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

export default trainingRouter;