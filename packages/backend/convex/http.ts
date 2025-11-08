import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

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
