import { paginationOptsValidator, PaginationResult } from "convex/server";
import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { MessageDoc } from "@convex-dev/agent";
import { supportAgent } from "../system/ai/SupportAgent";

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("escalated"),
        v.literal("resolved")
      )
    ),
  },
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();
    if (!indentity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const org = indentity.orgId as string;
    if (!org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizationID not found",
      });
    }
    let conversation: PaginationResult<Doc<"conversations">>;
    if (args.status) {
      conversation = await ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q
            .eq("status", args.status as Doc<"conversations">["status"])
            .eq("organizationId", org)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      conversation = await ctx.db
        .query("conversations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", org))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    const conversationWithAdditionalDetails = await Promise.all(
      conversation.page.map(async (convo) => {
        let lastMessage: MessageDoc | null = null;
        const contactSession = await ctx.db.get(convo.contactSessionId);
        if (!contactSession) {
          return null;
        }
        const messages = await supportAgent.listMessages(ctx, {
          threadId: convo.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });
        if (messages.page.length > 0) {
          lastMessage = messages.page[0] ?? null;
        }
        return {
          ...convo,
          lastMessage,
          contactSession,
        };
      })
    );
    const validConversation = conversationWithAdditionalDetails.filter(
      (conv): conv is NonNullable<typeof conv> => conv !== null
    );
    return {
      ...conversation,
      page: validConversation,
    };
  },
});

export const getOne = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();
    if (!indentity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const org = indentity.orgId as string;
    if (!org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizationID not found",
      });
    }
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOTFOUND",
        message: "conversation not found",
      });
    }
    if (conversation.organizationId !== org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid organizationID",
      });
    }
    const contactSession = await ctx.db.get(conversation.contactSessionId);
    if (!contactSession) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "contact session not found",
      });
    }
    return {
      ...conversation,
      contactSession,
    };
  },
});

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();
    if (!indentity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const org = indentity.orgId as string;
    if (!org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizationID not found",
      });
    }
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOTFOUND",
        message: "conversation not found",
      });
    }
    if (conversation.organizationId !== org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid organizationID",
      });
    }
    await ctx.db.patch(args.conversationId, {
      status: args.status,
    });
  },
});