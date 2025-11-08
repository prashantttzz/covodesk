import React, { useMemo } from "react";
import { WidgetHeader } from "./widget-header";
import { ArrowLeft, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import {
  AIConversation,
  AIConversationContent,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import {
  contactSessionIdFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom,
} from "./widget-atom";
import { Button } from "@workspace/ui/components/button";
import { useAction, useQuery } from "convex/react";
import {
  AISuggestions,
  AISuggestion,
} from "@workspace/ui/components/ai/suggestion";
import { api } from "@workspace/backend/_generated/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@workspace/ui/components/form";
import { Dicebear } from "@workspace/ui/components/Dicebear";
import { useInfinteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import InfiniteScrollTrigger from "@workspace/ui/components/InfiniteScrollTrigger";
const formSchema = z.object({
  message: z.string().min(1, "message is required"),
});
const WidgetChatScreen = () => {
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setScreen = useSetAtom(screenAtom);
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
  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 5,
    }
  );
  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfinteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
      observerEnabled: false,
    });
  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  const suggestions = useMemo(() => {
    if (!widgetSettings) {
      return [];
    }
    return Object.keys(widgetSettings.defaultSuggestions).map((key) => {
      return widgetSettings.defaultSuggestions[
        key as keyof typeof widgetSettings.defaultSuggestions
      ];
    });
  }, [widgetSettings]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  const createMessage = useAction(api.public.messages.messages);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) {
      return;
    }
    form.reset();
    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId,
    });
  };
  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          Chat
        </div>
        <Button variant="ghost" size="icon">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation>
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((mes) => {
            return (
              <AIMessage
                from={mes.role === "user" ? "user" : "assistant"}
                key={mes.id}
              >
                <AIMessageContent>
                  <AIResponse>{mes.content}</AIResponse>
                </AIMessageContent>
                {mes.role === "assistant" && (
                  <Dicebear seed="assistant" size={32} imageUrl="/logo.svg" />
                )}
              </AIMessage>
            );
          })}
        </AIConversationContent>
      </AIConversation>
      {toUIMessages(messages.results??[])?.length===1&& (

        <AISuggestions className="flex flex-col w-full items-end p-2">
        {suggestions.map((suggestion) => {
          if (!suggestion) {
            return null;
          }
          return (
            <AISuggestion
              key={suggestion}
              onClick={() => {
                form.setValue("message",suggestion,{
                  shouldValidate:true,
                  shouldDirty:true,
                  shouldTouch:true
                })
                form.handleSubmit(onSubmit)();
              }}
              suggestion={suggestion}
            ></AISuggestion>
          );
        })}
      </AISuggestions>
      ) }
      <Form {...form}>
        <AIInput
          className="rounded-none border-x-0 border-b-0"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            disabled={conversation?.status === "resolved"}
            name="message"
            render={({ field }) => (
              <AIInputTextarea
                disabled={conversation?.status === "resolved"}
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved"
                    ? "This conversation has been resolved"
                    : "type your message"
                }
                value={field.value}
              />
            )}
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit
              disabled={
                conversation?.status === "resolved" || !form.formState.isValid
              }
              status="ready"
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  );
};

export default WidgetChatScreen;
