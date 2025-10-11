import React from "react";
import { WidgetHeader } from "./widget-header";
import { ArrowLeft } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "./widget-atom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import StatusConversation from "./status-conversation";

const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdFamily(organizationId || "")
  );
  const setConversationId = useSetAtom(conversationIdAtom);
  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId ? { contactSessionId } : "skip",
    {
      initialNumItems: 10,
    }
  );
  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeft />
          </Button>{" "}
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto ">
        {conversations?.results.length > 0 &&
          conversations.results.map((conversation) => (
            <Button
              className="h-20 w-full  justify-between"
              key={conversation._id}
              variant="outline"
              onClick={() => {
                setConversationId(conversation._id);
                setScreen("chat");
              }}
            >
              <div className="flex w-full flex-col gap-4 overflow-hidden text-start ">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-muted-foreground "> chat</p>
                  <p className="text-muted-foreground ">
                    {" "}
                    {formatDistanceToNow(new Date(conversation._createTime))}
                  </p>
                </div>
                <div className="w-full flex items-center justify-between  gap-x-2">
                  <p className="truncate text-sm">
                    {conversation.lastMessage?.text}
                  </p>
                  <StatusConversation status={conversation.status}/>
                </div>
              </div>
            </Button>
          ))}{" "}
      </div>
    </>
  );
};

export default WidgetInboxScreen;
