import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertPromptSchema, insertApiKeySchema } from "../../shared/schema";
import { z } from "zod";

const adminRouter = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  // For now, we're using a simple userId check
  // In production, this should be integrated with your auth system
  const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
  
  const isAdmin = await storage.isAdmin(userId);
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  
  (req as any).userId = userId;
  next();
};

// Apply admin middleware to all routes
adminRouter.use(requireAdmin);

// Prompt routes
adminRouter.get("/prompts", async (req: Request, res: Response) => {
  try {
    const prompts = await storage.getPrompts();
    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
});

adminRouter.post("/prompts", async (req: Request, res: Response) => {
  try {
    const validatedData = insertPromptSchema.parse(req.body);
    const prompt = await storage.createPrompt({
      ...validatedData,
      updatedBy: (req as any).userId
    });
    res.json(prompt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Failed to create prompt" });
  }
});

adminRouter.put("/prompts/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertPromptSchema.partial().parse(req.body);
    
    const prompt = await storage.updatePrompt(id, {
      ...validatedData,
      updatedBy: (req as any).userId
    });
    
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    
    res.json(prompt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating prompt:", error);
    res.status(500).json({ error: "Failed to update prompt" });
  }
});

adminRouter.delete("/prompts/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deletePrompt(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    res.status(500).json({ error: "Failed to delete prompt" });
  }
});

// API Key routes
adminRouter.get("/api-keys", async (req: Request, res: Response) => {
  try {
    const apiKeys = await storage.getApiKeys();
    // Mask the values for security
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      value: key.value.substring(0, 8) + '...' + key.value.substring(key.value.length - 4)
    }));
    res.json(maskedKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

adminRouter.post("/api-keys", async (req: Request, res: Response) => {
  try {
    const validatedData = insertApiKeySchema.parse(req.body);
    const apiKey = await storage.createApiKey({
      ...validatedData,
      updatedBy: (req as any).userId
    });
    
    // Return with masked value
    res.json({
      ...apiKey,
      value: apiKey.value.substring(0, 8) + '...' + apiKey.value.substring(apiKey.value.length - 4)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating API key:", error);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

adminRouter.put("/api-keys/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertApiKeySchema.partial().parse(req.body);
    
    const apiKey = await storage.updateApiKey(id, {
      ...validatedData,
      updatedBy: (req as any).userId
    });
    
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    // Return with masked value
    res.json({
      ...apiKey,
      value: apiKey.value.substring(0, 8) + '...' + apiKey.value.substring(apiKey.value.length - 4)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating API key:", error);
    res.status(500).json({ error: "Failed to update API key" });
  }
});

adminRouter.delete("/api-keys/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteApiKey(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export { adminRouter };