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

    // Vapi sends tool-calls in message.toolCalls
    if (payload.message?.type === "tool-calls") {
      const toolCalls = payload.message.toolCalls;
      const assistantId = payload.message.assistant?.id;

      const results = await Promise.all(
        toolCalls.map(async (toolCall: any) => {
          if (toolCall.function.name === "search_knowledge_base") {
            const args = typeof toolCall.function.arguments === "string"
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
