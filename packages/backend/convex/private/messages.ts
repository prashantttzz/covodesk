import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server.js";
import { supportAgent } from "../system/ai/SupportAgent.js";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { components, internal, api } from "../_generated/api.js";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../lib/constant.js";
import { VapiClient } from "@vapi-ai/server-sdk";

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
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
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!conversation) {
      throw new ConvexError({
        code: "NOTFOUND",
        message: "conversation not found",
      });
    }
    if (conversation.organizationId !== org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid organizationID",
      });
    }
    const contactSession = await ctx.db.get(conversation.contactSessionId);
    if (!contactSession) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "contact session not found",
      });
    }
    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    return paginated;
  },
});

export const messages = mutation({
  args: {
    prompt: v.string(),
    conversationId: v.id("conversations"),
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
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOTFOUND",
        message: "conversation not found",
      });
    }
    if (conversation.organizationId !== org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid organizationID",
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQEUST",
        message: "conversation resolved",
      });
    }
    saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: indentity.familyName,
      message: {
        role: "assistant", // operator acts as assistant
        content: args.prompt,
      },
    });
  },
});

export const sendReply = action({
  args: {
    conversationId: v.id("conversations"),
    prompt: v.string(),
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

    // 1. Save the message to Convex via mutation
    await ctx.runMutation(api.private.messages.messages, args);

    // 2. Check if it's a Vapi conversation
    const conversation = await ctx.runQuery(api.private.conversation.getOne, {
      conversationId: args.conversationId,
    });

    if (conversation?.contactSession?.email === "vapi@call.ai") {
      // 3. Trigger Vapi Speak
      const secret = (await ctx.runQuery(internal.system.secret.get, {
        organizationId: org,
        service: "vapi",
      })) as { privateApiKey: string } | null;

      const apiKey =
        secret?.privateApiKey || "9717a7ec-982b-488f-9880-abaad863d40f";

      const vapiClient = new VapiClient({ token: apiKey });

      try {
        // We use the threadId as the callId for Vapi calls
        // Since the current SDK version doesn't export a 'speak' method, we use the raw REST API
        // to inject an assistant message which triggers the AI to speak the text.
        const response = await fetch(
          `https://api.vapi.ai/call/${conversation.threadId}/message`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                type: "add-message",
                message: {
                  role: "assistant",
                  content: args.prompt,
                },
              },
            }),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Vapi API Error (${response.status}): ${errorBody}`);
        }
      } catch (error) {
        console.error("Failed to trigger Vapi intercession:", error);
      }
    }
  },
});

export const enhanceResponse = action({
  args: {
    prompt: v.string(),
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
    const subscription = await ctx.runQuery(
      internal.system.subscription.getByOrganizationId,
      { organizationId: org }
    );
    if (subscription?.status !== "active") {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "missing subscription",
      });
    }
    const response = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT,
        },
        {
          role: "user",
          content: args.prompt,
        },
      ],
    });
    return response.text;
  },
});
