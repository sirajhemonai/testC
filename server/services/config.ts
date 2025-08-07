import { storage } from "../storage";

class ConfigService {
  private promptCache: Map<string, string> = new Map();
  private apiKeyCache: Map<string, string> = new Map();
  private lastCacheUpdate = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getPrompt(key: string): Promise<string> {
    await this.refreshCacheIfNeeded();
    
    const cachedPrompt = this.promptCache.get(key);
    if (cachedPrompt) {
      return cachedPrompt;
    }

    // Fallback to default prompts if not found in database
    const defaultPrompts: Record<string, string> = {
      consultation_system: `You are a friendly and professional AI automation consultant for SellSpark. Your goal is to understand the user's business needs through a conversational approach and recommend specific automation solutions. Be warm, encouraging, and focus on the value automation can bring to their business.`,
      
      industry_research: `Research industry-specific automation solutions for the following business type: {{businessType}}

Focus on:
1. Common automation use cases in this industry
2. Popular tools and platforms (Make.com, n8n, Zapier)
3. Typical ROI and time savings
4. Implementation complexity

Provide specific, actionable insights.`,
      
      business_analysis: `Analyze this business information and create a structured summary:

{{businessData}}

Extract and organize:
- Business name and type
- Target audience
- Core services/products
- Key pain points that automation could solve
- Current tech stack indicators
- Growth stage and priorities

Format as JSON with clear categories.`
    };

    return defaultPrompts[key] || "";
  }

  async getApiKey(name: string): Promise<string> {
    await this.refreshCacheIfNeeded();
    
    const cachedKey = this.apiKeyCache.get(name);
    if (cachedKey) {
      return cachedKey;
    }

    // Check environment variables as fallback
    const envKey = process.env[name];
    if (envKey) {
      return envKey;
    }

    throw new Error(`API key ${name} not found in database or environment`);
  }

  private async refreshCacheIfNeeded() {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheTimeout && this.promptCache.size > 0) {
      return;
    }

    try {
      // Refresh prompts
      const prompts = await storage.getPrompts();
      this.promptCache.clear();
      for (const prompt of prompts) {
        if (prompt.isActive) {
          this.promptCache.set(prompt.key, prompt.content);
        }
      }

      // Refresh API keys
      const apiKeys = await storage.getApiKeys();
      this.apiKeyCache.clear();
      for (const apiKey of apiKeys) {
        if (apiKey.isActive) {
          this.apiKeyCache.set(apiKey.name, apiKey.value);
        }
      }

      this.lastCacheUpdate = now;
    } catch (error) {
      console.error("Error refreshing config cache:", error);
      // Continue with existing cache or defaults
    }
  }

  async initializeDefaultData() {
    try {
      // Check if we already have data
      const existingPrompts = await storage.getPrompts();
      const existingKeys = await storage.getApiKeys();
      
      if (existingPrompts.length > 0 || existingKeys.length > 0) {
        return; // Already initialized
      }

      // Initialize default prompts
      const defaultPrompts = [
        {
          key: "consultation_system",
          name: "Consultation System Prompt",
          category: "system",
          description: "Main system prompt for the consultation AI",
          content: `You are a friendly and professional AI automation consultant for SellSpark. Your goal is to understand the user's business needs through a conversational approach and recommend specific automation solutions. Be warm, encouraging, and focus on the value automation can bring to their business.`,
          isActive: true,
        },
        {
          key: "industry_research",
          name: "Industry Research Prompt",
          category: "perplexity",
          description: "Prompt for researching industry-specific automation solutions",
          content: `Research industry-specific automation solutions for the following business type: {{businessType}}

Focus on:
1. Common automation use cases in this industry
2. Popular tools and platforms (Make.com, n8n, Zapier)
3. Typical ROI and time savings
4. Implementation complexity

Provide specific, actionable insights.`,
          isActive: true,
        },
        {
          key: "business_analysis",
          name: "Business Analysis Prompt",
          category: "gemini",
          description: "Prompt for analyzing business data and creating recommendations",
          content: `Analyze this business information and create a structured summary:

{{businessData}}

Extract and organize:
- Business name and type
- Target audience
- Core services/products
- Key pain points that automation could solve
- Current tech stack indicators
- Growth stage and priorities

Format as JSON with clear categories.`,
          isActive: true,
        },
      ];

      for (const prompt of defaultPrompts) {
        await storage.createPrompt(prompt);
      }

      console.log("Default prompts initialized successfully");
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }
}

export const configService = new ConfigService();

// Initialize default data on startup
configService.initializeDefaultData().catch(console.error);