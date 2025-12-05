import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./stripeRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
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

    // Send a message and get AI response
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await createMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
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

        // Get AI response
        const response = await invokeLLM({ messages });
        const rawAiMessage = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
        const aiMessage = typeof rawAiMessage === 'string' ? rawAiMessage : JSON.stringify(rawAiMessage);

        // Save AI response
        await createMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: aiMessage,
        });

        return { message: aiMessage };
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
        const prompts = {
          sales: `Generate a professional sales email based on this context: ${input.context}. Make it compelling and action-oriented.`,
          support: `Generate a helpful support email based on this context: ${input.context}. Be empathetic and solution-focused.`,
          marketing: `Generate an engaging marketing email based on this context: ${input.context}. Focus on benefits and include a clear call-to-action.`,
          followup: `Generate a follow-up email based on this context: ${input.context}. Be polite and reference previous interaction.`,
        };

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

        // Save to database
        await saveGeneratedContent({
          userId: ctx.user.id,
          type: `email_${input.type}` as any,
          prompt: input.context,
          content,
        });

        return { content };
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
});

export type AppRouter = typeof appRouter;
