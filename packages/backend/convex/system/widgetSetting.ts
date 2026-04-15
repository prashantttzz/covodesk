import { v } from "convex/values";
import { internalQuery } from "../_generated/server.js";

export const getByVapiAssistantId = internalQuery({
  args: {
    assistantId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("widgetSettings")
      .withIndex("by_vapi_assistant_id", (q) =>
        q.eq("vapiSettings.assistantId", args.assistantId)
      )
      .unique();
  },
});
