import React, { useState } from "react";
import { WidgetHeader } from "./widget-header";
import { Button } from "@workspace/ui/components/button";
import { ChevronRightIcon, MessageSquareTextIcon, MicIcon, PhoneIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdFamily,
  conversationIdAtom,
  errorAtom,
  hasVapiSecretsAtom,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom,
} from "./widget-atom";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setErrorMessage = useSetAtom(errorAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom)
  const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom)
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
          <p className="text-xl"> let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
        <Button
          variant="outline"
          className="h-16 w-full glass-light !bg-card justify-between"
          onClick={handleConversations}
          disabled={isPending}
        >
          <div className="flex items-center  gap-x-2">
            <MessageSquareTextIcon />
            <span>Start chat</span>
          </div>
          <ChevronRightIcon />
        </Button>
      {hasVapiSecrets && widgetSettings?.vapiSettings.assistantId && (
          <Button
          variant="outline"
          className="h-16 w-full justify-between !bg-card glass-light"
          onClick={()=>setScreen("voice")}
          disabled={isPending}
        >
          <div className="flex items-center  gap-x-2">
            <MicIcon />
            <span>Start voice call</span>
          </div>
          <ChevronRightIcon />
        </Button>
      )}
      {hasVapiSecrets && widgetSettings?.vapiSettings.phoneNumber && (
          <Button
          variant="outline"
          className="h-16 w-full justify-between"
          onClick={()=>setScreen("contact")}
          disabled={isPending}
        >
          <div className="flex items-center  gap-x-2">
            <PhoneIcon />
            <span>Call us</span>
          </div>
          <ChevronRightIcon />
        </Button>
      )}
      </div>
    </>
  );
};

export default WidgetSelectionScreen;
