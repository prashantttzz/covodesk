import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, internalQuery } from "../_generated/server";

export const upsert = internalMutation({
  args: {
    service: v.union(v.literal("vapi")),
    organizationId: v.string(),
    secretName: v.any(),
  },
  handler: async (ctx, args) => {
    const existingPlugins = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", args.organizationId).eq("service", args.service)
      )
      .unique();
    if (existingPlugins) {
      await ctx.db.patch(existingPlugins._id, {
        service: args.service,
        secretName: args.secretName,
      });
    } else {
      await ctx.db.insert("plugins", {
        organizationId: args.organizationId,
        secretName: args.secretName,
        service: args.service,
      });
    }
  },
});

export const getByOrganizationIdAndService = internalQuery({
  args: {
    service: v.union(v.literal("vapi")),
    organizationId: v.string(),  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", args.organizationId).eq("service", args.service)
      )
      .unique();
  },
});
