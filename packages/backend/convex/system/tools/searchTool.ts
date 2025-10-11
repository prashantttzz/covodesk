import { createTool } from "@convex-dev/agent";
import z from "zod";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { internal } from "../../_generated/api";
import { rag } from "../ai/rag";
import { supportAgent } from "../ai/SupportAgent";
import { SEARCH_INTERPRETER_PROMPT } from "../../lib/constant";

export const search = createTool({
  description:
    "search the knowledge base for relevant information to help answer user questions",
  args: z.object({
    query: z.string().describe("the search query to find relevant information"),
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return "missing thread id";
    }
    const conversation = await ctx.runQuery(
      internal.system.conversation.getThreadId,
      { threadId: ctx.threadId }
    );
    if (!conversation) {
      return "conversation not found";
    }
    const orgId = conversation.organizationId;
    const searchResult = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });
    const contextText = `found result in ${searchResult.entries
      .map((e) => e.title || null)
      .filter((t) => t !== null)
      .join(", ")}. here is the context \n\n${searchResult.text}`;
    const response = await generateText({
      messages: [
        {
          role: "system",
          content:SEARCH_INTERPRETER_PROMPT        },
        {
          role: "user",
          content: `user asked: ${args.query} \n\n search results : ${contextText}`,
        },
      ],
      model: google("gemini-2.5-flash"),
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: { role: "assistant", content: response.text },
    });
    return response.text;
  },
});
