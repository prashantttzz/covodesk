import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../../_generated/api.js";
import { supportAgent } from "../ai/SupportAgent.js";

export const resolveConversation = createTool({
  description: "resolve a conversation",
  inputSchema: z.object({}),
  execute: async (ctx) => {
    if (!ctx.threadId) {
      return "missing thread id";
    }

    await ctx.runMutation(internal.system.conversation.resolve, {
      threadId: ctx.threadId,
    });
    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "conversation resolved",
      },
    });
    return "conversation resolved";
  },
});

