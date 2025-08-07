import type { Express } from 'express';
import { z } from 'zod';
import { insertMessageSchema, insertConsultationSessionSchema } from '@shared/schema';

// Load AI services conditionally
async function loadAIServices() {
  const services: any = {};
  
  try {
    if (process.env.GEMINI_API_KEY) {
      const { GeminiService } = await import('../server/services/gemini');
      services.gemini = new GeminiService();
    }
    
    if (process.env.PERPLEXITY_API_KEY) {
      const { PerplexityService } = await import('../server/services/perplexity');
      services.perplexity = new PerplexityService();
    }
    
    if (process.env.BRIGHTDATA_API_KEY) {
      const { BrightDataService } = await import('../server/services/brightdata');
      services.brightdata = new BrightDataService();
    }
  } catch (error) {
    console.error('Error loading AI services:', error);
  }
  
  return services;
}

// Get storage instance lazily to avoid initialization issues
async function getStorage() {
  try {
    const { storage } = await import('../server/storage');
    return storage;
  } catch (error) {
    console.error('Storage initialization error:', error);
    // Return a mock storage for Vercel if database fails
    return {
      clearMessages: async () => {},
      createConsultationSession: async (data: any) => ({ id: 1, ...data }),
      updateConsultationSession: async () => {},
      getCurrentConsultationSession: async () => null,
      createMessage: async (data: any) => ({ id: 1, ...data }),
      getAllMessages: async () => [],
    };
  }
}

export async function registerRoutes(app: Express) {
  const aiServices = await loadAIServices();
  
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasPerplexity: !!process.env.PERPLEXITY_API_KEY,
        hasBrightData: !!process.env.BRIGHTDATA_API_KEY,
      }
    };

    // Test database connection
    if (process.env.DATABASE_URL) {
      try {
        const { Pool } = await import('@neondatabase/serverless');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const result = await pool.query('SELECT NOW()');
        await pool.end();
        health.database = {
          connected: true,
          timestamp: result.rows[0].now
        };
      } catch (error: any) {
        health.database = {
          connected: false,
          error: error.message
        };
      }
    }

    res.json(health);
  });

  // Start consultation endpoint
  app.post("/api/consultation/start", async (req, res) => {
    try {
      const { websiteUrl, email } = req.body;
      
      if (!websiteUrl || !email) {
        return res.status(400).json({ 
          error: "Website URL and email are required" 
        });
      }

      // Parse URL safely
      let businessName = 'Your Business';
      try {
        let urlToParse = websiteUrl;
        if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
          urlToParse = 'https://' + urlToParse;
        }
        const parsedUrl = new URL(urlToParse);
        const domain = parsedUrl.hostname.replace('www.', '');
        businessName = domain.split('.')[0]
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } catch (e) {
        console.error('URL parse error:', e);
      }

      // Create quick summary
      const quickSummary = {
        businessName,
        businessType: "Coaching",
        targetAudience: "Coaches and Consultants",
        services: ["Coaching Services", "Consulting", "Training"],
        challenges: ["Lead generation", "Client onboarding", "Follow-up automation"],
        specificTools: ["AI Chatbot", "Email Automation", "Scheduling", "CRM"],
        implementations: ["Automate lead capture", "Streamline onboarding", "Improve follow-up"]
      };

      // Get storage instance
      const storage = await getStorage();
      
      // Create session
      const session = await storage.createConsultationSession({
        websiteUrl,
        email,
        businessSummary: `${businessName} - Coaching Business`,
        websiteAnalysis: JSON.stringify(quickSummary),
        currentStep: 0,
        userResponses: JSON.stringify({ 
          businessType: "coaching",
          targetAudience: "Coaches and Consultants"
        }),
        isComplete: false,
      });

      // Create initial message
      const greeting = `Hi! I'm analyzing ${businessName} to create your personalized automation plan. Let me start by asking - what's your name?`;
      
      await storage.createMessage({
        content: greeting,
        isUser: false,
        messageType: "question",
        quickReplies: null,
      });

      // Start background analysis if services available
      if (aiServices.brightdata && aiServices.perplexity) {
        console.log(`[Vercel] Starting background analysis for ${websiteUrl}`);
        // Fire and forget - don't await
        Promise.resolve().then(async () => {
          try {
            const scrapedData = await aiServices.brightdata.scrapeWebsite(websiteUrl);
            const analysis = await aiServices.perplexity.analyzeWebsite(scrapedData);
            
            if (analysis && session) {
              await storage.updateConsultationSession(session.id, {
                websiteAnalysis: JSON.stringify(analysis),
                businessSummary: analysis.businessName || businessName
              });
            }
          } catch (error) {
            console.error('[Vercel] Background analysis error:', error);
          }
        });
      }

      res.json({
        success: true,
        session,
        websiteAnalysis: quickSummary,
        firstQuestion: {
          text: greeting,
          suggestions: []
        }
      });
      
    } catch (error: any) {
      console.error('Consultation start error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to start consultation' 
      });
    }
  });

  // Get messages endpoint
  app.get("/api/messages", async (req, res) => {
    try {
      const storage = await getStorage();
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create message endpoint
  app.post("/api/messages", async (req, res) => {
    try {
      const storage = await getStorage();
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });

  // Get current consultation session
  app.get("/api/consultation/current", async (req, res) => {
    try {
      const storage = await getStorage();
      const session = await storage.getCurrentConsultationSession();
      if (!session) {
        return res.status(404).json({ error: "No active consultation session" });
      }
      res.json({ session });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultation session" });
    }
  });

  // Respond to consultation
  app.post("/api/consultation/respond", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get storage
      const storage = await getStorage();
      
      // Save user message
      await storage.createMessage({
        content: message,
        isUser: true,
        messageType: "text",
        quickReplies: null,
      });

      // Generate AI response if Gemini is available
      let aiResponse = "Thank you for sharing that. Based on your coaching business, I recommend starting with automated lead capture and client onboarding systems. Would you like to explore specific automation tools?";
      let suggestions = ["Yes, show me the tools", "Tell me more about automation", "What's the ROI?", "I have questions"];
      
      if (aiServices.gemini) {
        try {
          const session = await storage.getCurrentConsultationSession();
          const context = session ? JSON.parse(session.websiteAnalysis || '{}') : {};
          
          const prompt = `You are an AI automation consultant for coaches. The user said: "${message}". 
          Business context: ${JSON.stringify(context).slice(0, 500)}
          Provide a helpful, conversational response focused on automation opportunities. Keep it under 100 words.`;
          
          aiResponse = await aiServices.gemini.generateText(prompt);
        } catch (error) {
          console.error('Gemini generation error:', error);
        }
      }

      // Save AI response
      await storage.createMessage({
        content: aiResponse,
        isUser: false,
        messageType: "text",
        quickReplies: JSON.stringify(suggestions),
      });

      res.json({
        success: true,
        response: aiResponse,
        suggestions,
        isComplete: false
      });

    } catch (error: any) {
      console.error('Consultation respond error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process response' 
      });
    }
  });

  console.log('[Vercel] Routes registered successfully');
}