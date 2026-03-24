/**
 * Weekly AI Blog Post Generator
 * Runs every Monday at 9AM via cron.
 * Uses GPT-4 to generate a new SEO blog post and appends it to Blog.tsx automatically.
 * Commits and pushes to GitHub so the new post goes live without Sean touching anything.
 *
 * Run manually: node server/weeklyBlogGenerator.mjs
 */
import OpenAI from "openai";
import { execSync } from "child_process";
import fs from "fs";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SEO_TOPICS = [
  { title: "How AI Is Replacing $5,000/Month Marketing Agencies in 2026", keyword: "AI marketing automation small business" },
  { title: "The 10 Best AI Tools for Bookkeeping and Accounting in 2026", keyword: "AI bookkeeping tools 2026" },
  { title: "How to Automate Your Entire Sales Funnel with AI (Step-by-Step)", keyword: "AI sales funnel automation" },
  { title: "ChatGPT vs Claude vs Gemini: Which AI Is Best for Your Business?", keyword: "best AI for business 2026" },
  { title: "How Small Businesses Are Using AI to Cut Costs by 40%", keyword: "AI cost reduction small business" },
  { title: "The Complete Guide to AI Customer Service Automation", keyword: "AI customer service automation" },
  { title: "How to Use AI to Generate $5,000/Month in Affiliate Income", keyword: "AI affiliate marketing passive income" },
  { title: "AI vs Human Bookkeepers: The Real Cost Comparison for 2026", keyword: "AI bookkeeper vs human cost" },
];

async function generateBlogPost() {
  // Pick a topic based on current week number
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const topic = SEO_TOPICS[weekNumber % SEO_TOPICS.length];

  console.log(`[Blog Generator] Generating post: "${topic.title}"`);

  const prompt = `You are an expert AI business writer for Influxity.ai, a SaaS platform that helps small businesses automate with AI. 

Write a comprehensive, SEO-optimized blog post for the following:
Title: "${topic.title}"
Target keyword: "${topic.keyword}"

Requirements:
- 600-800 words
- Use **bold** for key points
- Include 4-6 practical, actionable sections
- Naturally mention Influxity.ai as a solution 2-3 times
- End with a clear CTA to try Influxity.ai free
- Write in a professional but conversational tone
- Include real statistics and data points where relevant

Return ONLY the blog post content as plain text with **bold** markdown formatting. No JSON, no code blocks.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1200,
  });

  const content = response.choices[0].message.content || "";

  // Create the new blog post object
  const postId = topic.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);

  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const wordCount = content.split(" ").length;
  const readTime = `${Math.ceil(wordCount / 200)} min read`;

  const newPost = {
    id: postId,
    title: topic.title,
    excerpt: content.split("\n").find(line => line.length > 80 && !line.startsWith("**"))?.slice(0, 160) + "..." || topic.title,
    category: "AI Business",
    readTime,
    date: today,
    content,
    affiliateLinks: [
      {
        label: "Try Influxity.ai Free — 14-Day Trial",
        url: "/pricing",
        description: "All 7 AI tools in one platform — no credit card required",
      },
    ],
  };

  console.log(`[Blog Generator] Post generated: ${wordCount} words, ${readTime}`);
  return newPost;
}

async function appendPostToBlog(post) {
  const blogPath = "./client/src/pages/Blog.tsx";
  const blogContent = fs.readFileSync(blogPath, "utf-8");

  // Find the closing bracket of the blogPosts array
  const insertMarker = "// AUTO-GENERATED POSTS END";
  const manualMarker = "// AUTO-GENERATED POSTS START";

  const postEntry = `
  // AUTO-GENERATED: ${post.date}
  {
    id: "${post.id}",
    title: ${JSON.stringify(post.title)},
    excerpt: ${JSON.stringify(post.excerpt)},
    category: "AI Business",
    readTime: "${post.readTime}",
    date: "${post.date}",
    content: ${JSON.stringify(post.content)},
    affiliateLinks: [
      {
        label: "Try Influxity.ai Free — 14-Day Trial",
        url: "/pricing",
        description: "All 7 AI tools in one platform — no credit card required",
      },
    ],
  },`;

  let updatedContent;
  if (blogContent.includes(insertMarker)) {
    updatedContent = blogContent.replace(insertMarker, `${postEntry}\n  ${insertMarker}`);
  } else {
    // Find the last entry in blogPosts array and append before closing bracket
    const lastEntryIndex = blogContent.lastIndexOf("];");
    if (lastEntryIndex === -1) {
      console.error("[Blog Generator] Could not find blogPosts array end");
      return false;
    }
    updatedContent = blogContent.slice(0, lastEntryIndex) + postEntry + "\n" + blogContent.slice(lastEntryIndex);
  }

  fs.writeFileSync(blogPath, updatedContent, "utf-8");
  console.log(`[Blog Generator] ✅ Post appended to Blog.tsx`);
  return true;
}

async function commitAndPush(post) {
  try {
    execSync("git config user.email 'influxity@manus.ai'", { stdio: "pipe" });
    execSync("git config user.name 'Influxity AI'", { stdio: "pipe" });
    execSync("git add client/src/pages/Blog.tsx", { stdio: "pipe" });
    execSync(`git commit -m "feat: auto-generate blog post — ${post.title.slice(0, 60)}"`, { stdio: "pipe" });
    execSync("git push origin main", { stdio: "pipe" });
    console.log(`[Blog Generator] ✅ Pushed to GitHub — post is now live`);
    return true;
  } catch (error) {
    console.error("[Blog Generator] Git push failed:", error.message);
    return false;
  }
}

async function run() {
  try {
    const post = await generateBlogPost();
    const appended = await appendPostToBlog(post);
    if (appended) {
      await commitAndPush(post);
      console.log(`[Blog Generator] 🎉 New blog post live: "${post.title}"`);
    }
  } catch (error) {
    console.error("[Blog Generator] Fatal error:", error);
  }
}

run();
