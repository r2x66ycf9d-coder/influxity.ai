import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@influxity.ai",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://test.influxity.ai" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Chat System", () => {
  it("creates a new conversation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({ title: "Test Conversation" });

    expect(result.success).toBe(true);
    expect(result.conversationId).toBeGreaterThan(0);
  });

  it("retrieves user conversations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.chat.getConversations();

    expect(Array.isArray(conversations)).toBe(true);
  });
});

describe("Email Generation", () => {
  it("generates a sales email", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.email.generate({
      type: "sales",
      context: "Introducing our new AI automation platform to small businesses",
      tone: "professional",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(50);
  });

  it("generates a support email", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.email.generate({
      type: "support",
      context: "Helping a customer troubleshoot login issues",
      tone: "friendly",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
  });

  it("retrieves email history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.email.getHistory({});

    expect(Array.isArray(history)).toBe(true);
  });
});

describe("Sales Copy Generation", () => {
  it("generates product headlines", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.salesCopy.generate({
      type: "headline",
      product: "AI-powered business automation platform",
      targetAudience: "small business owners",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(20);
  });

  it("generates product description", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.salesCopy.generate({
      type: "product",
      product: "Restaurant management software",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
  });
});

describe("Content Generation", () => {
  it("generates landing page copy", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.generate({
      type: "landing_page",
      topic: "AI automation for restaurants",
      details: "Focus on cost savings and efficiency",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(100);
  });

  it("generates social media calendar", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.generate({
      type: "social_media",
      topic: "E-commerce growth tips",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
  });

  it("generates blog post", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.generate({
      type: "blog_post",
      topic: "How AI is transforming small businesses",
    });

    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
  });
});

describe("Data Analysis", () => {
  it("analyzes sales data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.analyze({
      type: "sales",
      data: "Q1: $50000, Q2: $65000, Q3: $72000, Q4: $80000",
      context: "Annual sales for a restaurant",
    });

    expect(result.insights).toBeTruthy();
    expect(typeof result.insights).toBe("string");
    expect(result.insights.length).toBeGreaterThan(50);
  });

  it("analyzes ROI", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.analyze({
      type: "roi",
      data: "Investment: $10000, Revenue: $45000, Time: 6 months",
    });

    expect(result.insights).toBeTruthy();
    expect(typeof result.insights).toBe("string");
  });
});

describe("Subscription Management", () => {
  it("retrieves current subscription", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const subscription = await caller.subscription.getCurrent();

    // May be null if no subscription exists
    expect(subscription === null || typeof subscription === "object").toBe(true);
  });
});

describe("Stripe Integration", () => {
  it("creates checkout session for starter plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.createCheckout({
      plan: "STARTER",
    });

    expect(result.checkoutUrl).toBeTruthy();
    expect(typeof result.checkoutUrl).toBe("string");
    expect(result.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("creates checkout session for professional plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.createCheckout({
      plan: "PROFESSIONAL",
    });

    expect(result.checkoutUrl).toBeTruthy();
    expect(typeof result.checkoutUrl).toBe("string");
    expect(result.checkoutUrl).toContain("checkout.stripe.com");
  });
});
