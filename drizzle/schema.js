// JavaScript re-export of schema for use by birthdayNotifications.mjs
// This file bridges the TypeScript schema to the ESM runtime

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
});

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
});

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
});
