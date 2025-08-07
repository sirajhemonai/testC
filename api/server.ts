import type { Express } from 'express';

// Simplified routes for Vercel deployment
export async function registerRoutes(app: Express) {
  // Import only essential services for Vercel
  const services = await loadServices();
  
  // Consultation start endpoint
  app.post('/api/consultation/start', async (req, res) => {
    try {
      const { url, email } = req.body;
      
      if (!url || !email) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL and email are required' 
        });
      }

      // Initialize analysis services
      const analysisId = Date.now().toString();
      
      // Return success to allow navigation
      res.json({ 
        success: true, 
        analysisId,
        message: 'Analysis started'
      });
      
    } catch (error: any) {
      console.error('Consultation start error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to start analysis' 
      });
    }
  });

  // Analysis status endpoint
  app.get('/api/analysis/:id/status', async (req, res) => {
    try {
      // Return mock status for now
      res.json({
        status: 'complete',
        progress: 100,
        currentStep: 'Generating recommendations',
        data: {
          businessInfo: {
            businessName: 'Your Business',
            industry: 'Coaching',
            targetAudience: 'Coaches and consultants'
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message || 'Failed to get status' 
      });
    }
  });

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      // Simple response for testing
      res.json({
        response: "I understand you're looking for automation solutions. Let me help you identify the best opportunities for your business.",
        suggestions: [
          "Tell me about your business",
          "What are your main challenges?",
          "How many clients do you have?",
          "What tools do you currently use?"
        ]
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message || 'Chat error' 
      });
    }
  });

  // Recommendations endpoint
  app.post('/api/recommendations', async (req, res) => {
    try {
      res.json({
        recommendations: [
          {
            title: "Lead Generation Automation",
            description: "Automate your lead capture and qualification process",
            impact: "High",
            effort: "Medium",
            tools: ["Zapier", "Make"],
            timeToImplement: "1-2 weeks"
          }
        ]
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message || 'Failed to generate recommendations' 
      });
    }
  });

  console.log('Vercel routes registered successfully');
}

// Load services with error handling
async function loadServices() {
  try {
    // Check for required environment variables
    const requiredVars = ['DATABASE_URL', 'GEMINI_API_KEY', 'PERPLEXITY_API_KEY'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    return {
      available: true,
      missing
    };
  } catch (error) {
    console.error('Error loading services:', error);
    return {
      available: false,
      error
    };
  }
}