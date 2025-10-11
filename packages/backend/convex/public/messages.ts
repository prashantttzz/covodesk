import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/SupportAgent";
import { paginationOptsValidator } from "convex/server";
import { resolveConversation } from "../system/tools/resolveConversation";
import { escalateConversation } from "../system/tools/escalateConversation";
import { saveMessage } from "@convex-dev/agent";
import { search } from "../system/tools/searchTool";

export const messages = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSession"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.ContactSession.contactSession,
      {
        contactSessionId: args.contactSessionId,
      }
    );
    if (!contactSession || contactSession.expireAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid session",
      });
    }
    const conversation = await ctx.runQuery(
      internal.system.conversation.getThreadId,
      {
        threadId: args.threadId,
      }
    );
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "conversation not found  ",
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "conversation resolved",
      });
    }

    const shouldTriggeragent = conversation.status === "unresolved";
    if (shouldTriggeragent) {
      await supportAgent.generateText(
        ctx,
        { threadId: args.threadId },
        {
          prompt: args.prompt,
          tools: {
            resolveConversationTool: resolveConversation,
            escalateConversationTool: escalateConversation,
            searchTool: search,
          },
        }
      );
    } else {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      });
    }
  },
});

export const getMany = query({
  args: {
    contactSessionId: v.id("contactSession"),
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession || contactSession.expireAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORZIED",
        message: "invalid session",
      });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    return paginated;
  },
});
