import { createTool } from "@convex-dev/agent";
import {z} from "zod";
import { internal } from "../../_generated/api";
import { supportAgent } from "../ai/SupportAgent";

export const resolveConversation= createTool({
    description:"resolve a conversation",
    args:z.object({}),
    handler:async(ctx)=>{
   if(!ctx.threadId){
    return "missing thread id"
   }

   await ctx.runMutation(internal.system.conversation.resolve,{
    threadId:ctx.threadId
   })
   await supportAgent.saveMessage(ctx,{
    threadId:ctx.threadId,
    message:{
        role:"assistant",
        content:"conversation resolved"
    }
   })
   return "conversation resolved"
    }
})