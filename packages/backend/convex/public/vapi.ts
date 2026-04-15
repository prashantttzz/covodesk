import { v } from "convex/values";
import { action } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import { rag } from "../system/ai/rag.js";
import { SEARCH_INTERPRETER_PROMPT } from "../lib/constant.js";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const search = action({
  args: {
    assistantId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Find organization by assistantId
    const widgetSettings = await ctx.runQuery(
      internal.system.widgetSetting.getByVapiAssistantId,
      { assistantId: args.assistantId }
    );

    if (!widgetSettings) {
      console.error(`Assistant not found: ${args.assistantId}`);
      return {
        result: "Assistant not found or not linked to any organization",
      };
    }

    const orgId = widgetSettings.organizationId;

    // 2. Perform RAG search
    const searchResult = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      searchType: "hybrid",
      chunkContext: { before: 2, after: 1 },
      limit: 5,
    });

    const entryContext = searchResult.entries
      .map((e: any) => {
        const title = e.title ? `${e.title}\n` : "";
        const text = typeof e.text === "string" ? e.text.trim() : "";
        return `${title}${text}`.trim();
      })
      .filter((text: string) => text.length > 0)
      .join("\n\n---\n\n");

    const combinedContext = searchResult.text?.trim() || entryContext;

    if (!combinedContext) {
      return {
        result: "I couldn't find specific information about that in our knowledge base.",
      };
    }

    const contextText = `found result in ${searchResult.entries
      .map((e: any) => e.title || null)
      .filter((t: any) => t !== null)
      .join(", ")}. here is the context \n\n${combinedContext}`;

    // 3. Generate answer
    const response = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `user asked: ${args.query} \n\n search results : ${contextText}`,
        },
      ],
      model: google("gemini-2.5-flash"),
    });

    return {
      result: response.text,
    };
  },
});
