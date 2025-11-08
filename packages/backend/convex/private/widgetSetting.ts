import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
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
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", org))
      .unique();
    return widgetSettings;
  },
});

export const upsert = mutation({
  args: {
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
  },
  handler:async(ctx,args)=>{
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
      const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", org))
      .unique();


 if(widgetSettings){
  await ctx.db.patch(widgetSettings._id,{
    greetMessage:args.greetMessage,
    defaultSuggestions:args.defaultSuggestions,
    vapiSettings:args.vapiSettings
  })

 }else{
    await ctx.db.insert("widgetSettings",{
      organizationId:org,
      greetMessage:args.greetMessage,
      defaultSuggestions:args.defaultSuggestions,
      vapiSettings:args.vapiSettings
    })
 } 
}
});
