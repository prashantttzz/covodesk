import { google } from "@ai-sdk/google";
import { Agent } from "@convex-dev/agent";
import { components } from "../../_generated/api";

export const supportAgent = new Agent(components.agent, {
  chat: google.chat("gemini-2.5-flash"),
  instructions: `you are a customer support agent ,use "resolveConversation" tool when user express finalization of the conversation. use "EscalatedConversation" tool when user expresses frustration or request a human explicitly `,
});
