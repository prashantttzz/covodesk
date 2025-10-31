import { VapiClient, Vapi } from "@vapi-ai/server-sdk";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecretValue, parseSecretString } from "../lib/secret";
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
    const secretName = plugin.secretName;
    const secret = await getSecretValue(secretName);
    const secretData = parseSecretString<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secret);

    if (!secretData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "incomplete credentials,please reconnect you vapi account",
      });
    }
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
    const secretName = plugin.secretName;
    const secret = await getSecretValue(secretName);
    const secretData = parseSecretString<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secret);

    if (!secretData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "incomplete credentials,please reconnect you vapi account",
      });
    }
    const vapiClient = new VapiClient({ token: secretData.privateApiKey });
    const phoneNumbers = await vapiClient.phoneNumbers.list();
    return phoneNumbers;
  },
});
