import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  notifyEmail: boolean("notifyEmail").default(true).notNull(),
  notifySms: boolean("notifySms").default(false).notNull(),
  notifyInApp: boolean("notifyInApp").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscription plans and user subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).default("trialing").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  stripeCustomerIdx: index("stripe_customer_idx").on(table.stripeCustomerId),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * AI chat conversations
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Individual messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index("conversation_id_idx").on(table.conversationId),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Generated content history (emails, copy, etc.)
 */
export const generatedContent = mysqlTable("generatedContent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "email_sales",
    "email_support",
    "email_marketing",
    "email_followup",
    "sales_copy",
    "product_description",
    "email_campaign",
    "landing_page",
    "social_media",
    "blog_post",
    "product_launch",
    "case_study",
    "faq"
  ]).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
}));

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;

/**
 * Business data analysis results
 */
export const analysisResults = mysqlTable("analysisResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  analysisType: mysqlEnum("analysisType", [
    "sales",
    "customer_behavior",
    "operational_efficiency",
    "roi",
    "competitive",
    "growth"
  ]).notNull(),
  inputData: text("inputData").notNull(),
  insights: text("insights").notNull(),
  recommendations: text("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  analysisTypeIdx: index("analysis_type_idx").on(table.analysisType),
}));

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;

/**
 * Deceased persons for IMissU.app grief support platform
 */
export const deceasedPersons = mysqlTable("deceasedPersons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }),
  dateOfBirth: timestamp("dateOfBirth"),
  dateOfDeath: timestamp("dateOfDeath"),
  memorialPageUrl: varchar("memorialPageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  dateOfBirthIdx: index("date_of_birth_idx").on(table.dateOfBirth),
}));

export type DeceasedPerson = typeof deceasedPersons.$inferSelect;
export type InsertDeceasedPerson = typeof deceasedPersons.$inferInsert;

/**
 * Birthday notification logs for tracking sent notifications
 */
export const birthdayNotificationLogs = mysqlTable("birthdayNotificationLogs", {
  id: int("id").autoincrement().primaryKey(),
  deceasedPersonId: int("deceasedPersonId").notNull(),
  userId: int("userId").notNull(),
  notificationType: mysqlEnum("notificationType", ["email", "sms", "in_app"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
}, (table) => ({
  deceasedPersonIdIdx: index("deceased_person_id_idx").on(table.deceasedPersonId),
  userIdIdx: index("user_id_idx").on(table.userId),
  sentAtIdx: index("sent_at_idx").on(table.sentAt),
}));

export type BirthdayNotificationLog = typeof birthdayNotificationLogs.$inferSelect;
export type InsertBirthdayNotificationLog = typeof birthdayNotificationLogs.$inferInsert;
