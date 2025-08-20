import {
  users,
  sessions,
  metrics,
  config,
  auditLogs,
  aiModels,
  type User,
  type InsertUser,
  type Session,
  type Metric,
  type Config,
  type AuditLog,
  type AIModel,
  type InsertMetric,
  type InsertConfig,
  type InsertAuditLog,
  type InsertAIModel,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // Session operations
  createSession(userId: string, token: string, expiresAt: Date): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  
  // Metrics operations
  createMetric(metric: InsertMetric): Promise<Metric>;
  getMetrics(type?: string, fromDate?: Date, toDate?: Date): Promise<Metric[]>;
  getLatestMetrics(): Promise<Metric[]>;
  
  // Config operations
  getConfig(key: string): Promise<Config | undefined>;
  setConfig(configData: InsertConfig, userId: string): Promise<Config>;
  getAllConfig(): Promise<Config[]>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId?: string, fromDate?: Date, toDate?: Date): Promise<AuditLog[]>;
  
  // AI Model operations
  createAIModel(model: InsertAIModel): Promise<AIModel>;
  getAIModels(): Promise<AIModel[]>;
  getAIModel(id: string): Promise<AIModel | undefined>;
  updateAIModel(id: string, updates: Partial<InsertAIModel>): Promise<AIModel>;
  deleteAIModel(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Session operations
  async createSession(userId: string, token: string, expiresAt: Date): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({ userId, token, expiresAt })
      .returning();
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gte(sessions.expiresAt, new Date())));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
  }

  // Metrics operations
  async createMetric(metric: InsertMetric): Promise<Metric> {
    const [newMetric] = await db
      .insert(metrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  async getMetrics(type?: string, fromDate?: Date, toDate?: Date): Promise<Metric[]> {
    const conditions = [];
    if (type) conditions.push(eq(metrics.type, type));
    if (fromDate) conditions.push(gte(metrics.timestamp, fromDate));
    if (toDate) conditions.push(lte(metrics.timestamp, toDate));
    
    if (conditions.length > 0) {
      return db.select().from(metrics).where(and(...conditions)).orderBy(desc(metrics.timestamp));
    } else {
      return db.select().from(metrics).orderBy(desc(metrics.timestamp));
    }
  }

  async getLatestMetrics(): Promise<Metric[]> {
    return db
      .select()
      .from(metrics)
      .orderBy(desc(metrics.timestamp))
      .limit(100);
  }

  // Config operations
  async getConfig(key: string): Promise<Config | undefined> {
    const [configItem] = await db.select().from(config).where(eq(config.key, key));
    return configItem || undefined;
  }

  async setConfig(configData: InsertConfig, userId: string): Promise<Config> {
    const [configItem] = await db
      .insert(config)
      .values({ ...configData, updatedBy: userId })
      .onConflictDoUpdate({
        target: config.key,
        set: {
          value: configData.value,
          description: configData.description,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      })
      .returning();
    return configItem;
  }

  async getAllConfig(): Promise<Config[]> {
    return db.select().from(config).orderBy(config.key);
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getAuditLogs(userId?: string, fromDate?: Date, toDate?: Date): Promise<AuditLog[]> {
    const conditions = [];
    if (userId) conditions.push(eq(auditLogs.userId, userId));
    if (fromDate) conditions.push(gte(auditLogs.timestamp, fromDate));
    if (toDate) conditions.push(lte(auditLogs.timestamp, toDate));
    
    if (conditions.length > 0) {
      return db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.timestamp));
    } else {
      return db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
    }
  }

  // AI Model operations
  async createAIModel(model: InsertAIModel): Promise<AIModel> {
    const [aiModel] = await db
      .insert(aiModels)
      .values(model)
      .returning();
    return aiModel;
  }

  async getAIModels(): Promise<AIModel[]> {
    return db.select().from(aiModels).orderBy(aiModels.name);
  }

  async getAIModel(id: string): Promise<AIModel | undefined> {
    const [aiModel] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return aiModel || undefined;
  }

  async updateAIModel(id: string, updates: Partial<InsertAIModel>): Promise<AIModel> {
    const [aiModel] = await db
      .update(aiModels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiModels.id, id))
      .returning();
    return aiModel;
  }

  async deleteAIModel(id: string): Promise<void> {
    await db.delete(aiModels).where(eq(aiModels.id, id));
  }
}

export const storage = new DatabaseStorage();
