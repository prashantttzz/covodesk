import { VapiClient, Vapi } from "@vapi-ai/server-sdk";
import { action } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import { ConvexError, v } from "convex/values";

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
      publicApiKey: "49f19367-ea0f-4e74-9325-0c43dd396b62 ",
      privateApiKey: "9717a7ec-982b-488f-9880-abaad863d40f", // Using public key as fallback/placeholder if private is not provided
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

export const configureKnowledgeBase = action({
  args: {
    assistantId: v.string(),
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

    // 1. Get Vapi Secret (native Convex query)
    const secret = (await ctx.runQuery(internal.system.secret.get, {
      organizationId: org,
      service: "vapi",
    })) as { privateApiKey: string } | null;

    const apiKey =
      secret?.privateApiKey || "9717a7ec-982b-488f-9880-abaad863d40f";

    const vapiClient = new VapiClient({ token: apiKey });

    // 2. Determine Webhook URL
    const baseUrl = process.env.CONVEX_SITE_URL;
    if (!baseUrl) {
      throw new ConvexError({
        code: "MISSING_ENV",
        message:
          "CONVEX_SITE_URL environment variable is not set. Please set it in your Convex dashboard.",
      });
    }
    const serverUrl = `${baseUrl}/vapi`;

    // 3. Define the tool
    const searchTool: any = {
      type: "function",
      messages: [
        {
          type: "request-start",
          content: "Searching the knowledge base...",
        },
      ],
      function: {
        name: "search_knowledge_base",
        description:
          "Search the knowledge base for relevant information to help answer user questions.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to find relevant information",
            },
          },
          required: ["query"],
        },
      },
    };

    // 4. Update Assistant
    // Note: We're using a partial update. We append the tool if it doesn't exist.
    const assistant = await vapiClient.assistants.get({ id: args.assistantId });
    const existingTools = (assistant.model as any)?.tools || [];
    const hasTool = existingTools.some(
      (t: any) => t.function?.name === "search_knowledge_base"
    );

    const updatedTools = hasTool
      ? existingTools
      : [...existingTools, searchTool];

    const modelUpdate = assistant.model
      ? ({
          ...assistant.model,
          tools: updatedTools,
        } as any)
      : undefined;

    await vapiClient.assistants.update({
      id: args.assistantId,
      server: {
        url: serverUrl,
      },
      ...(modelUpdate ? { model: modelUpdate } : {}),
    });

    return { success: true };
  },
});
