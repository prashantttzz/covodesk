import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { httpAction } from "./_generated/server.js";
import { api, internal } from "./_generated/api.js";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("error ocurred", { status: 400 });
    }
    switch (event.type) {
      case "subscription.updated": {
        const subscriptions = event.data as {
          status: string;
          payer?: {
            organization_id: string;
          };
        };

        const organizationId = subscriptions.payer?.organization_id;
        if (!organizationId) {
          return new Response("Missing organizationId", { status: 400 });
        }
        const newMaxAllowedMembership =
          subscriptions.status === "active" ? 5 : 1;
        await clerkClient.organizations.updateOrganization(organizationId, {
          maxAllowedMemberships: newMaxAllowedMembership,
        });
        await ctx.runMutation(internal.system.subscription.upsert, {
          organizationId,
          status: subscriptions.status,
        });
        break;
      }
      default:
        console.log("ignore clerk webhook", event.type);
    }
    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/vapi",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadBuffer = await request.arrayBuffer();
    const payloadString = new TextDecoder().decode(payloadBuffer);
    const payload = JSON.parse(payloadString);

    const msgType = payload.message?.type;
    console.log(`[Vapi Webhook] Type: ${msgType}`);

    // ── 1. Tool Calls ──────────────────────────────────────────────────────
    if (msgType === "tool-calls") {
      const toolCalls = payload.message.toolCalls;
      const assistantId = payload.message.assistant?.id;

      const results = await Promise.all(
        toolCalls.map(async (toolCall: any) => {
          if (toolCall.function.name === "search_knowledge_base") {
            const args =
              typeof toolCall.function.arguments === "string"
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function.arguments;
            const { result } = await ctx.runAction(api.public.vapi.search, {
              assistantId,
              query: args.query,
            });
            return {
              toolCallId: toolCall.id,
              result: result || "No information found.",
            };
          }
          return {
            toolCallId: toolCall.id,
            error: "Tool not found",
          };
        })
      );

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── 2. End-of-Call Report  (PRIMARY save mechanism) ────────────────────
    // Vapi sends the complete transcript here when the call ends.
    if (msgType === "end-of-call-report") {
      const report = payload.message;
      const assistantId =
        report?.assistant?.id ||
        report?.call?.assistantId ||
        payload.call?.assistantId;
      const vapiCallId = report?.call?.id || payload.call?.id;

      if (!assistantId || !vapiCallId) {
        console.warn("[Vapi EoC] Missing assistantId or callId", {
          assistantId,
          vapiCallId,
        });
        return new Response(JSON.stringify({ message: "Missing IDs" }), {
          status: 200,
        });
      }

      // The transcript is in report.artifact.messages or report.messages
      const rawMessages: any[] =
        report?.artifact?.messages ||
        report?.messages ||
        [];

      // Normalize to { role, content }
      const messages = rawMessages
        .filter(
          (m: any) =>
            (m.role === "user" || m.role === "assistant" || m.role === "bot") &&
            typeof m.content === "string" &&
            m.content.trim().length > 0
        )
        .map((m: any) => ({
          role: m.role as "user" | "assistant" | "bot",
          content: m.content as string,
        }));

      console.log(
        `[Vapi EoC] CallId: ${vapiCallId}, Messages: ${messages.length}`
      );

      if (messages.length > 0) {
        await ctx.runMutation(internal.system.vapi.saveVapiCallTranscript, {
          assistantId,
          vapiCallId,
          messages,
        });
      }

      return new Response(JSON.stringify({ message: "End-of-call processed" }), {
        status: 200,
      });
    }

    // ── 3. Real-time Transcript (live per-utterance saving) ─────────────────
    if (
      msgType === "transcript" &&
      payload.message?.transcriptType === "final"
    ) {
      const { role, transcript, call: messageCall, assistant } =
        payload.message;

      const vapiCallId = messageCall?.id || payload.call?.id;
      const assistantId = assistant?.id || payload.call?.assistantId;

      if (!vapiCallId || !assistantId) {
        console.warn("[Vapi Transcript] Missing callId or assistantId");
        return new Response(JSON.stringify({ message: "Missing IDs" }), {
          status: 200,
        });
      }

      console.log(
        `[Vapi Transcript] Role: ${role}, CallId: ${vapiCallId}, AssistantId: ${assistantId}`
      );

      await ctx.runMutation(internal.system.vapi.saveVapiMessage, {
        assistantId,
        vapiCallId,
        role: role as "user" | "assistant" | "bot",
        content: transcript,
      });

      return new Response(JSON.stringify({ message: "Transcript saved" }), {
        status: 200,
      });
    }

    // ── 4. Conversation Update (first-message sync) ─────────────────────────
    if (msgType === "conversation-update") {
      const { messages, call: messageCall, assistant } = payload.message;
      const vapiCallId = messageCall?.id || payload.call?.id;
      const assistantId = assistant?.id;

      if (messages && messages.length > 0 && vapiCallId && assistantId) {
        const firstMessage = messages[0];
        if (
          firstMessage.role === "assistant" ||
          firstMessage.role === "bot"
        ) {
          await ctx.runMutation(internal.system.vapi.saveVapiMessage, {
            assistantId,
            vapiCallId,
            role: "assistant",
            content: firstMessage.content,
          });
        }
      }

      return new Response(JSON.stringify({ message: "Sync processed" }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: "Event ignored" }), {
      status: 200,
    });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error(`error verifying webhook event`, error);
    return null;
  }
}
export default http;
