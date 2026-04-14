import { v } from "convex/values";
import { internalQuery } from "../_generated/server.js";

export const contactSession = internalQuery({
  args: {
    contactSessionId: v.id("contactSession"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});
