import { 
  users, messages, consultationSessions, prompts, apiKeys, adminUsers,
  trainingFiles, trainingContexts, chatbotModes, leadGenFields, leads, products, projects,
  type User, type InsertUser, type Message, type InsertMessage, 
  type ConsultationSession, type InsertConsultationSession,
  type Prompt, type InsertPrompt, type ApiKey, type InsertApiKey,
  type AdminUser, type InsertAdminUser,
  type TrainingFile, type InsertTrainingFile,
  type TrainingContext, type InsertTrainingContext,
  type ChatbotMode, type InsertChatbotMode,
  type LeadGenField, type InsertLeadGenField,
  type Lead, type InsertLead,
  type Product, type InsertProduct,
  type Project, type InsertProject
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, like } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageById(id: number): Promise<Message | undefined>;
  clearMessages(): Promise<void>;
  
  // Consultation session methods
  createConsultationSession(session: InsertConsultationSession): Promise<ConsultationSession>;
  getCurrentConsultationSession(): Promise<ConsultationSession | undefined>;
  getConsultationSession(id: number): Promise<ConsultationSession | undefined>;
  getLastCompletedConsultationSession(): Promise<ConsultationSession | undefined>;
  updateConsultationSession(id: number, updates: Partial<ConsultationSession>): Promise<ConsultationSession>;
  completeConsultationSession(id: number): Promise<void>;
  getAllConsultationSessions(): Promise<ConsultationSession[]>;
  deleteConsultationSession(id: number): Promise<void>;
  
  // Admin operations
  isAdmin(userId: number): Promise<boolean>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  
  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  getPrompts(): Promise<Prompt[]>;
  getPromptByKey(key: string): Promise<Prompt | undefined>;
  deletePrompt(id: number): Promise<void>;
  
  // API Key operations
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, updates: Partial<InsertApiKey>): Promise<ApiKey | undefined>;
  getApiKeys(): Promise<ApiKey[]>;
  getApiKeyByName(name: string): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<void>;
  
  // Training data operations
  getTrainingFiles(): Promise<TrainingFile[]>;
  getTrainingFile(id: number): Promise<TrainingFile | undefined>;
  createTrainingFile(file: InsertTrainingFile): Promise<TrainingFile>;
  updateTrainingFile(id: number, file: Partial<InsertTrainingFile>): Promise<TrainingFile | undefined>;
  deleteTrainingFile(id: number): Promise<void>;
  
  // Training context operations
  getTrainingContexts(fileId?: number): Promise<TrainingContext[]>;
  getTrainingContext(id: number): Promise<TrainingContext | undefined>;
  createTrainingContext(context: InsertTrainingContext): Promise<TrainingContext>;
  updateTrainingContext(id: number, context: Partial<InsertTrainingContext>): Promise<TrainingContext | undefined>;
  deleteTrainingContext(id: number): Promise<void>;
  searchTrainingContexts(query: string): Promise<TrainingContext[]>;
  
  // ChatBot Mode operations
  getChatbotModes(): Promise<ChatbotMode[]>;
  getChatbotMode(id: number): Promise<ChatbotMode | undefined>;
  getChatbotModeByMode(mode: string): Promise<ChatbotMode | undefined>;
  createChatbotMode(mode: InsertChatbotMode): Promise<ChatbotMode>;
  updateChatbotMode(id: number, updates: Partial<InsertChatbotMode>): Promise<ChatbotMode | undefined>;
  deleteChatbotMode(id: number): Promise<void>;
  getActiveChatbotMode(): Promise<ChatbotMode | undefined>;
  
  // Lead Generation Field operations
  getLeadGenFields(): Promise<LeadGenField[]>;
  getLeadGenField(id: number): Promise<LeadGenField | undefined>;
  createLeadGenField(field: InsertLeadGenField): Promise<LeadGenField>;
  updateLeadGenField(id: number, updates: Partial<InsertLeadGenField>): Promise<LeadGenField | undefined>;
  deleteLeadGenField(id: number): Promise<void>;
  getActiveLeadGenFields(): Promise<LeadGenField[]>;
  
  // Lead operations
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  getLeadBySessionId(sessionId: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<void>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getActiveProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private consultationSessions: Map<number, ConsultationSession>;
  private projects: Map<number, Project>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentSessionId: number;
  private currentProjectId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.consultationSessions = new Map();
    this.projects = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentSessionId = 1;
    this.currentProjectId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date(),
      quickReplies: insertMessage.quickReplies || null,
      messageType: insertMessage.messageType || null
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = {
      ...project,
      id,
      isActive: project.isActive ?? true,
      thumbnail: project.thumbnail || null,
      youtubeUrl: project.youtubeUrl || null,
      clientName: project.clientName || null,
      industry: project.industry || null,
      results: project.results || null,
      sortOrder: project.sortOrder || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }



  // Consultation session methods
  async createConsultationSession(insertSession: InsertConsultationSession): Promise<ConsultationSession> {
    const id = this.currentSessionId++;
    const session: ConsultationSession = {
      ...insertSession,
      id,
      email: insertSession.email || null,
      websiteUrl: insertSession.websiteUrl || null,
      businessSummary: insertSession.businessSummary || null,
      websiteAnalysis: insertSession.websiteAnalysis || null,
      currentStep: insertSession.currentStep || null,
      userResponses: insertSession.userResponses || null,
      painMatrix: insertSession.painMatrix || null,
      persona: insertSession.persona || null,
      confidenceScores: insertSession.confidenceScores || null,
      isComplete: insertSession.isComplete || null,
      finalAnalysis: insertSession.finalAnalysis || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.consultationSessions.set(id, session);
    return session;
  }

  async getCurrentConsultationSession(): Promise<ConsultationSession | undefined> {
    const sessions = Array.from(this.consultationSessions.values());
    return sessions.find(session => !session.isComplete);
  }

  async updateConsultationSession(id: number, updates: Partial<ConsultationSession>): Promise<ConsultationSession> {
    const session = this.consultationSessions.get(id);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.consultationSessions.set(id, updatedSession);
    return updatedSession;
  }

  async completeConsultationSession(id: number): Promise<void> {
    const session = this.consultationSessions.get(id);
    if (session) {
      session.isComplete = true;
      session.updatedAt = new Date();
      this.consultationSessions.set(id, session);
    }
  }

  async getConsultationSession(id: number): Promise<ConsultationSession | undefined> {
    return this.consultationSessions.get(id);
  }

  async getConsultationSessionById(id: number): Promise<ConsultationSession | undefined> {
    return this.consultationSessions.get(id);
  }

  async getLastCompletedConsultationSession(): Promise<ConsultationSession | undefined> {
    const sessions = Array.from(this.consultationSessions.values());
    const completedSessions = sessions.filter(session => session.isComplete);
    
    if (completedSessions.length === 0) {
      return undefined;
    }
    
    // Sort by updatedAt in descending order and return the most recent
    return completedSessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }

  async getAllConsultationSessions(): Promise<ConsultationSession[]> {
    const sessions = Array.from(this.consultationSessions.values());
    return sessions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteConsultationSession(id: number): Promise<void> {
    this.consultationSessions.delete(id);
  }

  // Admin operations
  private adminUserIds = new Set<number>([1]); // Default admin user ID
  private prompts: Map<number, Prompt> = new Map();
  private apiKeysMap: Map<number, ApiKey> = new Map();
  private trainingFilesMap: Map<number, TrainingFile> = new Map();
  private trainingContextsMap: Map<number, TrainingContext> = new Map();
  private currentPromptId = 1;
  private currentApiKeyId = 1;
  private currentTrainingFileId = 1;
  private currentTrainingContextId = 1;

  async isAdmin(userId: number): Promise<boolean> {
    return this.adminUserIds.has(userId);
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    this.adminUserIds.add(admin.userId);
    return {
      id: admin.userId,
      userId: admin.userId,
      role: admin.role || 'admin',
      permissions: admin.permissions || '{}',
      createdAt: new Date(),
      createdBy: admin.createdBy || null
    };
  }

  // Prompt operations
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const id = this.currentPromptId++;
    const newPrompt: Prompt = {
      ...prompt,
      id,
      description: prompt.description || null,
      isActive: prompt.isActive ?? true,
      updatedBy: prompt.updatedBy || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.prompts.set(id, newPrompt);
    return newPrompt;
  }

  async updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;
    
    const updatedPrompt = {
      ...prompt,
      ...updates,
      updatedAt: new Date()
    };
    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }

  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async getPromptByKey(key: string): Promise<Prompt | undefined> {
    return Array.from(this.prompts.values()).find(p => p.key === key);
  }

  async deletePrompt(id: number): Promise<void> {
    this.prompts.delete(id);
  }

  // API Key operations
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentApiKeyId++;
    const newApiKey: ApiKey = {
      ...apiKey,
      id,
      description: apiKey.description || null,
      isActive: apiKey.isActive ?? true,
      updatedBy: apiKey.updatedBy || null,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.apiKeysMap.set(id, newApiKey);
    return newApiKey;
  }

  async updateApiKey(id: number, updates: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const apiKey = this.apiKeysMap.get(id);
    if (!apiKey) return undefined;
    
    const updatedApiKey = {
      ...apiKey,
      ...updates,
      updatedAt: new Date()
    };
    this.apiKeysMap.set(id, updatedApiKey);
    return updatedApiKey;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeysMap.values());
  }

  async getApiKeyByName(name: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeysMap.values()).find(k => k.name === name);
  }

  async deleteApiKey(id: number): Promise<void> {
    this.apiKeysMap.delete(id);
  }
  
  // Training data operations
  async getTrainingFiles(): Promise<TrainingFile[]> {
    return Array.from(this.trainingFilesMap.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }
  
  async getTrainingFile(id: number): Promise<TrainingFile | undefined> {
    return this.trainingFilesMap.get(id);
  }
  
  async createTrainingFile(file: InsertTrainingFile): Promise<TrainingFile> {
    const id = this.currentTrainingFileId++;
    const newFile: TrainingFile = {
      id,
      ...file,
      status: file.status || 'pending',
      content: file.content || null,
      metadata: file.metadata || null,
      error: file.error || null,
      uploadedBy: file.uploadedBy || null,
      uploadedAt: new Date(),
      processedAt: null
    };
    this.trainingFilesMap.set(id, newFile);
    return newFile;
  }
  
  async updateTrainingFile(id: number, updates: Partial<InsertTrainingFile>): Promise<TrainingFile | undefined> {
    const file = this.trainingFilesMap.get(id);
    if (!file) return undefined;
    
    const updatedFile = {
      ...file,
      ...updates,
      updatedAt: new Date()
    };
    this.trainingFilesMap.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteTrainingFile(id: number): Promise<void> {
    this.trainingFilesMap.delete(id);
    // Also delete all associated contexts
    const contextsToDelete = Array.from(this.trainingContextsMap.values())
      .filter(ctx => ctx.fileId === id)
      .map(ctx => ctx.id);
    contextsToDelete.forEach(ctxId => this.trainingContextsMap.delete(ctxId));
  }
  
  // Training context operations
  async getTrainingContexts(fileId?: number): Promise<TrainingContext[]> {
    const contexts = Array.from(this.trainingContextsMap.values());
    if (fileId !== undefined) {
      return contexts.filter(ctx => ctx.fileId === fileId);
    }
    return contexts;
  }
  
  async getTrainingContext(id: number): Promise<TrainingContext | undefined> {
    return this.trainingContextsMap.get(id);
  }
  
  async createTrainingContext(context: InsertTrainingContext): Promise<TrainingContext> {
    const id = this.currentTrainingContextId++;
    const newContext: TrainingContext = {
      id,
      ...context,
      category: context.category || null,
      fileId: context.fileId || null,
      keywords: context.keywords || null,
      embedding: context.embedding || null,
      isActive: context.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.trainingContextsMap.set(id, newContext);
    return newContext;
  }
  
  async updateTrainingContext(id: number, updates: Partial<InsertTrainingContext>): Promise<TrainingContext | undefined> {
    const context = this.trainingContextsMap.get(id);
    if (!context) return undefined;
    
    const updatedContext = {
      ...context,
      ...updates,
      updatedAt: new Date()
    };
    this.trainingContextsMap.set(id, updatedContext);
    return updatedContext;
  }
  
  async deleteTrainingContext(id: number): Promise<void> {
    this.trainingContextsMap.delete(id);
  }
  
  async searchTrainingContexts(query: string): Promise<TrainingContext[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.trainingContextsMap.values()).filter(ctx => 
      ctx.content.toLowerCase().includes(lowerQuery) ||
      ctx.title.toLowerCase().includes(lowerQuery) ||
      (ctx.keywords && ctx.keywords.some(kw => kw.toLowerCase().includes(lowerQuery)))
    );
  }
  
  // ChatBot Mode Maps and IDs
  private chatbotModesMap: Map<number, ChatbotMode> = new Map();
  private leadGenFieldsMap: Map<number, LeadGenField> = new Map();
  private leadsMap: Map<number, Lead> = new Map();
  private productsMap: Map<number, Product> = new Map();
  private currentChatbotModeId = 1;
  private currentLeadGenFieldId = 1;
  private currentLeadId = 1;
  private currentProductId = 1;
  
  // ChatBot Mode operations
  async getChatbotModes(): Promise<ChatbotMode[]> {
    return Array.from(this.chatbotModesMap.values());
  }
  
  async getChatbotMode(id: number): Promise<ChatbotMode | undefined> {
    return this.chatbotModesMap.get(id);
  }
  
  async getChatbotModeByMode(mode: string): Promise<ChatbotMode | undefined> {
    return Array.from(this.chatbotModesMap.values()).find(m => m.mode === mode);
  }
  
  async createChatbotMode(mode: InsertChatbotMode): Promise<ChatbotMode> {
    const id = this.currentChatbotModeId++;
    const newMode: ChatbotMode = {
      id,
      ...mode,
      isActive: mode.isActive ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.chatbotModesMap.set(id, newMode);
    return newMode;
  }
  
  async updateChatbotMode(id: number, updates: Partial<InsertChatbotMode>): Promise<ChatbotMode | undefined> {
    const mode = this.chatbotModesMap.get(id);
    if (!mode) return undefined;
    
    const updatedMode = {
      ...mode,
      ...updates,
      updatedAt: new Date()
    };
    this.chatbotModesMap.set(id, updatedMode);
    return updatedMode;
  }
  
  async deleteChatbotMode(id: number): Promise<void> {
    this.chatbotModesMap.delete(id);
  }
  
  async getActiveChatbotMode(): Promise<ChatbotMode | undefined> {
    return Array.from(this.chatbotModesMap.values()).find(m => m.isActive);
  }
  
  // Lead Generation Field operations
  async getLeadGenFields(): Promise<LeadGenField[]> {
    return Array.from(this.leadGenFieldsMap.values()).sort((a, b) => a.order - b.order);
  }
  
  async getLeadGenField(id: number): Promise<LeadGenField | undefined> {
    return this.leadGenFieldsMap.get(id);
  }
  
  async createLeadGenField(field: InsertLeadGenField): Promise<LeadGenField> {
    const id = this.currentLeadGenFieldId++;
    const newField: LeadGenField = {
      id,
      ...field,
      placeholder: field.placeholder || null,
      options: field.options || null,
      validation: field.validation || null,
      isRequired: field.isRequired ?? true,
      isActive: field.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leadGenFieldsMap.set(id, newField);
    return newField;
  }
  
  async updateLeadGenField(id: number, updates: Partial<InsertLeadGenField>): Promise<LeadGenField | undefined> {
    const field = this.leadGenFieldsMap.get(id);
    if (!field) return undefined;
    
    const updatedField = {
      ...field,
      ...updates,
      updatedAt: new Date()
    };
    this.leadGenFieldsMap.set(id, updatedField);
    return updatedField;
  }
  
  async deleteLeadGenField(id: number): Promise<void> {
    this.leadGenFieldsMap.delete(id);
  }
  
  async getActiveLeadGenFields(): Promise<LeadGenField[]> {
    return Array.from(this.leadGenFieldsMap.values())
      .filter(f => f.isActive)
      .sort((a, b) => a.order - b.order);
  }
  
  // Lead operations
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leadsMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leadsMap.get(id);
  }
  
  async getLeadBySessionId(sessionId: string): Promise<Lead | undefined> {
    return Array.from(this.leadsMap.values()).find(l => l.sessionId === sessionId);
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const newLead: Lead = {
      id,
      ...lead,
      status: lead.status || 'in_progress',
      completedAt: lead.completedAt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leadsMap.set(id, newLead);
    return newLead;
  }
  
  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leadsMap.get(id);
    if (!lead) return undefined;
    
    const updatedLead = {
      ...lead,
      ...updates,
      updatedAt: new Date()
    };
    this.leadsMap.set(id, updatedLead);
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<void> {
    this.leadsMap.delete(id);
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }
  
  async getActiveProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(p => p.isActive);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(p => p.category === category);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = {
      id,
      ...product,
      features: product.features || null,
      price: product.price || null,
      imageUrl: product.imageUrl || null,
      metadata: product.metadata || null,
      isActive: product.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.productsMap.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<void> {
    this.productsMap.delete(id);
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.productsMap.values()).filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(lowerQuery)))
    );
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllMessages(): Promise<Message[]> {
    return db.select().from(messages).orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async clearMessages(): Promise<void> {
    await db.delete(messages);
  }

  // Consultation session methods
  async createConsultationSession(insertSession: InsertConsultationSession): Promise<ConsultationSession> {
    const [session] = await db.insert(consultationSessions).values(insertSession).returning();
    return session;
  }

  async getCurrentConsultationSession(): Promise<ConsultationSession | undefined> {
    const [session] = await db.select().from(consultationSessions)
      .where(eq(consultationSessions.isComplete, false))
      .orderBy(desc(consultationSessions.createdAt))
      .limit(1);
    return session || undefined;
  }

  async getConsultationSession(id: number): Promise<ConsultationSession | undefined> {
    const [session] = await db.select().from(consultationSessions).where(eq(consultationSessions.id, id));
    return session || undefined;
  }

  async getLastCompletedConsultationSession(): Promise<ConsultationSession | undefined> {
    const [session] = await db.select().from(consultationSessions)
      .where(eq(consultationSessions.isComplete, true))
      .orderBy(desc(consultationSessions.updatedAt))
      .limit(1);
    return session || undefined;
  }

  async updateConsultationSession(id: number, updates: Partial<ConsultationSession>): Promise<ConsultationSession> {
    const [session] = await db.update(consultationSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(consultationSessions.id, id))
      .returning();
    return session;
  }

  async completeConsultationSession(id: number): Promise<void> {
    await db.update(consultationSessions)
      .set({ isComplete: true, updatedAt: new Date() })
      .where(eq(consultationSessions.id, id));
  }

  async getAllConsultationSessions(): Promise<ConsultationSession[]> {
    return db.select().from(consultationSessions).orderBy(desc(consultationSessions.createdAt));
  }

  async deleteConsultationSession(id: number): Promise<void> {
    await db.delete(consultationSessions).where(eq(consultationSessions.id, id));
  }

  // Admin operations
  async isAdmin(userId: number): Promise<boolean> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.userId, userId));
    return !!admin;
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values(insertAdmin).returning();
    return admin;
  }

  // Prompt operations
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db.insert(prompts).values(insertPrompt).returning();
    return prompt;
  }

  async updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const [prompt] = await db.update(prompts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .returning();
    return prompt || undefined;
  }

  async getPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts);
  }

  async getPromptByKey(key: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.key, key));
    return prompt || undefined;
  }

  async deletePrompt(id: number): Promise<void> {
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  // API Key operations
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(insertApiKey).returning();
    return apiKey;
  }

  async updateApiKey(id: number, updates: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const [apiKey] = await db.update(apiKeys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return apiKey || undefined;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return db.select().from(apiKeys);
  }

  async getApiKeyByName(name: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.name, name));
    return apiKey || undefined;
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // Training data operations
  async getTrainingFiles(): Promise<TrainingFile[]> {
    return db.select().from(trainingFiles).orderBy(desc(trainingFiles.uploadedAt));
  }

  async getTrainingFile(id: number): Promise<TrainingFile | undefined> {
    const [file] = await db.select().from(trainingFiles).where(eq(trainingFiles.id, id));
    return file || undefined;
  }

  async createTrainingFile(insertFile: InsertTrainingFile): Promise<TrainingFile> {
    const [file] = await db.insert(trainingFiles).values(insertFile).returning();
    return file;
  }

  async updateTrainingFile(id: number, updates: Partial<InsertTrainingFile>): Promise<TrainingFile | undefined> {
    const [file] = await db.update(trainingFiles)
      .set(updates)
      .where(eq(trainingFiles.id, id))
      .returning();
    return file || undefined;
  }

  async deleteTrainingFile(id: number): Promise<void> {
    // Delete all associated contexts first
    await db.delete(trainingContexts).where(eq(trainingContexts.fileId, id));
    // Then delete the file
    await db.delete(trainingFiles).where(eq(trainingFiles.id, id));
  }

  // Training context operations
  async getTrainingContexts(fileId?: number): Promise<TrainingContext[]> {
    if (fileId !== undefined) {
      return db.select().from(trainingContexts).where(eq(trainingContexts.fileId, fileId));
    }
    return db.select().from(trainingContexts);
  }

  async getTrainingContext(id: number): Promise<TrainingContext | undefined> {
    const [context] = await db.select().from(trainingContexts).where(eq(trainingContexts.id, id));
    return context || undefined;
  }

  async createTrainingContext(insertContext: InsertTrainingContext): Promise<TrainingContext> {
    const [context] = await db.insert(trainingContexts).values(insertContext).returning();
    return context;
  }

  async updateTrainingContext(id: number, updates: Partial<InsertTrainingContext>): Promise<TrainingContext | undefined> {
    const [context] = await db.update(trainingContexts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trainingContexts.id, id))
      .returning();
    return context || undefined;
  }

  async deleteTrainingContext(id: number): Promise<void> {
    await db.delete(trainingContexts).where(eq(trainingContexts.id, id));
  }

  async searchTrainingContexts(query: string): Promise<TrainingContext[]> {
    return db.select().from(trainingContexts)
      .where(like(trainingContexts.content, `%${query}%`));
  }

  // ChatBot Mode operations
  async getChatbotModes(): Promise<ChatbotMode[]> {
    return db.select().from(chatbotModes);
  }

  async getChatbotMode(id: number): Promise<ChatbotMode | undefined> {
    const [mode] = await db.select().from(chatbotModes).where(eq(chatbotModes.id, id));
    return mode || undefined;
  }

  async getChatbotModeByMode(mode: string): Promise<ChatbotMode | undefined> {
    const [chatbotMode] = await db.select().from(chatbotModes).where(eq(chatbotModes.mode, mode));
    return chatbotMode || undefined;
  }

  async createChatbotMode(insertMode: InsertChatbotMode): Promise<ChatbotMode> {
    const [mode] = await db.insert(chatbotModes).values(insertMode).returning();
    return mode;
  }

  async updateChatbotMode(id: number, updates: Partial<InsertChatbotMode>): Promise<ChatbotMode | undefined> {
    const [mode] = await db.update(chatbotModes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatbotModes.id, id))
      .returning();
    return mode || undefined;
  }

  async deleteChatbotMode(id: number): Promise<void> {
    await db.delete(chatbotModes).where(eq(chatbotModes.id, id));
  }

  async getActiveChatbotMode(): Promise<ChatbotMode | undefined> {
    const [mode] = await db.select().from(chatbotModes).where(eq(chatbotModes.isActive, true));
    return mode || undefined;
  }

  // Lead Generation Field operations
  async getLeadGenFields(): Promise<LeadGenField[]> {
    return db.select().from(leadGenFields).orderBy(leadGenFields.order);
  }

  async getLeadGenField(id: number): Promise<LeadGenField | undefined> {
    const [field] = await db.select().from(leadGenFields).where(eq(leadGenFields.id, id));
    return field || undefined;
  }

  async createLeadGenField(insertField: InsertLeadGenField): Promise<LeadGenField> {
    const [field] = await db.insert(leadGenFields).values(insertField).returning();
    return field;
  }

  async updateLeadGenField(id: number, updates: Partial<InsertLeadGenField>): Promise<LeadGenField | undefined> {
    const [field] = await db.update(leadGenFields)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leadGenFields.id, id))
      .returning();
    return field || undefined;
  }

  async deleteLeadGenField(id: number): Promise<void> {
    await db.delete(leadGenFields).where(eq(leadGenFields.id, id));
  }

  async getActiveLeadGenFields(): Promise<LeadGenField[]> {
    return db.select().from(leadGenFields)
      .where(eq(leadGenFields.isActive, true))
      .orderBy(leadGenFields.order);
  }

  // Lead operations
  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async getLeadBySessionId(sessionId: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.sessionId, sessionId));
    return lead || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db.update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getActiveProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db.select().from(products)
      .where(like(products.name, `%${query}%`));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.sortOrder), desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
