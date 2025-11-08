"use client";
import { useSetAtom } from "jotai";
import React from "react";
import { screenAtom } from "./widget-atom";
import { useVapi } from "@/hooks/use-vapi";
import { WidgetHeader } from "./widget-header";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, MicIcon, MicOffIcon } from "lucide-react";
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

const WidgetVoiceScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const { transcript, isSpeaking, connected, startCall, endCall } = useVapi();
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
      {transcript.length > 0 ? (
        <AIConversation className="h-full flex-1">
          <AIConversationContent>
            {transcript.map((message, index) => (
              <AIMessage
                from={message.role}
                key={`${message.role}-${index}-${message.text}`}
              >
                <AIMessageContent>{message.text}</AIMessageContent>
              </AIMessage>
            ))}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
      ) : (
        <div className="flex flex-col items-center justify-center h-full flex-1 gap-y-4">
          <div className="flex items-center justify-center rounded-full border bg-white p-3">
            <MicIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Transcript will appear here</p>
        </div>
      )}
      <div className="border-t bg-background p-4">
        <div className="flex flex-col items-center gap-y-4">
          {connected && (
            <div className="flex items-center gap-x-2">
              <div
                className={cn(
                  "size-4 rounded-full",
                  isSpeaking ? "bg-red-500 animate-pulse" : "bg-green-500"
                )}
              />
              <span>
                {isSpeaking ? "Assistant speaking..." : "Listening.."}
              </span>
            </div>
          )}
          <div className="w-full flex justify-center">
            {connected ? (
              <Button
                className="w-full"
                size="lg"
                variant="destructive"
                onClick={() => endCall()}
              >
                {" "}
                <MicOffIcon />
                End Call
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={connected}
                size="lg"
                onClick={() => startCall()}
              >
                {" "}
                <MicIcon />
                Start Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WidgetVoiceScreen;
