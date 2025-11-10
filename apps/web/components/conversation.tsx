"use client";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@workspace/ui/components/form";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIConversation,
  AIConversationContent,
} from "@workspace/ui/components/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { useQuery, useMutation, useAction } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { Dicebear } from "@workspace/ui/components/Dicebear";
import ConversationStatusButton from "./ConversationStatusButton";
import { useInfinteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import InfiniteScrollTrigger from "@workspace/ui/components/InfiniteScrollTrigger";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";
import ContactDialog from "./contact-panel";

const formSchema = z.object({
  message: z.string().min(2, "message is required"),
});

const Conversation = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const [updating, isUpdating] = useState(false);
  const conversation = useQuery(api.private.conversation.getOne, {
    conversationId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const createMessages = useMutation(api.private.messages.messages);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessages({
        conversationId,
        prompt: values.message,
      });
      form.reset();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const [isEnhancing, setIsEnhancing] = useState(false);
  const enhanceResponse = useAction(api.private.messages.enhanceResponse);

  const handleEnhanceResponse = async () => {
    const currentValue = form.getValues("message");
    try {
      setIsEnhancing(true);
      const response = await enhanceResponse({ prompt: currentValue });
      form.setValue("message", response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation?.threadId } : "skip",
    { initialNumItems: 10 }
  );

  const { topElementRef, canLoadMore, handleLoadMore, isLoadingMore } =
    useInfinteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
      observerEnabled: true,
    });

  const updateConversationStatus = useMutation(
    api.private.conversation.updateStatus
  );

  const handleStatusToggle = async () => {
    isUpdating(true);
    if (!conversation) return null;

    let newStatus: "resolved" | "unresolved" | "escalated";
    if (conversation.status === "unresolved") newStatus = "escalated";
    else if (conversation.status === "escalated") newStatus = "resolved";
    else newStatus = "unresolved";

    try {
      await updateConversationStatus({ conversationId, status: newStatus });
    } catch (error) {
      console.error(error);
    } finally {
      isUpdating(false);
    }
  };

  
  if (conversation === undefined || messages.status === "LoadingFirstPage") {
    return <ConversationIdLoading />;
  }

  return (
    <div className="flex flex-col h-screen bg-card">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card p-2.5">
      <ContactDialog/>
        {!!conversation && (
          <ConversationStatusButton
            disabled={updating}
            onClick={handleStatusToggle}
            status={conversation.status}
          />
        )}
      </header>

      {/* Scrollable Chat Section */}
      <div className="flex-1 overflow-y-auto">
        <AIConversation className="min-h-full">
          <AIConversationContent>
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
            {toUIMessages(messages.results ?? [])?.map((message) => (
              <AIMessage
                from={message.role === "user" ? "assistant" : "user"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>
                {message.role === "user" && (
                  <Dicebear
                    seed={conversation?.contactSessionId ?? ""}
                    size={32}
                  />
                )}
              </AIMessage>
            ))}
          </AIConversationContent>
        </AIConversation>
      </div>

      {/* Fixed Input Section */}
      <div className="sticky bottom-0  bg-transparent p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={
                    conversation?.status === "resolved" ||
                    form.formState.isSubmitting
                  }
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit);
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved"
                      : "Type your response as an operator..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar className="bg-card">
              <AIInputTools>
                <AIInputButton
                  disabled={conversation?.status === "resolved" || isEnhancing}
                  onClick={handleEnhanceResponse}
                >
                  <Wand2Icon />
                  {isEnhancing ? "Enhancing..." : "Enhance"}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};

export default Conversation;

export const ConversationIdLoading = () => {
  return (
    <div className="flex h-screen flex-col bg-card">
      <header className="flex items-center justify-between border-b  bg-card p-2.5">
        <Button variant="ghost" disabled size="sm">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 8 }, (_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[index % widths.length];
            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                  isUser ? "is-user" : "is-assistant flex-row-reverse"
                )}
                key={index}
              >
                <Skeleton
                  className={`h-full ${width} rounded-lg bg-neutral-700`}
                />
                <Skeleton className={`size-8  rounded-full bg-neutral-800`} />
              </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>
      <div className="p-2">
        <AIInput>
          <AIInputTextarea
            
            className="bg-card"
            placeholder=" type your response as an operator"
          />
        </AIInput>
      </div>
    </div>
  );
};
