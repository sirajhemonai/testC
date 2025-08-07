import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  quickReplies: text("quick_replies").array(),
  messageType: text("message_type").default("text"), // text, question, analysis
});

export const consultationSessions = pgTable("consultation_sessions", {
  id: serial("id").primaryKey(),
  websiteUrl: text("website_url"),
  email: text("email"), // User's email address
  businessSummary: text("business_summary"),
  websiteAnalysis: text("website_analysis"), // Store website analysis JSON
  currentStep: integer("current_step").default(0),
  userResponses: text("user_responses").default("{}"), // JSON string
  painMatrix: text("pain_matrix").default("{}"), // Pain bucket scores {bucket: score}
  persona: text("persona"), // Assigned coach persona
  confidenceScores: text("confidence_scores").default("{}"), // Automation confidence scores
  isComplete: boolean("is_complete").default(false),
  finalAnalysis: text("final_analysis"), // HTML content of the final analysis
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  isUser: true,
  quickReplies: true,
  messageType: true,
});

export const insertConsultationSessionSchema = createInsertSchema(consultationSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertConsultationSession = z.infer<typeof insertConsultationSessionSchema>;
export type ConsultationSession = typeof consultationSessions.$inferSelect;

// Admin settings table for storing prompts
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., "consultation_system", "industry_research"
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: text("category").notNull(), // e.g., "gemini", "perplexity", "system"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by"),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Projects table for past projects showcase
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"), // URL to thumbnail image
  youtubeUrl: text("youtube_url"), // YouTube video URL
  category: text("category").notNull(), // e.g., "Lead Generation", "Email Automation", "CRM Integration"
  clientName: text("client_name"),
  industry: text("industry"), // e.g., "Coaching", "E-commerce", "SaaS"
  results: text("results"), // Key results achieved
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// API keys table for secure storage
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "GEMINI_API_KEY", "PERPLEXITY_API_KEY"
  displayName: text("display_name").notNull(),
  description: text("description"),
  value: text("value").notNull(), // Will be encrypted in production
  service: text("service").notNull(), // e.g., "gemini", "perplexity", "brightdata"
  isActive: boolean("is_active").default(true).notNull(),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// Admin users table to track who can access admin panel
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  permissions: text("permissions").default("{}"), // JSON string for granular permissions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Training data table for MCP Server
export const trainingFiles = pgTable("training_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  content: text("content"), // Extracted text content
  metadata: text("metadata").default("{}"), // JSON string for file metadata
  status: text("status").default("pending").notNull(), // pending, processing, completed, failed
  error: text("error"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  uploadedBy: integer("uploaded_by"),
});

export const insertTrainingFileSchema = createInsertSchema(trainingFiles).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export type TrainingFile = typeof trainingFiles.$inferSelect;
export type InsertTrainingFile = z.infer<typeof insertTrainingFileSchema>;

// Training contexts table for storing processed training data
export const trainingContexts = pgTable("training_contexts", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => trainingFiles.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), // e.g., "product", "service", "faq", "policy"
  keywords: text("keywords").array(),
  embedding: text("embedding"), // For future vector search
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTrainingContextSchema = createInsertSchema(trainingContexts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TrainingContext = typeof trainingContexts.$inferSelect;
export type InsertTrainingContext = z.infer<typeof insertTrainingContextSchema>;

// ChatBot Mode Configuration
export const chatbotModes = pgTable("chatbot_modes", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull().unique(), // qna, lead_gen, recommendation
  isActive: boolean("is_active").default(false).notNull(),
  configuration: text("configuration").notNull(), // JSON string for mode-specific config
  systemPrompt: text("system_prompt").notNull(),
  welcomeMessage: text("welcome_message").notNull(),
  tone: text("tone").notNull(), // friendly, professional, casual, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatbotModeSchema = createInsertSchema(chatbotModes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatbotMode = typeof chatbotModes.$inferSelect;
export type InsertChatbotMode = z.infer<typeof insertChatbotModeSchema>;

// Lead Generation Fields Configuration
export const leadGenFields = pgTable("lead_gen_fields", {
  id: serial("id").primaryKey(),
  fieldName: text("field_name").notNull(),
  fieldType: text("field_type").notNull(), // text, email, phone, select, etc
  label: text("label").notNull(),
  placeholder: text("placeholder"),
  isRequired: boolean("is_required").default(true).notNull(),
  options: text("options").array(), // For select/radio fields
  validation: text("validation"), // JSON string for validation rules
  order: integer("order").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadGenFieldSchema = createInsertSchema(leadGenFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadGenField = typeof leadGenFields.$inferSelect;
export type InsertLeadGenField = z.infer<typeof insertLeadGenFieldSchema>;

// Collected Leads Data
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  data: text("data").notNull(), // JSON string storing all collected lead data
  status: text("status").default("in_progress").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Product/Service Catalog for Recommendations
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  features: text("features").array(),
  price: text("price"), // Store as text to handle various formats
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: text("metadata"), // JSON string for additional product data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
