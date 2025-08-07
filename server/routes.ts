import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConsultationSessionSchema } from "../shared/schema";
// import { analyzeWebsite } from "./services/perplexity"; // Removed - using new PerplexityService
import { generateNextQuestion, analyzeBusinessForAutomation, generateBusinessOverview } from "./services/gemini";
import { updatePainMatrix, assignPersona, generateNextQuestion as generateAdaptiveQuestion, analyzeBusinessForAutomation as analyzeWithPersona, PAIN_BUCKETS } from "./services/pain-analyzer";
import { calculateROI, generateROINarratives, extractCoachProfile } from "./services/roi-calculator";
import { PerplexityService } from "./services/perplexity";
import { BusinessAnalyzer } from "./services/business-analyzer";
import { googleSheetsService } from "./services/googleSheets";
import { adminRouter } from "./routes/admin";
import trainingRouter from "./routes/training";
import chatbotModesRouter from "./routes/chatbot-modes";
import chatRouter from "./routes/chat";
import sessionsRouter from "./routes/sessions";
import { chatbotModeService } from "./services/chatbot-mode";
import { uploadKnowledgeBase } from "./scripts/upload-kb";
import { emailService } from "./services/emailService";

import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default chatbot modes
  await chatbotModeService.initializeDefaultModes();
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
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

  // Start consultation with enhanced multi-step analysis
  app.post("/api/consultation/start", async (req, res) => {
    try {
      const { websiteUrl, email } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({ error: "Website URL is required" });
      }
      
      if (!email) {
        return res.status(400).json({ error: "Email address is required" });
      }

      // Clear previous messages
      await storage.clearMessages();

      // STEP 1: Comprehensive website analysis with BrightData scraping (OPTIMIZED)
      let fullAnalysis;
      let simpleSummary;
      let websiteAnalysis;
      let automationResearch;
      
      // FAST: Extract basic info from URL for immediate response  
      let domain = '';
      let businessName = 'Your Business';
      
      try {
        // Validate and parse URL
        let urlToParse = websiteUrl;
        if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
          urlToParse = 'https://' + urlToParse;
        }
        
        const parsedUrl = new URL(urlToParse);
        domain = parsedUrl.hostname.replace('www.', '');
        businessName = domain.split('.')[0].replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } catch (urlError) {
        console.error('URL parsing error:', urlError);
        // Use fallback name from URL string
        businessName = websiteUrl.replace(/https?:\/\//, '').replace('www.', '').split(/[.\/]/)[0] || 'Your Business';
      }

      // Create quick summary for immediate response
      const quickSummary = {
        businessName: businessName,
        businessType: "Business",
        targetAudience: "Customers and Clients",
        services: ["Professional Services", "Customer Support", "Business Operations"],
        challenges: ["Manual processes", "Time-consuming tasks", "Customer follow-up"],
        specificTools: ["AI Chatbot", "Email Automation", "Lead Scoring", "Workflow Automation", "Analytics"],
        implementations: ["Automate customer inquiries", "Set up email sequences", "Streamline processes"]
      };

      // Create session immediately for chat
      const session = await storage.createConsultationSession({
        websiteUrl,
        email,
        businessSummary: `${businessName} - Analysis in progress...`,
        websiteAnalysis: JSON.stringify(quickSummary),
        currentStep: 0,
        userResponses: JSON.stringify({ 
          businessType: "Business",
          targetAudience: "Customers and Clients"
        }),
        isComplete: false,
      });

      const quickGreeting = `Hi! I'm analyzing ${businessName} right now and preparing your personalized automation plan. This will just take a moment - let's start with your name while I finish the analysis.`;
      
      await storage.createMessage({
        content: quickGreeting,
        isUser: false,
        messageType: "question",
        quickReplies: null,
      });

      // RETURN IMMEDIATELY for fast UX
      res.json({
        success: true,
        session,
        websiteAnalysis: quickSummary,
        firstQuestion: {
          content: quickGreeting,
          quickReplies: null
        }
      });

      // START BACKGROUND ANALYSIS (keeps all your BrightData + AI analysis)
      setImmediate(async () => {
        try {
          console.log(`[Background] Starting FULL analysis for: ${websiteUrl}`);
          const businessAnalyzer = new BusinessAnalyzer();
          
          try {
            const fullAnalysis = await businessAnalyzer.analyzeWebsite(websiteUrl);
            const simpleSummary = businessAnalyzer.extractSimpleSummary(fullAnalysis as any);
            
            console.log('[Background] BrightData analysis complete:', {
              businessName: simpleSummary.businessName,
              businessType: simpleSummary.businessType,
              targetAudience: simpleSummary.targetAudience,
              servicesCount: simpleSummary.services.length
            });
            
            const websiteAnalysis = {
              summary: `${simpleSummary.businessName} is a ${simpleSummary.businessType} company serving ${simpleSummary.targetAudience}. Key services include: ${simpleSummary.services.join(', ')}.`,
              businessType: simpleSummary.businessType,
              targetAudience: simpleSummary.targetAudience,
              services: simpleSummary.services,
              challenges: (fullAnalysis as any).pain_points?.map((p: any) => p.description) || []
            };
            
            const automationResearch = {
              recommendations: (fullAnalysis as any).top_3_recommendations?.map((r: any) => r.summary).join('\n') || '',
              specificTools: (fullAnalysis as any).automation_opportunities?.map((a: any) => a.title) || [],
              implementations: (fullAnalysis as any).top_3_recommendations?.flatMap((r: any) => r.ninety_day_plan?.phase_1_pilot) || []
            };

            // Add Perplexity research  
            try {
              const { PerplexityService } = await import("./services/perplexity");
              const perplexityService = new PerplexityService();
              const perplexityResearch = await perplexityService.researchAutomationSolutions(
                websiteAnalysis.businessType,
                websiteAnalysis.targetAudience,
                websiteAnalysis.challenges
              );
              
              automationResearch.recommendations = perplexityResearch.recommendations || automationResearch.recommendations;
              console.log('[Background] Perplexity research complete');
            } catch (perplexityError) {
              console.error("[Background] Perplexity research failed:", perplexityError);
            }
            
            // Update session with FULL analysis
            await storage.updateConsultationSession(session.id, {
              businessSummary: websiteAnalysis.summary,
              websiteAnalysis: JSON.stringify(websiteAnalysis),
              userResponses: JSON.stringify({ 
                businessType: websiteAnalysis.businessType,
                targetAudience: websiteAnalysis.targetAudience,
                automationResearch: automationResearch,
                fullAnalysisComplete: true
              })
            });
            
            console.log(`[Background] FULL analysis complete for session ${session.id}`);
          } catch (analysisError) {
            console.error("[Background] Analysis failed:", analysisError);
          }
        } catch (backgroundError) {
          console.error("[Background] Background process failed:", backgroundError);
        }
      });

      return; // Exit early since we already sent response
    } catch (error) {
      console.error("Quick start error:", error);
      res.status(500).json({ error: "Failed to start consultation. Please try again." });
    }
  });

  // Handle user response and continue consultation
  app.post("/api/consultation/respond", async (req, res) => {
    try {
      const { response } = req.body;
      
      if (!response) {
        return res.status(400).json({ error: "Response is required" });
      }

      const session = await storage.getCurrentConsultationSession();
      if (!session) {
        return res.status(400).json({ error: "No active consultation session" });
      }

      // Save user response
      await storage.createMessage({
        content: response,
        isUser: true,
        messageType: "text",
        quickReplies: null,
      });

      // Update session with user response
      const userResponses = JSON.parse(session.userResponses || "{}");
      
      if (session.currentStep === 0) {
        // Step 0: Collect name
        userResponses.name = response;
        
        // Simple fast question generation for better UX
        const quickQuestions = [
          {
            content: `Nice to meet you, ${response}! What's your biggest time-consuming challenge right now? What takes up most of your day that you wish you could automate?`,
            quickReplies: [
              "Lead follow-up takes forever", 
              "Client onboarding is manual",
              "Content creation is time-consuming",
              "Customer support queries"
            ]
          }
        ];
        
        const nextQuestion = quickQuestions[0];
        
        await storage.createMessage({
          content: nextQuestion.content,
          isUser: false,
          messageType: "question",
          quickReplies: nextQuestion.quickReplies,
        });
        
        await storage.updateConsultationSession(session.id, {
          currentStep: 1,
          userResponses: JSON.stringify(userResponses),
        });
        
        res.json({
          success: true,
          isComplete: false,
          message: "Name collected, asking for automation goals"
        });
      } else if (session.currentStep === 1) {
        // Step 1: Collect automation goals
        userResponses.automationGoals = response;
        
        // Generate first business question (step 1 of 5)
        const firstQuestion = await generateNextQuestion(
          session.businessSummary || "",
          1,
          userResponses
        );
        
        await storage.createMessage({
          content: firstQuestion.question,
          isUser: false,
          messageType: "question",
          quickReplies: firstQuestion.quickReplies,
        });
        
        await storage.updateConsultationSession(session.id, {
          currentStep: 2,
          userResponses: JSON.stringify(userResponses),
        });
        
        res.json({
          success: true,
          isComplete: false,
          nextQuestion: firstQuestion
        });
      } else {
        // Steps 2-3: Business questions - simplified flow (removed steps 3 & 4)
        const fieldMapping = {
          2: 'painPoint',           // What would give you back the most time
          3: 'currentTools'         // What tools are you using
        };
        
        const fieldName = fieldMapping[session.currentStep as keyof typeof fieldMapping];
        if (fieldName && session.currentStep) {
          userResponses[fieldName] = response;
        }
        
        const nextStep = (session.currentStep || 0) + 1;
        await storage.updateConsultationSession(session.id, {
          currentStep: nextStep,
          userResponses: JSON.stringify(userResponses),
        });

        if (nextStep > 3) {
          // Generate final automation analysis
          const finalAnalysis = await analyzeBusinessForAutomation(
            session.businessSummary || "",
            userResponses.automationGoals || "",
            userResponses
          );

          // Don't show analysis in chat, just save a completion message
          await storage.createMessage({
            content: "🎉 Excellent! I've analyzed all your responses and prepared your personalized automation roadmap. Redirecting you to see your full recommendations...",
            isUser: false,
            messageType: "text",
            quickReplies: null,
          });

          await storage.completeConsultationSession(session.id);
          
          // Save the analysis data for the results page
          await storage.updateConsultationSession(session.id, {
            finalAnalysis: finalAnalysis
          });

          // Send email notification with session data
          try {
            const messages = await storage.getAllMessages();
            const updatedSession = await storage.getConsultationSession(session.id);
            const emailData = {
              id: session.id,
              businessName: JSON.parse(updatedSession?.websiteAnalysis || '{}')?.businessName || 'Unknown Business',
              websiteUrl: session.websiteUrl,
              email: session.email,
              businessType: JSON.parse(updatedSession?.websiteAnalysis || '{}')?.businessType || 'Unknown',
              websiteAnalysis: updatedSession?.websiteAnalysis,
              consultationData: {
                painMatrix: updatedSession?.painMatrix,
                persona: updatedSession?.persona,
                isComplete: true
              },
              messages: messages,
              finalAnalysis: finalAnalysis
            };
            
            await emailService.sendSessionData(emailData);
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Continue even if email fails
          }
          
          res.json({
            success: true,
            isComplete: true,
            finalAnalysis,
            sessionId: session.id
          });
        } else {
          // Generate next question (steps 2-4) 
          const nextQuestion = await generateNextQuestion(
            session.businessSummary || "",
            nextStep - 1, // Adjust for the new question numbering (steps 1-4)
            userResponses
          );

          await storage.createMessage({
            content: nextQuestion.question,
            isUser: false,
            messageType: "question",
            quickReplies: nextQuestion.quickReplies,
          });

          res.json({
            success: true,
            isComplete: false,
            nextQuestion
          });
        }
      }
    } catch (error) {
      console.error("Consultation response error:", error);
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("GEMINI_API_KEY")) {
          res.status(500).json({ error: "AI service configuration error. Please check API keys." });
        } else if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
          res.status(500).json({ error: "Service temporarily unavailable. Please try again." });
        } else {
          res.status(500).json({ error: "Failed to process response. Please try again." });
        }
      } else {
        res.status(500).json({ error: `Unexpected error occurred: ${String(error)}` });
      }
    }
  });

  // NEW: Adaptive Q&A consultation endpoint with real-time pain scoring
  app.post("/api/consultation/respond", async (req, res) => {
    try {
      const { sessionId, lastAnswer } = req.body;
      
      if (!sessionId || !lastAnswer) {
        return res.status(400).json({ error: "Session ID and answer are required" });
      }

      const session = await storage.getConsultationSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Parse current data
      const currentPainMatrix = JSON.parse(session.painMatrix || "{}");
      const userResponses = JSON.parse(session.userResponses || "{}");
      const currentStep = session.currentStep || 0;
      
      // Store the answer
      userResponses[`step_${currentStep}`] = lastAnswer;
      
      // Update pain matrix based on the answer
      const questionContext = userResponses[`question_${currentStep}`] || "General business question";
      const updatedPainMatrix = await updatePainMatrix(currentPainMatrix, lastAnswer, questionContext);
      
      // Check for persona assignment (when 2+ buckets surpass 7/10)
      const currentPersona = session.persona ? JSON.parse(session.persona) : null;
      const newPersona = assignPersona(updatedPainMatrix);
      
      // Generate next question with adaptive targeting
      const previousQuestions = Object.keys(userResponses)
        .filter(key => key.startsWith('question_'))
        .map(key => userResponses[key]);
      
      const nextQuestion = await generateAdaptiveQuestion(
        updatedPainMatrix,
        previousQuestions,
        session.businessSummary || ""
      );
      
      // Update session
      const nextStep = currentStep + 1;
      await storage.updateConsultationSession(sessionId, {
        currentStep: nextStep,
        userResponses: JSON.stringify(userResponses),
        painMatrix: JSON.stringify(updatedPainMatrix),
        persona: newPersona ? JSON.stringify(newPersona) : session.persona
      });

      // Check if consultation should complete (e.g., after 6 questions or high confidence)
      const shouldComplete = nextStep >= 6 || Object.values(updatedPainMatrix).some(score => score >= 9);
      
      if (shouldComplete) {
        // Generate ROI-prioritized recommendations
        const coachProfile = extractCoachProfile(session.businessSummary || "", userResponses);
        const automationRecipes = Object.keys(PAIN_BUCKETS).map(bucket => bucket.toLowerCase());
        const roiMetrics = calculateROI(automationRecipes, coachProfile);
        const narratives = await generateROINarratives(roiMetrics, coachProfile);
        
        // Generate final analysis with persona and ROI data
        const finalAnalysis = await analyzeWithPersona(
          updatedPainMatrix,
          newPersona || currentPersona,
          userResponses,
          session.businessSummary || ""
        );

        // Save final data
        await storage.updateConsultationSession(sessionId, {
          isComplete: true,
          finalAnalysis: finalAnalysis.analysis,
          confidenceScores: JSON.stringify({
            roiMetrics,
            narratives,
            recommendations: finalAnalysis.recommendations
          })
        });

        res.json({
          success: true,
          isComplete: true,
          painMatrix: updatedPainMatrix,
          persona: newPersona || currentPersona,
          roiMetrics,
          narratives,
          recommendations: finalAnalysis.recommendations
        });
      } else {
        res.json({
          success: true,
          isComplete: false,
          nextQuestion,
          painMatrix: updatedPainMatrix,
          persona: newPersona || currentPersona,
          confidenceLevel: Math.max(...Object.values(updatedPainMatrix))
        });
      }
    } catch (error) {
      console.error("Adaptive consultation error:", error);
      res.status(500).json({ error: "Failed to process consultation response" });
    }
  });

  // Get current consultation session
  app.get("/api/consultation/current", async (req, res) => {
    try {
      const session = await storage.getCurrentConsultationSession();
      res.json({ session });
    } catch (error) {
      res.status(500).json({ error: "Failed to get current session" });
    }
  });

  // Start chat consultation (from summary page)
  app.post("/api/consultation/start-chat", async (req, res) => {
    try {
      const session = await storage.getCurrentConsultationSession();
      if (!session) {
        return res.status(404).json({ error: "No active session found" });
      }

      // Check if consultation already has messages
      const messages = await storage.getAllMessages();
      if (messages && messages.length > 0) {
        return res.json({ success: true, message: "Chat already started" });
      }

      // Parse the website analysis to get business name
      let businessName = "your business";
      try {
        const analysis = JSON.parse(session.websiteAnalysis || "{}");
        businessName = analysis.businessName || businessName;
      } catch (e) {
        console.log("Could not parse website analysis for business name");
      }

      // Create initial greeting message to start the conversation
      const greeting = `Hi! I've finished analyzing ${businessName} and I'm ready to create your personalized automation strategy. Let's start with a quick introduction - what's your name?`;
      
      await storage.createMessage({
        content: greeting,
        isUser: false,
        messageType: "question",
        quickReplies: null,
      });

      res.json({ 
        success: true, 
        message: "Chat consultation started",
        greeting 
      });
    } catch (error) {
      console.error("Error starting chat consultation:", error);
      res.status(500).json({ error: "Failed to start chat consultation" });
    }
  });

  // Reset consultation
  app.post("/api/consultation/reset", async (req, res) => {
    try {
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

  // Projects API
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(parseInt(req.params.id), req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Free Build Submission
  app.post("/api/free-build-submission", async (req, res) => {
    try {
      const { name, email, website, biggestTimeSuck, automationDetails, shareResults } = req.body;
      
      // Send admin notification email
      await emailService.sendAdminNotificationEmail(
        'New Free Build Request',
        `
        <h2>New Free Build Request Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Website:</strong> ${website}</p>
        <p><strong>Biggest Time-Suck:</strong> ${biggestTimeSuck}</p>
        <p><strong>Automation Details:</strong> ${automationDetails}</p>
        <p><strong>Agreed to Share Results:</strong> ${shareResults ? 'Yes' : 'No'}</p>
        `
      );
      
      // Send confirmation email to user
      await emailService.sendConfirmationEmail(
        email,
        `Hi ${name},\n\nYour free automation slot is locked! 🎉\n\nWe'll reach out within 24 hours to schedule your 15-minute kickoff call.\n\nWhat happens next:\n1. We'll review your automation request\n2. Schedule a quick call to finalize details\n3. Build your automation within 72 hours\n\nTalk soon!\nThe SellSpark Team`
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Free build submission error:", error);
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  // Get consultation results for the results page
  app.get("/api/consultation/results/:sessionId?", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      let session;
      
      if (sessionId) {
        session = await storage.getConsultationSession(parseInt(sessionId));
      } else {
        // Get the most recent completed session
        session = await storage.getLastCompletedConsultationSession();
      }
      
      if (!session || !session.isComplete) {
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

  // Upload knowledge base to Pinecone (development endpoint)
  app.post("/api/upload-kb", async (req, res) => {
    try {
      console.log("Starting knowledge base upload...");
      await uploadKnowledgeBase();
      res.json({ success: true, message: "Knowledge base uploaded to Pinecone successfully" });
    } catch (error) {
      console.error("Error uploading knowledge base:", error);
      res.status(500).json({ error: "Failed to upload knowledge base", details: (error as Error).message });
    }
  });

  // Google Sheets integration endpoints
  app.post("/api/sheets/setup", async (req, res) => {
    try {
      const { spreadsheetId } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Spreadsheet ID is required" });
      }

      const success = await googleSheetsService.createSheetsStructure(spreadsheetId);
      
      if (success) {
        res.json({ success: true, message: "Google Sheets structure created successfully" });
      } else {
        res.status(500).json({ error: "Failed to create sheets structure" });
      }
    } catch (error) {
      console.error("Error setting up Google Sheets:", error);
      res.status(500).json({ error: "Failed to setup Google Sheets", details: (error as Error).message });
    }
  });

  app.post("/api/sheets/save-session", async (req, res) => {
    try {
      const { sessionId, spreadsheetId } = req.body;
      
      if (!sessionId || !spreadsheetId) {
        return res.status(400).json({ error: "Session ID and Spreadsheet ID are required" });
      }

      // Get session and messages
      const session = await storage.getConsultationSession(sessionId);
      const messages = await storage.getAllMessages();

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const success = await googleSheetsService.saveSessionToSheet(session, messages, spreadsheetId);
      
      if (success) {
        res.json({ success: true, message: "Session saved to Google Sheets successfully" });
      } else {
        res.status(500).json({ error: "Failed to save session to Google Sheets" });
      }
    } catch (error) {
      console.error("Error saving session to Google Sheets:", error);
      res.status(500).json({ error: "Failed to save session", details: (error as Error).message });
    }
  });

  // AI Agent Expert endpoint
  app.post("/api/ai-agent-expert", async (req, res) => {
    try {
      const data = req.body;
      
      // Send email notification
      const emailResult = await emailService.sendAIAgentExpertRequest(data);
      
      if (emailResult.success) {
        res.json({ 
          success: true, 
          message: "Your request has been submitted successfully. Our experts will contact you within 24 hours." 
        });
      } else {
        throw new Error(emailResult.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error processing AI Agent Expert request:", error);
      res.status(500).json({ 
        error: "Failed to submit request. Please try again or contact us directly." 
      });
    }
  });

  app.post("/api/sheets/save-all-sessions", async (req, res) => {
    try {
      const { spreadsheetId } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Spreadsheet ID is required" });
      }

      // Get all sessions
      const sessions = await storage.getAllConsultationSessions();
      let successCount = 0;
      let errorCount = 0;

      for (const session of sessions) {
        try {
          // For each session, we'd need to reconstruct the messages - this is a simplified version
          const messages: any[] = []; // In production, you'd want to store message-session relationships
          const success = await googleSheetsService.saveSessionToSheet(session, messages, spreadsheetId);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Failed to save session ${session.id}:`, error);
          errorCount++;
        }
      }

      res.json({ 
        success: true, 
        message: `Saved ${successCount} sessions successfully, ${errorCount} errors`,
        successCount,
        errorCount 
      });
    } catch (error) {
      console.error("Error saving all sessions to Google Sheets:", error);
      res.status(500).json({ error: "Failed to save sessions", details: (error as Error).message });
    }
  });

  // Test endpoint to directly show final analysis
  app.post("/api/consultation/test-final", async (req, res) => {
    try {
      // Clear existing messages
      await storage.clearMessages();
      
      // Add welcome message
      await storage.createMessage({
        content: "Hi there! I'm excited to help you discover automation opportunities for your business. Here's a sample final analysis with working accordions:",
        isUser: false,
        messageType: "text"
      });
      
      // Mock user responses for testing
      const mockUserResponses = {
        name: "John",
        businessType: "e-commerce",
        automationGoals: "lead generation and customer support"
      };
      
      // Generate fallback analysis directly
      const businessType = mockUserResponses.businessType || "business";
      const automationGoals = mockUserResponses.automationGoals || "automation";
      const name = mockUserResponses.name || "there";
      
      const analysis = `
<div style="background-color: var(--bg-primary, #fff7e6); color: var(--text-primary, #333333); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--border-color, #e0e0e0);">
  <h2 style="color: var(--text-primary, #333333); margin: 0 0 15px 0;">🎯 Your Automation Opportunities</h2>
  <p style="color: var(--text-primary, #333333); margin: 0;">Hi ${name}! Based on your ${businessType} business and interest in ${automationGoals}, here are proven automation strategies that can save you 10+ hours per week:</p>
</div>

<div style="margin-bottom: 16px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); padding: 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; color: var(--text-primary, #333333);">🚀 Lead Qualification & Follow-up Automation</h3>
    <span style="font-size: 18px; color: var(--text-primary, #333333); user-select: none;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 8px 8px; display: none; overflow: hidden;">
    <div style="padding: 16px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 10px 0;"><strong>Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 10px 20px;">
        <li>Set up automated lead scoring based on website behavior</li>
        <li>Create personalized follow-up sequences based on lead source</li>
        <li>Implement instant notification system for high-priority leads</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0;"><strong>Results:</strong> Save 8-12 hours weekly while converting 35% more leads into customers.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 16px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); padding: 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; color: var(--text-primary, #333333);">💬 Customer Support Automation</h3>
    <span style="font-size: 18px; color: var(--text-primary, #333333); user-select: none;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 8px 8px; display: none; overflow: hidden;">
    <div style="padding: 16px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 10px 0;"><strong>Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 10px 20px;">
        <li>Deploy AI chatbot for 24/7 first-line support</li>
        <li>Create automated ticket routing by issue type</li>
        <li>Set up instant escalation for complex issues</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0;"><strong>Results:</strong> Reduce response time by 80% and handle 70% of inquiries automatically.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 16px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); padding: 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; color: var(--text-primary, #333333);">📊 Data Collection & Analysis</h3>
    <span style="font-size: 18px; color: var(--text-primary, #333333); user-select: none;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 8px 8px; display: none; overflow: hidden;">
    <div style="padding: 16px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 10px 0;"><strong>Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 10px 20px;">
        <li>Automate customer data collection from multiple touchpoints</li>
        <li>Create real-time performance dashboards</li>
        <li>Set up automated reporting and alerts</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0;"><strong>Results:</strong> Eliminate manual data entry and get instant insights for better decision-making.</p>
    </div>
  </div>
</div>

<div style="background-color: var(--bg-primary, #fff7e6); color: var(--text-primary, #333333); padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid var(--border-color, #e0e0e0);">
  <h3 style="color: var(--text-primary, #333333); margin: 0 0 10px 0;">🎯 Ready to Get Started?</h3>
  <p style="color: var(--text-primary, #333333); margin: 0;">These automations can save you 10+ hours per week while growing your business. Click on each section above to see detailed implementation steps!</p>
</div>
`;
      
      // Add the analysis message
      await storage.createMessage({
        content: analysis,
        isUser: false,
        messageType: "analysis"
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error generating test analysis:", error);
      res.status(500).json({ error: "Failed to generate test analysis" });
    }
  });

  // AI Agent Expert form submission
  app.post('/api/ai-agent-expert', async (req, res) => {
    try {
      const {
        businessName,
        website,
        email,
        businessType,
        automationGoal,
        currentProcess,
        timeSpent,
        painPoints,
        teamSize,
        budget
      } = req.body;

      // Store the AI Agent Expert request
      const requestData = {
        businessName,
        website,
        email,
        businessType,
        automationGoal,
        currentProcess,
        timeSpent,
        painPoints,
        teamSize,
        budget,
        submittedAt: new Date().toISOString()
      };

      // Save to Google Sheets if available (method doesn't exist yet)
      // try {
      //   await googleSheetsService.saveAIAgentExpertRequest(requestData);
      // } catch (error) {
      //   console.log('Google Sheets not configured for AI Agent Expert requests');
      // }

      // TODO: Send email notification to admin
      console.log('[AI Agent Expert] New request submitted:', requestData);

      res.json({ 
        success: true, 
        message: 'AI Agent Expert request submitted successfully' 
      });
    } catch (error) {
      console.error('Error handling AI Agent Expert request:', error);
      res.status(500).json({ error: 'Failed to submit AI Agent Expert request' });
    }
  });

  // Generate enhanced business overview for consultation
  app.post('/api/business-overview', async (req, res) => {
    try {
      const { businessName, businessType, services, targetAudience, websiteUrl } = req.body;
      
      console.log('[Routes] Generating business overview for:', businessName);
      
      const overview = await generateBusinessOverview({
        businessName,
        businessType,
        targetAudience,
        services,
        websiteUrl
      });
      
      console.log('[Routes] Generated overview:', overview);
      
      res.json(overview);
    } catch (error) {
      console.error('[Routes] Error generating business overview:', error);
      res.json({
        businessName: req.body.businessName,
        businessType: req.body.businessType,
        coreServices: req.body.services?.slice(0, 3) || [],
        automationOpportunity: "Lead management and client communication automation",
        whatsMissing: "Systematic follow-up and nurturing process",
        trustBuilders: [
          "Automated lead generation systems to scale your coaching business",
          "Email automation sequences that convert prospects into paying clients", 
          "Marketing funnel optimization that doubles your conversion rates",
          "Social media and ads automation to reach more potential clients",
          "Client onboarding automation that saves 10+ hours per week"
        ],
        coachingSpecialty: req.body.businessType || "Professional coaching",
        targetMarket: req.body.targetAudience || "Coaching clients"
      });
    }
  });

  // Mount admin routes
  app.use("/api/admin", adminRouter);
  app.use("/api/admin/sessions", sessionsRouter);
  app.use("/api/training", trainingRouter);
  app.use("/api", chatbotModesRouter);
  app.use("/api", chatRouter);

  const httpServer = createServer(app);
  return httpServer;
}
