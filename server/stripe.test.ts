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
      headers: {
        origin: "https://influxity.ai",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Stripe Integration", () => {
  it("should create checkout session for STARTER plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.createCheckoutSession({
      plan: "STARTER",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
    expect(typeof result.url).toBe("string");
    expect(typeof result.sessionId).toBe("string");
  });

  it("should create checkout session for PROFESSIONAL plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.createCheckoutSession({
      plan: "PROFESSIONAL",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
  });

  it("should return null subscription for new user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.getSubscription();

    expect(result).toBeNull();
  });
});
