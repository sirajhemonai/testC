import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

const sessionsRouter = Router();

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
sessionsRouter.use(requireAdmin);

// Get all consultation sessions
sessionsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const sessions = await storage.getAllConsultationSessions();
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Get a specific session by ID
sessionsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const session = await storage.getConsultationSession(id);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Delete a session
sessionsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if session exists
    const session = await storage.getConsultationSession(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    await storage.deleteConsultationSession(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// Export sessions data in various formats  
sessionsRouter.get("/export", async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || "json";
    const sessions = await storage.getAllConsultationSessions();
    
    if (format === "csv") {
      // Convert sessions to CSV
      const headers = [
        "ID",
        "Business Name", 
        "Website URL",
        "Status",
        "Current Step",
        "Created At",
        "Updated At",
        "User Responses",
        "Business Summary"
      ];
      
      const csvData = sessions.map(session => {
        const businessName = session.businessSummary 
          ? JSON.parse(session.businessSummary).businessName || "Unknown"
          : "Unknown";
          
        return [
          session.id,
          `"${businessName}"`,
          `"${session.websiteUrl || ""}"`,
          session.isComplete ? "Complete" : "In Progress",
          `${session.currentStep}/6`,
          `"${session.createdAt}"`,
          `"${session.updatedAt}"`,
          `"${session.userResponses || "{}"}"`,
          `"${session.businessSummary || ""}"`
        ].join(",");
      });
      
      const csv = [headers.join(","), ...csvData].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=consultation-sessions.csv");
      res.send(csv);
    } else {
      // Return as JSON
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=consultation-sessions.json");
      res.json(sessions);
    }
  } catch (error) {
    console.error("Error exporting sessions:", error);
    res.status(500).json({ error: "Failed to export sessions" });
  }
});

export default sessionsRouter;