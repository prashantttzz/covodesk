import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getOne = query({
  args: {
    service: v.union(v.literal("vapi")),
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
    return await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", org).eq("service", args.service)
      )
      .unique();
  },
});

export const remove = mutation({
  args: {
    service: v.union(v.literal("vapi")),
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

    const existingPlugins = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", org).eq("service", args.service)
      )
      .unique();

    if (!existingPlugins) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "plugin not found",
      });
    }
    await ctx.db.delete(existingPlugins._id);
  },
});
