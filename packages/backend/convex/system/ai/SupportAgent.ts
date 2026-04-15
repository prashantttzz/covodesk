import { google } from "@ai-sdk/google";
import { Agent } from "@convex-dev/agent";
import { components } from "../../_generated/api.js";
import { SUPPORT_AGENT_PROMPT } from "../../lib/constant.js";

export const supportAgent = new Agent(components.agent, {
  name: "supportAgent",
  languageModel: google("gemini-2.5-flash"),
  instructions: SUPPORT_AGENT_PROMPT,
});

