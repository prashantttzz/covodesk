import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { supportAgent } from "../system/ai/SupportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { components, internal } from "../_generated/api";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../lib/constant";

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
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
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

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
    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    return paginated;
  },
});

export const messages = mutation({
  args: {
    prompt: v.string(),
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
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQEUST",
        message: "conversation resolved",
      });
    }
    saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: indentity.familyName,
      message: {
        role: "assistant",
        content: args.prompt,
      },
    });
  },
});

export const enhanceResponse = action({
  args: {
    prompt: v.string(),
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
    const subscription = await ctx.runQuery(
      internal.system.subscription.getByOrganizationId,
      { organizationId: org }
    );
    if (subscription?.status !== "active") {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "missing subscription",
      });
    }
    const response = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT,
        },
        {
          role: "user",
          content: args.prompt,
        },
      ],
    });
    return response.text;
  },
});
