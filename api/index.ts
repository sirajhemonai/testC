import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { insertMessageSchema, insertConsultationSessionSchema } from '../shared/schema';

// Create Express app instance
const app = express();

// Configure body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS for production
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Load AI services conditionally
async function loadAIServices() {
  const services: any = {};
  
  try {
    if (process.env.GEMINI_API_KEY) {
      const geminiModule = await import('../server/services/gemini');
      services.gemini = geminiModule;
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
      createConsultationSession: async (data: any) => ({ id: 1, ...data, updatedAt: new Date() }),
      updateConsultationSession: async () => {},
      getCurrentConsultationSession: async () => null,
      getConsultationSession: async (id: number) => ({ id, updatedAt: new Date() }),
      completeConsultationSession: async (id: number) => {},
      getLastCompletedConsultationSession: async () => null,
      createMessage: async (data: any) => ({ id: 1, ...data }),
      getAllMessages: async () => [],
      getProjects: async () => [],
      createProject: async (data: any) => ({ id: 1, ...data }),
      updateProject: async (id: number, data: any) => ({ id, ...data }),
      deleteProject: async (id: number) => {},
    };
  }
}

// Initialize services
let aiServices: any = null;

// Register routes
async function registerRoutes() {
  if (!aiServices) {
    aiServices = await loadAIServices();
  }
  
  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
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
    } else {
      health.database = {
        connected: false,
        error: 'DATABASE_URL not configured'
      };
    }

    res.json(health);
  });

  // Start consultation endpoint
  app.post("/api/consultation/start", async (req: Request, res: Response) => {
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
        quickReplies: [],
      });

      // Start background analysis if services available
      if (aiServices?.brightdata && aiServices?.perplexity) {
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
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create message endpoint
  app.post("/api/messages", async (req: Request, res: Response) => {
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
  app.get("/api/consultation/current", async (req: Request, res: Response) => {
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
  app.post("/api/consultation/respond", async (req: Request, res: Response) => {
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
        quickReplies: [],
      });

      // Generate AI response if Gemini is available
      let aiResponse = "Thank you for sharing that. Based on your coaching business, I recommend starting with automated lead capture and client onboarding systems. Would you like to explore specific automation tools?";
      let suggestions = ["Yes, show me the tools", "Tell me more about automation", "What's the ROI?", "I have questions"];
      
      if (aiServices?.gemini) {
        try {
          const session = await storage.getCurrentConsultationSession();
          const context = session ? JSON.parse(session.websiteAnalysis || '{}') : {};
          
          const prompt = `You are an AI automation consultant for coaches. The user said: "${message}". 
          Business context: ${JSON.stringify(context).slice(0, 500)}
          Provide a helpful, conversational response focused on automation opportunities. Keep it under 100 words.`;
          
          const { generateText } = aiServices.gemini;
          aiResponse = await generateText(prompt);
        } catch (error) {
          console.error('Gemini generation error:', error);
        }
      }

      // Save AI response
      await storage.createMessage({
        content: aiResponse,
        isUser: false,
        messageType: "text",
        quickReplies: suggestions,
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

  // Free Build Submission endpoint
  app.post("/api/free-build-submission", async (req: Request, res: Response) => {
    try {
      const { name, email, website, biggestTimeSuck, automationDetails, shareResults } = req.body;
      
      // Simple email notification (without nodemailer on Vercel)
      console.log('Free Build Request Received:', {
        name,
        email,
        website,
        biggestTimeSuck,
        automationDetails,
        shareResults
      });

      // You can integrate with a service like SendGrid or store in database
      // For now, just log and return success
      res.json({ 
        success: true,
        message: 'Your free automation slot is locked! We\'ll reach out within 24 hours.'
      });
      
    } catch (error: any) {
      console.error("Free build submission error:", error);
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  // Start chat consultation
  app.post("/api/consultation/start-chat", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const storage = await getStorage();
      const session = await storage.getConsultationSession(parseInt(sessionId));
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Generate first question
      const firstQuestion = {
        text: "Great! Let me understand your coaching business better. What's the main challenge you're facing with lead generation and client management?",
        suggestions: [
          "Too many manual tasks",
          "Missing follow-ups",
          "No time for marketing",
          "Need better systems"
        ]
      };

      res.json({
        success: true,
        session,
        firstQuestion
      });
      
    } catch (error: any) {
      console.error("Error starting chat consultation:", error);
      res.status(500).json({ error: "Failed to start chat consultation" });
    }
  });

  // Reset consultation
  app.post("/api/consultation/reset", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      await storage.clearMessages();
      const session = await storage.getCurrentConsultationSession();
      if (session) {
        await storage.completeConsultationSession(session.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset consultation" });
    }
  });

  // AI Agent Expert submission
  app.post("/api/ai-agent-expert", async (req: Request, res: Response) => {
    try {
      const formData = req.body;
      
      console.log('AI Agent Expert Request:', formData);
      
      // Process the AI agent expert request
      // You can store in database or send notifications
      
      res.json({
        success: true,
        message: 'Your AI agent request has been received. We\'ll contact you within 24 hours.'
      });
      
    } catch (error: any) {
      console.error("AI agent expert submission error:", error);
      res.status(500).json({ error: "Failed to submit AI agent request" });
    }
  });

  // Get consultation results
  app.get("/api/consultation/results/:sessionId?", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const storage = await getStorage();
      let session;
      
      if (sessionId) {
        session = await storage.getConsultationSession(parseInt(sessionId));
      } else {
        // Get the most recent completed session
        session = await storage.getLastCompletedConsultationSession();
      }
      
      if (!session) {
        return res.status(404).json({ error: "No completed consultation found" });
      }
      
      // Parse user responses
      const userResponses = JSON.parse(session.userResponses || "{}");
      
      res.json({
        session: {
          id: session.id,
          websiteUrl: session.websiteUrl,
          businessSummary: session.businessSummary,
          completedAt: session.updatedAt
        },
        userResponses,
        finalAnalysis: session.finalAnalysis || ""
      });
    } catch (error) {
      console.error("Error fetching consultation results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const projects = await storage.getProjects() || [];
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const project = await storage.createProject(req.body) || { id: 1, ...req.body };
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  console.log('[Vercel] Routes registered successfully');
}

// Initialize routes on first call
let routesInitialized = false;
const initPromise = registerRoutes().then(() => {
  routesInitialized = true;
  console.log('Routes initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize routes:', error);
});

// Vercel serverless function handler
const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Wait for routes to be initialized
  if (!routesInitialized) {
    await initPromise;
  }
  
  // Pass the request to Express
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error('Handler error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default handler;