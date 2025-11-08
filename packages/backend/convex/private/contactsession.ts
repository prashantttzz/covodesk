import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";

export const getOneByConversationId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }
    const orgId = identity.orgId as string;
    console.log(orgId)
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizstion not found",
      });
    }
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "conversation not found",
      });
    }
    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organization not matched",
      });
    }
    const contactSession = await ctx.db.get(conversation.contactSessionId);
    return contactSession;
  },
});
