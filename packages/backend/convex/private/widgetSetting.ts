import { Query } from "convex/server";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
export const getOne = query({
  args: {},
  handler: async (ctx) => {
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
    const widgetSettings = await ctx.db.query("widgetSettings").withIndex("by_organization_id",(q)=>q.eq("organizationId",org)).unique()
    return widgetSettings;
  },
});
