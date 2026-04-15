import { v } from "convex/values";
import { internalMutation } from "../_generated/server.js";
import { components } from "../_generated/api.js";
import { saveMessage } from "@convex-dev/agent";
import { supportAgent } from "./ai/SupportAgent.js";

// ─────────────────────────────────────────────────────────────
// saveVapiMessage  (called per-transcript during a live call)
// ─────────────────────────────────────────────────────────────
export const saveVapiMessage = internalMutation({
  args: {
    assistantId: v.string(),
    vapiCallId: v.string(), // Vapi call ID (for deduplication lookup via contactSession)
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("bot")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Resolve Organisation via assistant → widgetSettings
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_vapi_assistant_id", (q) =>
        q.eq("vapiSettings.assistantId", args.assistantId)
      )
      .unique();

    if (!widgetSettings) {
      console.warn(
        `[Vapi] No widgetSettings for assistantId ${args.assistantId}`
      );
      return;
    }

    const organizationId = widgetSettings.organizationId;

    // 2. Find existing conversation keyed via contactSession.name = "vapi:{callId}"
    let conversation = null;
    const sessions = await ctx.db
      .query("contactSession")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
      .collect();

    const matchingSession = sessions.find(
      (s) => s.name === `vapi:${args.vapiCallId}`
    );

    if (matchingSession) {
      conversation = await ctx.db
        .query("conversations")
        .withIndex("by_contact_session_id", (q) =>
          q.eq("contactSessionId", matchingSession._id)
        )
        .unique();
    }

    if (!conversation) {
      // Create a real agent thread first, then create the conversation
      const { threadId: agentThreadId } = await supportAgent.createThread(ctx, {});

      const contactSessionId = await ctx.db.insert("contactSession", {
        name: `vapi:${args.vapiCallId}`,
        email: "vapi@call.ai",
        organizationId,
        expireAt: Date.now() + 24 * 60 * 60 * 1000, // 24 h
        metadata: { timezoneOffset: 0 },
      });

      const conversationId = await ctx.db.insert("conversations", {
        threadId: agentThreadId,
        organizationId,
        contactSessionId,
        status: "unresolved",
      });

      conversation = await ctx.db.get(conversationId);
    }

    if (!conversation) return;

    // 3. Save message to the proper agent thread
    const role = args.role === "user" ? "user" : "assistant";
    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: role === "user" ? "User" : "AI Assistant",
      message: { role, content: args.content },
    });

    console.log(
      `[Vapi] Saved ${role} message to thread ${conversation.threadId}`
    );
  },
});


// ─────────────────────────────────────────────────────────────
// saveVapiCallTranscript  (called once at end-of-call-report)
// Saves the complete conversation transcript in one shot.
// ─────────────────────────────────────────────────────────────
export const saveVapiCallTranscript = internalMutation({
  args: {
    assistantId: v.string(),
    vapiCallId: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("bot"), v.literal("system"), v.literal("tool")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. Resolve Organisation
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_vapi_assistant_id", (q) =>
        q.eq("vapiSettings.assistantId", args.assistantId)
      )
      .unique();

    if (!widgetSettings) {
      console.warn(
        `[Vapi EoC] No widgetSettings for assistantId ${args.assistantId}`
      );
      return;
    }

    const organizationId = widgetSettings.organizationId;

    // 2. Find existing conversation by vapiCallId stored in contactSession.name
    let conversation = null;
    const sessions = await ctx.db
      .query("contactSession")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
      .collect();

    const matchingSession = sessions.find(
      (s) => s.name === `vapi:${args.vapiCallId}`
    );

    if (matchingSession) {
      conversation = await ctx.db
        .query("conversations")
        .withIndex("by_contact_session_id", (q) =>
          q.eq("contactSessionId", matchingSession._id)
        )
        .unique();
    }

    // 3. If no conversation yet create one fresh
    let agentThreadId: string;
    if (!conversation) {
      const result = await supportAgent.createThread(ctx, {});
      agentThreadId = result.threadId;

      const contactSessionId = await ctx.db.insert("contactSession", {
        name: `vapi:${args.vapiCallId}`,
        email: "vapi@call.ai",
        organizationId,
        expireAt: Date.now() + 24 * 60 * 60 * 1000,
        metadata: { timezoneOffset: 0 },
      });

      const conversationId = await ctx.db.insert("conversations", {
        threadId: agentThreadId,
        organizationId,
        contactSessionId,
        status: "unresolved",
      });

      conversation = await ctx.db.get(conversationId);
    } else {
      agentThreadId = conversation.threadId;
    }

    if (!conversation) return;

    // 4. Save all transcript messages (skip system/tool roles)
    const saveable = args.messages.filter(
      (m) => m.role === "user" || m.role === "assistant" || m.role === "bot"
    );

    for (const msg of saveable) {
      const role = msg.role === "user" ? "user" : "assistant";
      await saveMessage(ctx, components.agent, {
        threadId: agentThreadId,
        agentName: role === "user" ? "User" : "AI Assistant",
        message: { role, content: msg.content },
      });
    }

    console.log(
      `[Vapi EoC] Saved ${saveable.length} messages to thread ${agentThreadId}`
    );
  },
});
