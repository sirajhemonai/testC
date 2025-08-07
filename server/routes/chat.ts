import { Router } from "express";
import { z } from "zod";
import { insertMessageSchema } from "../../shared/schema";
import { storage } from "../storage";
import { chatbotModeService } from "../services/chatbot-mode";

const router = Router();

// Get chat mode configuration
router.get("/chat/mode", async (req, res) => {
  try {
    const activeMode = await storage.getActiveChatbotMode();
    if (!activeMode) {
      res.status(404).json({ message: "No active chatbot mode" });
      return;
    }
    
    res.json({
      mode: activeMode.mode,
      welcomeMessage: activeMode.welcomeMessage,
      tone: activeMode.tone
    });
  } catch (error) {
    console.error("Error fetching chat mode:", error);
    res.status(500).json({ message: "Failed to fetch chat mode" });
  }
});

// Handle chat messages with mode-specific processing
router.post("/chat/message", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      res.status(400).json({ message: "Message and sessionId are required" });
      return;
    }
    
    // Save user message
    await storage.createMessage({
      content: message,
      isUser: true,
      messageType: "text",
      quickReplies: null
    });
    
    // Process message based on active chatbot mode
    const result = await chatbotModeService.processMessage(message, sessionId);
    
    // Save bot response
    const botMessage = await storage.createMessage({
      content: result.response,
      isUser: false,
      messageType: result.requiresInput ? "lead_gen" : "text",
      quickReplies: result.quickReplies || null
    });
    
    res.json({
      message: botMessage,
      quickReplies: result.quickReplies,
      requiresInput: result.requiresInput,
      recommendations: result.recommendations
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ message: "Failed to process message" });
  }
});

// Get lead data for a session
router.get("/chat/lead/:sessionId", async (req, res) => {
  try {
    const lead = await storage.getLeadBySessionId(req.params.sessionId);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }
    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Failed to fetch lead" });
  }
});

// Update lead data
router.put("/chat/lead/:sessionId", async (req, res) => {
  try {
    const lead = await storage.getLeadBySessionId(req.params.sessionId);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }
    
    const updatedLead = await storage.updateLead(lead.id, req.body);
    res.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Failed to update lead" });
  }
});

export default router;