import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with enhanced authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role").notNull().default("user"), // user, admin, superadmin
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage for JWT blacklisting
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("sessions_user_id_idx").on(table.userId),
  index("sessions_expires_at_idx").on(table.expiresAt),
]);

// System metrics for real-time dashboard
export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // fines, console_attempts, ai_models, etc.
  value: integer("value").notNull(),
  metadata: jsonb("metadata"), // additional data
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("metrics_type_idx").on(table.type),
  index("metrics_timestamp_idx").on(table.timestamp),
]);

// System configuration
export const config = pgTable("config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("audit_logs_user_id_idx").on(table.userId),
  index("audit_logs_timestamp_idx").on(table.timestamp),
]);

// AI Model configurations
export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  version: varchar("version").notNull(),
  status: varchar("status").notNull().default("active"), // active, inactive, maintenance
  compliance: varchar("compliance").notNull(),
  security: varchar("security").notNull(),
  config: jsonb("config"), // model-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertMetricSchema = createInsertSchema(metrics).pick({
  type: true,
  value: true,
  metadata: true,
});

export const insertConfigSchema = createInsertSchema(config).pick({
  key: true,
  value: true,
  description: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  resource: true,
  details: true,
});

export const insertAIModelSchema = createInsertSchema(aiModels).pick({
  name: true,
  version: true,
  status: true,
  compliance: true,
  security: true,
  config: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type Session = typeof sessions.$inferSelect;
export type Metric = typeof metrics.$inferSelect;
export type Config = typeof config.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AIModel = typeof aiModels.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertAIModel = z.infer<typeof insertAIModelSchema>;
