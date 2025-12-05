import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { createCheckoutSession } from "./stripe";

export const stripeRouter = router({
  createCheckout: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["STARTER", "PROFESSIONAL"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const origin = ctx.req.headers.origin || `${ctx.req.protocol}://${ctx.req.headers.host}`;

      const session = await createCheckoutSession({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        userName: ctx.user.name || "",
        plan: input.plan,
        origin,
      });

      return {
        checkoutUrl: session.url,
      };
    }),
});
