import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple handler without Express to avoid runtime issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url?.split('?')[0] || '';
  
  console.log(`[Vercel] ${method} ${path}`);
  
  try {
    // Health check endpoint
    if (path === '/api/health' && method === 'GET') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
          hasDatabase: !!process.env.DATABASE_URL,
          hasGemini: !!process.env.GEMINI_API_KEY,
          hasPerplexity: !!process.env.PERPLEXITY_API_KEY,
          hasBrightData: !!process.env.BRIGHTDATA_API_KEY,
        }
      });
    }

    // Start consultation endpoint
    if (path === '/api/consultation/start' && method === 'POST') {
      const { websiteUrl, email } = req.body || {};
      
      if (!websiteUrl || !email) {
        return res.status(400).json({ 
          error: "Website URL and email are required" 
        });
      }

      // Parse URL for business name
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

      const quickSummary = {
        businessName,
        businessType: "Coaching",
        targetAudience: "Coaches and Consultants",
        services: ["Coaching Services", "Consulting", "Training"],
        challenges: ["Lead generation", "Client onboarding", "Follow-up automation"],
        specificTools: ["AI Chatbot", "Email Automation", "Scheduling", "CRM"],
        implementations: ["Automate lead capture", "Streamline onboarding", "Improve follow-up"]
      };

      return res.status(200).json({
        success: true,
        session: {
          id: Date.now(),
          websiteUrl,
          email,
          businessSummary: `${businessName} - Coaching Business`,
        },
        websiteAnalysis: quickSummary,
        firstQuestion: {
          text: `Hi! I'm analyzing ${businessName} to create your personalized automation plan. Let me start by asking - what's your name?`,
          suggestions: []
        }
      });
    }

    // Free build submission endpoint
    if (path === '/api/free-build-submission' && method === 'POST') {
      const { name, email, website, biggestTimeSuck, automationDetails, shareResults } = req.body || {};
      
      console.log('Free Build Request Received:', {
        name,
        email,
        website,
        biggestTimeSuck,
        automationDetails,
        shareResults
      });

      return res.status(200).json({ 
        success: true,
        message: 'Your free automation slot is locked! We\'ll reach out within 24 hours.'
      });
    }

    // Start chat consultation
    if (path === '/api/consultation/start-chat' && method === 'POST') {
      const { sessionId } = req.body || {};
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      return res.status(200).json({
        success: true,
        session: { id: sessionId },
        firstQuestion: {
          text: "Great! Let me understand your coaching business better. What's the main challenge you're facing with lead generation and client management?",
          suggestions: [
            "Too many manual tasks",
            "Missing follow-ups",
            "No time for marketing",
            "Need better systems"
          ]
        }
      });
    }

    // Consultation respond
    if (path === '/api/consultation/respond' && method === 'POST') {
      const { message } = req.body || {};
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const aiResponse = "Thank you for sharing that. Based on your coaching business, I recommend starting with automated lead capture and client onboarding systems. Would you like to explore specific automation tools?";
      const suggestions = ["Yes, show me the tools", "Tell me more about automation", "What's the ROI?", "I have questions"];

      return res.status(200).json({
        success: true,
        response: aiResponse,
        suggestions,
        isComplete: false
      });
    }

    // Reset consultation
    if (path === '/api/consultation/reset' && method === 'POST') {
      return res.status(200).json({ success: true });
    }

    // AI Agent Expert submission
    if (path === '/api/ai-agent-expert' && method === 'POST') {
      const formData = req.body || {};
      console.log('AI Agent Expert Request:', formData);
      
      return res.status(200).json({
        success: true,
        message: 'Your AI agent request has been received. We\'ll contact you within 24 hours.'
      });
    }

    // Get messages
    if (path === '/api/messages' && method === 'GET') {
      return res.status(200).json([]);
    }

    // Create message
    if (path === '/api/messages' && method === 'POST') {
      const messageData = req.body || {};
      return res.status(201).json({
        id: Date.now(),
        ...messageData
      });
    }

    // Get current consultation session
    if (path === '/api/consultation/current' && method === 'GET') {
      return res.status(200).json({ 
        session: null
      });
    }

    // Get consultation results
    if (path?.startsWith('/api/consultation/results') && method === 'GET') {
      return res.status(200).json({
        session: {
          id: 1,
          websiteUrl: '',
          businessSummary: 'Coaching Business',
          completedAt: new Date()
        },
        userResponses: {},
        finalAnalysis: ''
      });
    }

    // Projects endpoints
    if (path === '/api/projects' && method === 'GET') {
      return res.status(200).json([]);
    }

    if (path === '/api/projects' && method === 'POST') {
      const project = req.body || {};
      return res.status(200).json({
        id: Date.now(),
        ...project
      });
    }

    // Default 404 for unmatched routes
    return res.status(404).json({ 
      error: 'Not found',
      path,
      method 
    });

  } catch (error: any) {
    console.error('[Vercel] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}