"use client";
import {

  contactSessionIdFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "./widget-atom";
import { useVapi } from "@/hooks/use-vapi";
import { WidgetHeader } from "./widget-header";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, Loader, MicIcon, MicOffIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useAtomValue, useSetAtom } from "jotai";
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
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdFamily(organizationId || "")
  );

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          contactSessionId,
          conversationId,
        }
      : "skip"
  );

  const createMessage = useAction(api.public.messages.messages);

  const {
    transcript,
    isSpeaking,
    connected,
    startCall,
    endCall,
    connecting,
    partialTranscript,
  } = useVapi((message) => {
    if (conversation?.threadId && contactSessionId) {
      // We don't await this as we want the UI to remain responsive
      createMessage({
        threadId: conversation.threadId,
        prompt: message.text,
        contactSessionId,
      }).catch((err) => {
        console.error("Failed to sync voice message to Convex:", err);
      });
    }
  });

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
      {transcript.length > 0 || partialTranscript ? (
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
            {partialTranscript && (
              <AIMessage from={partialTranscript.role} key="partial">
                <AIMessageContent className="opacity-70 italic">
                  {partialTranscript.text}
                </AIMessageContent>
              </AIMessage>
            )}
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
                disabled={connected ||connecting}
                size="lg"
                onClick={() => startCall()}
              >
                {connecting ? (
                  <Loader className="animate-spin" />
                ) : (
                  <>
                    <MicIcon />
                    Start Call
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WidgetVoiceScreen;
