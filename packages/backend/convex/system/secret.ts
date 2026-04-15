import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";
import { internal } from "../_generated/api.js";

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const secretName = `tenant/${args.organizationId}/${args.service}`;
    const existing = await ctx.db
      .query("secrets")
      .withIndex("by_name", (q) => q.eq("name", secretName))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("secrets", { name: secretName, value: args.value });
    }

    // Update plugins table
    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", args.organizationId).eq("service", args.service)
      )
      .unique();

    if (existingPlugin) {
      await ctx.db.patch(existingPlugin._id, { secretName });
    } else {
      await ctx.db.insert("plugins", {
        organizationId: args.organizationId,
        service: args.service,
        secretName,
      });
    }
  },
});

export const get = internalQuery({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, args) => {
    const secretName = `tenant/${args.organizationId}/${args.service}`;
    const secret = await ctx.db
      .query("secrets")
      .withIndex("by_name", (q) => q.eq("name", secretName))
      .unique();
    return secret?.value || null;
  },
});
