import { VapiClient, Vapi } from "@vapi-ai/server-sdk";
import { action } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import { getSecretValue, parseSecretString } from "../lib/secret.js";
import { ConvexError } from "convex/values";

export const getAssistant = action({
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
    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      { organizationId: org, service: "vapi" }
    );
    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "plugin not found",
      });
    }
    const secretData = {
      publicApiKey: "308107ef-f15f-409c-9f93-5182903f5686",
      privateApiKey: "308107ef-f15f-409c-9f93-5182903f5686", // Using public key as fallback/placeholder if private is not provided
    };

    const vapiClient = new VapiClient({ token: secretData.privateApiKey });
    const assistants = await vapiClient.assistants.list();
    return assistants;
  },
});

export const getPhoneNumber = action({
  args: {},
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
    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      { organizationId: org, service: "vapi" }
    );
    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "plugin not found",
      });
    }
    const secretData = {
      publicApiKey: "308107ef-f15f-409c-9f93-5182903f5686",
      privateApiKey: "308107ef-f15f-409c-9f93-5182903f5686",
    };

    const vapiClient = new VapiClient({ token: secretData.privateApiKey });
    const phoneNumbers = await vapiClient.phoneNumbers.list();
    return phoneNumbers;
  },
});
