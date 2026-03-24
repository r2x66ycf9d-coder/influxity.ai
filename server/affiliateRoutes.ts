/**
 * Affiliate Click Tracking
 * Logs every affiliate link click with timestamp, source article, and destination.
 * Provides an admin endpoint to view click stats.
 * All data stored in memory (upgradeable to DB).
 */
import { Router } from "express";

export const affiliateRouter = Router();

interface ClickEvent {
  id: string;
  timestamp: string;
  partner: string;
  destination: string;
  sourceArticle: string;
  userAgent: string;
  ip: string;
}

// In-memory store — persists for the lifetime of the server process
const clickLog: ClickEvent[] = [];

// POST /api/affiliate/click — called by Blog.tsx when user clicks an affiliate link
affiliateRouter.post("/click", (req, res) => {
  const { partner, destination, sourceArticle } = req.body;
  if (!partner || !destination) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const event: ClickEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    partner: partner || "unknown",
    destination: destination || "",
    sourceArticle: sourceArticle || "unknown",
    userAgent: req.headers["user-agent"] || "",
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "",
  };

  clickLog.push(event);
  console.log(`[Affiliate] Click: ${event.partner} from article: ${event.sourceArticle}`);

  // Redirect user to the affiliate destination
  res.json({ redirect: destination });
});

// GET /api/affiliate/stats — admin stats endpoint
affiliateRouter.get("/stats", (req, res) => {
  // Basic protection — require admin key from env
  const adminKey = req.headers["x-admin-key"];
  if (process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Aggregate by partner
  const byPartner: Record<string, number> = {};
  const byArticle: Record<string, number> = {};

  for (const click of clickLog) {
    byPartner[click.partner] = (byPartner[click.partner] || 0) + 1;
    byArticle[click.sourceArticle] = (byArticle[click.sourceArticle] || 0) + 1;
  }

  res.json({
    totalClicks: clickLog.length,
    byPartner,
    byArticle,
    recentClicks: clickLog.slice(-20).reverse(),
  });
});
