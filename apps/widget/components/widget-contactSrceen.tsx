"use client";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useState } from "react";
import { screenAtom, widgetSettingsAtom } from "./widget-atom";
import { useVapi } from "@/hooks/use-vapi";
import { WidgetHeader } from "./widget-header";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, MicIcon, MicOffIcon, PhoneIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";

const WidgetContactScreen = () => {
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const setScreen = useSetAtom(screenAtom);
  const phoneNumber = widgetSettings?.vapiSettings.phoneNumber;
  const [copied, setCopied] = useState(false);
  const { transcript, isSpeaking, connected, startCall, endCall } = useVapi();
  const handleCopy = async () => {
    if (!phoneNumber) {
      return;
    }
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <>
      <WidgetHeader>
        <div className="flex  items-center gap-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setScreen("selection");
            }}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Voice Chat</p>
        </div>
      </WidgetHeader>
    <div className="flex h-full flex-col items-center justify-center gap-y-4">
        <div className="flex items-center justify-center rounded=full border bg-white p-3">
            <PhoneIcon className="size-6 text-muted-foreground"/>
        </div>
        <p className="text-muted-foreground">Available 24/7</p>
        <p className="text-muted-foreground">{phoneNumber}</p>
    </div>
    </>
  );
};

export default WidgetContactScreen;
