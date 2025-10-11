import Conversation from "@/components/conversation";
import { Id } from "@workspace/backend/_generated/dataModel";

import React from "react";

const page = async ({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) => {
  const { conversationId } = await params;
  return (
    <Conversation conversationId={conversationId as Id<"conversations">} />
  );
};

export default page;
