import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./stripeRouter";
import { auditRouter } from "./auditRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM, invokeLLMStream } from "./_core/llm";
import { aiCache } from "./_core/cache";
import { logger } from "./_core/logger";
import { sanitize } from "./_core/security";
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  createMessage,
  saveGeneratedContent,
  getUserGeneratedContent,
  saveAnalysisResult,
  getUserAnalysisResults,
  getUserSubscription,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Chat System
  chat: router({
    // Create a new conversation
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const result = await createConversation({
          userId: ctx.user.id,
          title: input.title || "New Conversation",
        });
        const insertId = (result as any).insertId;
        return { success: true, conversationId: Number(insertId) };
      }),

    // Get user's conversations
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),

    // Get messages for a conversation
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await getConversationMessages(input.conversationId);
      }),

    // Send a message and get AI response (streaming)
    sendMessageStream: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .subscription(async function* ({ ctx, input }) {
        const startTime = Date.now();
        
        try {
          // Sanitize user input
          const sanitizedMessage = sanitize.aiPrompt(input.message);
          
          // Save user message
          await createMessage({
            conversationId: input.conversationId,
            role: "user",
            content: sanitizedMessage,
          });

          // Get conversation history
          const history = await getConversationMessages(input.conversationId);

          // Build messages for LLM
          const messages = [
            {
              role: "system" as const,
              content:
                "You are an AI business assistant for Influxity.ai. Help users with business automation, provide insights, and answer questions about AI-powered business solutions.",
            },
            ...history.slice(-10).map(msg => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
          ];

          logger.aiRequest('chat_stream', ctx.user.id);
          
          let fullResponse = '';
          
          // Stream AI response
          for await (const chunk of invokeLLMStream({ messages })) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              yield { content, done: false };
            }
          }

          logger.aiResponse('chat_stream', Date.now() - startTime, ctx.user.id);
          
          // Save complete AI response
          await createMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: fullResponse,
          });

          yield { content: '', done: true };
        } catch (error) {
          logger.error('chat_stream', error, { userId: ctx.user.id });
          throw new Error('Failed to stream AI response. Please try again.');
        }
      }),

    // Send a message and get AI response (non-streaming fallback)
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        
        try {
          // Sanitize user input
          const sanitizedMessage = sanitize.aiPrompt(input.message);
          
          // Save user message
          await createMessage({
            conversationId: input.conversationId,
            role: "user",
            content: sanitizedMessage,
          });

          // Get conversation history
          const history = await getConversationMessages(input.conversationId);

          // Build messages for LLM
          const messages = [
            {
              role: "system" as const,
              content:
                "You are an AI business assistant for Influxity.ai. Help users with business automation, provide insights, and answer questions about AI-powered business solutions.",
            },
            ...history.slice(-10).map(msg => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
          ];

          logger.aiRequest('chat', ctx.user.id);
          
          // Get AI response
          const response = await invokeLLM({ messages });
          const rawAiMessage = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
          const aiMessage = typeof rawAiMessage === 'string' ? rawAiMessage : JSON.stringify(rawAiMessage);

          logger.aiResponse('chat', Date.now() - startTime, ctx.user.id);
          
          // Save AI response
          await createMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: aiMessage,
          });

          return { message: aiMessage };
        } catch (error) {
          logger.error('Failed to process chat message', error, { userId: ctx.user.id, conversationId: input.conversationId });
          throw new Error('Failed to process message. Please try again.');
        }
      }),
  }),

  // Email Generation
  email: router({
    generate: protectedProcedure
      .input(
        z.object({
          type: z.enum(["sales", "support", "marketing", "followup"]),
          context: z.string(),
          tone: z.enum(["professional", "friendly", "casual"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        
        try {
          const sanitizedContext = sanitize.aiPrompt(input.context);
          
          // Check cache first
          const cacheKey = `${input.type}_${input.tone || 'professional'}_${sanitizedContext}`;
          const cached = aiCache.get('email', cacheKey, ctx.user.id);
          if (cached) {
            logger.aiRequest(`email_${input.type}`, ctx.user.id, true);
            return { content: cached };
          }
          
          const prompts = {
            sales: `Generate a professional sales email based on this context: ${sanitizedContext}. Make it compelling and action-oriented.`,
            support: `Generate a helpful support email based on this context: ${sanitizedContext}. Be empathetic and solution-focused.`,
            marketing: `Generate an engaging marketing email based on this context: ${sanitizedContext}. Focus on benefits and include a clear call-to-action.`,
            followup: `Generate a follow-up email based on this context: ${sanitizedContext}. Be polite and reference previous interaction.`,
          };

          logger.aiRequest(`email_${input.type}`, ctx.user.id);
          
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert email copywriter. Generate ${input.type} emails that are ${input.tone || "professional"} and effective.`,
              },
              { role: "user", content: prompts[input.type] },
            ],
          });

          const rawContent = response.choices[0]?.message?.content || "";
          const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

          logger.aiResponse(`email_${input.type}`, Date.now() - startTime, ctx.user.id);
          
          // Cache the response
          aiCache.set('email', cacheKey, content, ctx.user.id);
          
          // Save to database
          await saveGeneratedContent({
            userId: ctx.user.id,
            type: `email_${input.type}` as any,
            prompt: sanitizedContext,
            content,
          });

          return { content };
        } catch (error) {
          logger.error(`Failed to generate ${input.type} email`, error, { userId: ctx.user.id });
          throw new Error('Failed to generate email. Please try again.');
        }
      }),

    getHistory: protectedProcedure
      .input(z.object({ type: z.enum(["sales", "support", "marketing", "followup"]).optional() }))
      .query(async ({ ctx, input }) => {
        const typeFilter = input.type ? `email_${input.type}` : undefined;
        return await getUserGeneratedContent(ctx.user.id, typeFilter);
      }),
  }),

  // Sales Copy Generation
  salesCopy: router({
    generate: protectedProcedure
      .input(
        z.object({
          type: z.enum(["headline", "cta", "description", "product"]),
          product: z.string(),
          targetAudience: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const prompts = {
            headline: `Create 5 compelling headlines for: ${input.product}${input.targetAudience ? ` targeting ${input.targetAudience}` : ""}`,
            cta: `Generate 5 powerful call-to-action phrases for: ${input.product}`,
            description: `Write a persuasive product description for: ${input.product}${input.targetAudience ? ` targeting ${input.targetAudience}` : ""}`,
            product: `Create a complete product description with features, benefits, and use cases for: ${input.product}`,
          };

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert sales copywriter. Create compelling, conversion-focused copy that drives action.",
              },
              { role: "user", content: prompts[input.type] },
            ],
          });

          const rawContent = response.choices[0]?.message?.content || "";
          const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

          await saveGeneratedContent({
            userId: ctx.user.id,
            type: input.type === "product" ? "product_description" : "sales_copy",
            prompt: input.product,
            content,
          });

          return { content };
        } catch (error) {
          logger.error(`Failed to generate ${input.type} sales copy`, error, { userId: ctx.user.id });
          throw new Error('Failed to generate sales copy. Please try again.');
        }
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getUserGeneratedContent(ctx.user.id, "sales_copy");
    }),
  }),

  // Content Generation Engine
  content: router({
    generate: protectedProcedure
      .input(
        z.object({
          type: z.enum(["email_campaign", "landing_page", "social_media", "blog_post", "product_launch", "case_study", "faq"]),
          topic: z.string(),
          details: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const prompts = {
            email_campaign: `Create a 5-email campaign sequence for: ${input.topic}. ${input.details || ""}`,
            landing_page: `Write complete landing page copy for: ${input.topic}. Include headline, subheadline, features, benefits, and CTA. ${input.details || ""}`,
            social_media: `Generate a 7-day social media content calendar for: ${input.topic}. ${input.details || ""}`,
            blog_post: `Write a comprehensive blog post about: ${input.topic}. ${input.details || ""}`,
            product_launch: `Create a product launch announcement for: ${input.topic}. ${input.details || ""}`,
            case_study: `Write a customer case study for: ${input.topic}. ${input.details || ""}`,
            faq: `Generate a comprehensive FAQ section for: ${input.topic}. ${input.details || ""}`,
          };

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert content strategist and copywriter. Create engaging, high-quality content that resonates with audiences.",
              },
              { role: "user", content: prompts[input.type] },
            ],
          });

          const rawContent = response.choices[0]?.message?.content || "";
          const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

          await saveGeneratedContent({
            userId: ctx.user.id,
            type: input.type as any,
            prompt: input.topic,
            content,
          });

          return { content };
        } catch (error) {
          logger.error(`Failed to generate ${input.type} content`, error, { userId: ctx.user.id });
          throw new Error('Failed to generate content. Please try again.');
        }
      }),

    getHistory: protectedProcedure
      .input(
        z.object({
          type: z.enum(["email_campaign", "landing_page", "social_media", "blog_post", "product_launch", "case_study", "faq"]).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getUserGeneratedContent(ctx.user.id, input.type);
      }),
  }),

  // Data Analysis Engine
  analysis: router({
    analyze: protectedProcedure
      .input(
        z.object({
          type: z.enum(["sales", "customer_behavior", "operational_efficiency", "roi", "competitive", "growth"]),
          data: z.string(),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const prompts = {
            sales: `Analyze this sales data and provide actionable insights: ${input.data}. ${input.context || ""}`,
            customer_behavior: `Analyze customer behavior patterns and provide segmentation insights: ${input.data}. ${input.context || ""}`,
            operational_efficiency: `Analyze operational efficiency and identify improvement opportunities: ${input.data}. ${input.context || ""}`,
            roi: `Calculate ROI and provide financial analysis: ${input.data}. ${input.context || ""}`,
            competitive: `Perform competitive analysis and identify strategic opportunities: ${input.data}. ${input.context || ""}`,
            growth: `Analyze growth potential and provide strategic recommendations: ${input.data}. ${input.context || ""}`,
          };

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert business analyst. Provide detailed, data-driven insights with specific recommendations. Format your response with clear sections: Summary, Key Insights, and Recommendations.",
              },
              { role: "user", content: prompts[input.type] },
            ],
          });

          const fullResponse = response.choices[0]?.message?.content || "";
          const responseText = typeof fullResponse === 'string' ? fullResponse : JSON.stringify(fullResponse);

          // Extract insights and recommendations
          const insights = responseText;
          const recommendations = responseText.includes("Recommendations") ? responseText.split("Recommendations")[1] || "" : "";

          await saveAnalysisResult({
            userId: ctx.user.id,
            analysisType: input.type,
            inputData: input.data,
            insights,
            recommendations,
          });

          return { insights, recommendations };
        } catch (error) {
          logger.error(`Failed to analyze ${input.type} data`, error, { userId: ctx.user.id });
          throw new Error('Failed to analyze data. Please try again.');
        }
      }),

    getHistory: protectedProcedure
      .input(
        z.object({
          type: z.enum(["sales", "customer_behavior", "operational_efficiency", "roi", "competitive", "growth"]).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getUserAnalysisResults(ctx.user.id, input.type);
      }),
  }),

  // Subscription Management
  subscription: router({
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSubscription(ctx.user.id);
    }),
  }),

  // Stripe Payment
  stripe: stripeRouter,

  // AI router alias (for Manus Space AI components compatibility)
  ai: router({
    chat: publicProcedure
      .input(z.object({ message: z.string(), history: z.array(z.object({ role: z.string(), content: z.string() })).optional() }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import('./_core/llm');
        const messages = [
          { role: 'system' as const, content: 'You are a helpful assistant for Influxity.ai, an AI-powered retention platform for e-commerce stores.' },
          ...(input.history || []).map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user' as const, content: input.message },
        ];
        const result = await invokeLLM({ messages, maxTokens: 500 });
        return { response: result.choices?.[0]?.message?.content ?? 'Sorry, I could not process that.', error: false };
      }),
  }),

  // Newsletter / Lead Capture (public — no auth required)
  audit: auditRouter,

  // Admin — private lead dashboard (Sean-only, accessed at /admin/leads)
  admin: router({
    getLeads: publicProcedure.query(async () => {
      const fs = await import('fs');
      const path = await import('path');
      const dataDir = path.join(process.cwd(), 'data');
      const readJson = (file: string) => {
        const fp = path.join(dataDir, file);
        if (!fs.existsSync(fp)) return [];
        try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
      };
      const auditLeads: any[] = readJson('audit_leads.json');
      const recoverLeads: any[] = readJson('recover_leads.json').map((l: any) => ({ ...l, source: l.source || 'recover-page' }));
      const subscribers: any[] = readJson('subscribers.json').map((l: any) => ({ ...l, source: l.source || 'newsletter' }));
      const allLeads = [...auditLeads, ...recoverLeads, ...subscribers];
      allLeads.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return { leads: allLeads, total: allLeads.length };
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          source: z.string().optional(),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const fs = await import('fs');
        const path = await import('path');
        const isRecoverLead = (input.source || '').startsWith('recover-audit');
        const timestamp = new Date().toISOString();

        // ── 1. PERSIST LEAD TO JSON FILE (always works, no DB required) ──────
        try {
          const leadsFile = path.join(process.cwd(), 'data', isRecoverLead ? 'recover_leads.json' : 'subscribers.json');
          const dir = path.dirname(leadsFile);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          let leads: any[] = [];
          if (fs.existsSync(leadsFile)) {
            try { leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8')); } catch {}
          }
          // Deduplicate by email
          const exists = leads.find((l: any) => l.email === input.email);
          if (!exists) {
            leads.push({
              email: input.email,
              name: input.name || null,
              source: input.source || 'unknown',
              timestamp,
              status: 'new',
            });
            fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
            console.log(`[Lead] Saved ${input.email} to ${isRecoverLead ? 'recover_leads' : 'subscribers'}.json`);
          } else {
            console.log(`[Lead] Duplicate: ${input.email} already exists`);
          }
        } catch (fileErr) {
          console.warn('[Lead] File persistence error:', fileErr);
        }

        // ── 2. SEND IMMEDIATE WELCOME EMAIL (via SendGrid if configured) ──────
        if (process.env.SENDGRID_API_KEY) {
          try {
            const subject = isRecoverLead
              ? 'Your Influxity Recover Audit Request — What Happens Next'
              : 'Welcome to Influxity.ai — Your AI Toolkit Is Ready';

            const htmlBody = isRecoverLead
              ? `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
                  <img src="https://influxity.ai/logo.png" alt="Influxity.ai" style="height:48px;margin-bottom:24px" />
                  <h2 style="color:#7c3aed">Your Audit Request Has Been Received</h2>
                  <p>Hi${input.name ? ' ' + input.name : ''},</p>
                  <p>Thank you for requesting your free retention audit. Here's what happens next:</p>
                  <ol>
                    <li><strong>Within 24 hours:</strong> We'll analyze your customer base using benchmark-based retention data.</li>
                    <li><strong>You'll receive:</strong> A clear breakdown of your inactive customer segment and a realistic recovery opportunity estimate.</li>
                    <li><strong>No pressure:</strong> The audit is completely free. We only ask you to consider activating a campaign if the numbers make sense for your business.</li>
                  </ol>
                  <p>In the meantime, feel free to explore the full Influxity.ai platform at <a href="https://influxity.ai" style="color:#7c3aed">influxity.ai</a>.</p>
                  <p style="margin-top:32px;color:#666;font-size:13px">— Sean Blackwell, Founder, Influxity.ai</p>
                </div>`
              : `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
                  <img src="https://influxity.ai/logo.png" alt="Influxity.ai" style="height:48px;margin-bottom:24px" />
                  <h2 style="color:#7c3aed">Welcome to Influxity.ai</h2>
                  <p>Hi${input.name ? ' ' + input.name : ''},</p>
                  <p>You're now part of the Influxity community. Here's what you get access to:</p>
                  <ul>
                    <li>🤖 <strong>AI Chatbot</strong> — GPT-4 powered business assistant</li>
                    <li>✍️ <strong>Content Generator</strong> — Blog posts, emails, and social copy in seconds</li>
                    <li>📊 <strong>Lead Intelligence</strong> — Score and prioritize your leads automatically</li>
                    <li>🎙️ <strong>Voice AI</strong> — Transcribe and summarize meetings instantly</li>
                  </ul>
                  <p><a href="https://influxity.ai/pricing" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">Start Your Free Trial →</a></p>
                  <p style="margin-top:32px;color:#666;font-size:13px">— Sean Blackwell, Founder, Influxity.ai</p>
                </div>`;

            await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: input.email }] }],
                from: { email: process.env.FROM_EMAIL || 'sean@influxity.ai', name: 'Sean @ Influxity.ai' },
                subject,
                content: [{ type: 'text/html', value: htmlBody }],
              }),
            });
            console.log(`[Email] Welcome email sent to ${input.email}`);
          } catch (emailErr) {
            console.warn('[Email] SendGrid error:', emailErr);
          }
        }

        // ── 3. BEEHIIV INTEGRATION (if configured) ───────────────────────────
        if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUB_ID) {
          try {
            const response = await fetch(
              `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUB_ID}/subscriptions`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
                },
                body: JSON.stringify({
                  email: input.email,
                  reactivate_existing: false,
                  send_welcome_email: false, // We send our own above
                  utm_source: input.source || 'influxity_website',
                }),
              }
            );
            if (!response.ok) {
              console.warn('[Beehiiv] API error:', await response.text());
            }
          } catch (beehiivError) {
            console.warn('[Beehiiv] Integration error:', beehiivError);
          }
        }

        // ── 4. NOTIFY SEAN VIA EMAIL (if new recover lead) ───────────────────
        if (isRecoverLead && process.env.SENDGRID_API_KEY) {
          try {
            await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: 'sean@influxity.ai' }] }],
                from: { email: process.env.FROM_EMAIL || 'sean@influxity.ai', name: 'Influxity System' },
                subject: `🔥 New Recover Lead: ${input.email}`,
                content: [{ type: 'text/html', value: `<p><strong>New audit request received!</strong></p><p><strong>Email:</strong> ${input.email}</p><p><strong>Source:</strong> ${input.source}</p><p><strong>Time:</strong> ${timestamp}</p>` }],
              }),
            });
          } catch {}
        }

        console.log(`[Newsletter] Processed: ${input.email} | source: ${input.source || 'unknown'} | recover: ${isRecoverLead}`);
        return { success: true, message: 'Successfully submitted! Check your inbox.' };
      }),
  }),
});

export type AppRouter = typeof appRouter;
