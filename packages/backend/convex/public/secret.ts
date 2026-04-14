import { v } from "convex/values";
import { action } from "../_generated/server.js";


export const getVapiSecret = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Hardcoded Vapi secrets for development
    return {
      publicApiKey: "49f19367-ea0f-4e74-9325-0c43dd396b62",
    };
  },
});

