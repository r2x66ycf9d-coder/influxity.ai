/**
 * SEO Routes — Sitemap + Robots.txt
 * Auto-generates a dynamic XML sitemap for Google indexing
 * and a robots.txt that allows all crawlers.
 * Mount in server/_core/index.ts before the tRPC middleware.
 */
import { Router } from "express";

export const seoRouter = Router();

const BASE_URL = "https://influxity.ai";

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/blog", priority: "0.9", changefreq: "weekly" },
  { path: "/blog/ai-tools-small-business", priority: "0.8", changefreq: "monthly" },
  { path: "/blog/passive-income-ai", priority: "0.8", changefreq: "monthly" },
  { path: "/blog/ai-prompts-business", priority: "0.8", changefreq: "monthly" },
  { path: "/blog/ai-bookkeeping-automation", priority: "0.8", changefreq: "monthly" },
  { path: "/blog/email-marketing-ai", priority: "0.8", changefreq: "monthly" },
  { path: "/blog/ai-lead-generation", priority: "0.8", changefreq: "monthly" },
  { path: "/login", priority: "0.5", changefreq: "yearly" },
];

seoRouter.get("/sitemap.xml", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const urls = staticPages
    .map(
      page => `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
});

seoRouter.get("/robots.txt", (_req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /login

Sitemap: ${BASE_URL}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(robots);
});
