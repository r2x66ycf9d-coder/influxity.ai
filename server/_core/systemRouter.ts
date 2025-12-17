import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(async () => {
      try {
        // Check database connection
        const db = await getDb();
        if (db) {
          await db.execute(sql`SELECT 1`);
        }
        
        return {
          ok: true,
          status: "healthy",
          timestamp: Date.now(),
          services: {
            database: db ? "connected" : "not_configured",
            api: "operational",
          },
        };
      } catch (error) {
        return {
          ok: false,
          status: "unhealthy",
          timestamp: Date.now(),
          services: {
            database: "disconnected",
            api: "operational",
          },
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
