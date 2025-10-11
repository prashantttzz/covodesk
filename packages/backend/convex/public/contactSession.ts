import { v } from "convex/values";
import { mutation } from "../_generated/server";

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezoneOffset: v.number(),
        timeZone: v.optional(v.string()),
        refferer: v.optional(v.string()),
        cookieEnabled: v.optional(v.boolean()),
        currentUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expireAt = now + SESSION_DURATION;
    const contactSessionId = await ctx.db.insert("contactSession", {
      name: args.name,
      email: args.email,
      organizationId: args.organizationId,
      expireAt,
      metadata: args.metadata,
    });
    return contactSessionId;
  },
});

export const validate = mutation({
  args: {
    contactSessionId: v.id("contactSession"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession) {
      return {valid:false ,reason :"contact session not found"};
      }
    if (contactSession.expireAt < Date.now()) {
      return {valid:false ,reason :"contact session expired"};
    }
    return {valid:true, contactSession};
  },
});
