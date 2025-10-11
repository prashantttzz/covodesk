import React, { useState } from "react";
import { WidgetHeader } from "./widget-header";
import { Button } from "@workspace/ui/components/button";
import { ChevronRightIcon, MessageSquareTextIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdFamily,
  conversationIdAtom,
  errorAtom,
  organizationIdAtom,
  screenAtom,
} from "./widget-atom";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setErrorMessage = useSetAtom(errorAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdFamily(organizationId || "")
  );
  const [isPending,setIsPending] = useState(false);

  const createConversation = useMutation(api.public.conversations.create);
  
  const handleConversations = async () => {
    if (!organizationId) {
      setScreen("error");
      setErrorMessage("missing organization id");
      return;
    }
    if (!contactSessionId) {
      setScreen("auth");
      return;
    }
      setIsPending(true)
    try {
      const conversationId = await createConversation({
        organizationId,
        contactSessionId,
      });
      setConversationId(conversationId)
      setScreen("chat");
    } catch (error) {
      setScreen("auth");
    }finally{
      setIsPending(false)
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-1 flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi there! </p>
          <p className="text-xl"> het&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
        <Button
          variant="outline"
          className="h-16 w-full justify-between"
          onClick={handleConversations}
          disabled={isPending}
        >
          <div className="flex items-center  gap-x-2">
            <MessageSquareTextIcon />
            <span>Start chat</span>
          </div>
          <ChevronRightIcon />
        </Button>
      </div>
    </>
  );
};

export default WidgetSelectionScreen;
