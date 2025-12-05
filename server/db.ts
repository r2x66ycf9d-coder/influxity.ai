import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  subscriptions,
  conversations,
  messages,
  generatedContent,
  analysisResults,
  InsertSubscription,
  InsertConversation,
  InsertMessage,
  InsertGeneratedContent,
  InsertAnalysisResult,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== User Management =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Subscription Management =====

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(subscription);
  return result;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateSubscription(id: number, updates: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id));
}

// ===== Conversation Management =====

export async function createConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values(conversation);
  return result;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
}

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(message);
  return result;
}

// ===== Generated Content =====

export async function saveGeneratedContent(content: InsertGeneratedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(generatedContent).values(content);
  return result;
}

export async function getUserGeneratedContent(userId: number, type?: string) {
  const db = await getDb();
  if (!db) return [];

  if (type) {
    return await db
      .select()
      .from(generatedContent)
      .where(and(eq(generatedContent.userId, userId), eq(generatedContent.type, type as any)))
      .orderBy(desc(generatedContent.createdAt));
  }

  return await db
    .select()
    .from(generatedContent)
    .where(eq(generatedContent.userId, userId))
    .orderBy(desc(generatedContent.createdAt));
}

// ===== Analysis Results =====

export async function saveAnalysisResult(analysis: InsertAnalysisResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(analysisResults).values(analysis);
  return result;
}

export async function getUserAnalysisResults(userId: number, analysisType?: string) {
  const db = await getDb();
  if (!db) return [];

  if (analysisType) {
    return await db
      .select()
      .from(analysisResults)
      .where(and(eq(analysisResults.userId, userId), eq(analysisResults.analysisType, analysisType as any)))
      .orderBy(desc(analysisResults.createdAt));
  }

  return await db
    .select()
    .from(analysisResults)
    .where(eq(analysisResults.userId, userId))
    .orderBy(desc(analysisResults.createdAt));
}
