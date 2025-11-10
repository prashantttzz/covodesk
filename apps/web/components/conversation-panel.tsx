"use client";
import React from "react";
import { api } from "@workspace/backend/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useInfinteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Dicebear } from "@workspace/ui/components/Dicebear";
import ConversationStatusIcon from "@workspace/ui/components/conversation-status-icon";
import InfiniteScrollTrigger from "@workspace/ui/components/InfiniteScrollTrigger";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CornerUpLeftIcon,
  ListIcon,
} from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai/react";
import { statusfilteratom } from "./atom";
import { Skeleton } from "@workspace/ui/components/skeleton";

export const ConversationPanel = () => {
  const pathname = usePathname();
  const statusFilter = useAtomValue(statusfilteratom);
  const setStatusFilter = useSetAtom(statusfilteratom);
  const conversations = usePaginatedQuery(
    api.private.conversation.getMany,
    { status: statusFilter === "all" ? undefined : statusFilter },
    { initialNumItems: 10 }
  );
  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfinteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
    observerEnabled: true,
  });
  return (
    <div className="flex flex-col h-full w-full glass-chat text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) =>
            setStatusFilter(
              value as "escalated" | "resolved" | "unresolved" | "all"
            )
          }
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-1.5 hover:bg-accent ring-0 shadow-none hover:text-accent-foreground focus-visible:ring-0 ">
            <SelectValue placeholder="filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUp className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <Check className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowDown className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <SkeletionConversation />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-53px)]">
          <div className="flex flex-col flex-1 text-sm w-full">
            {conversations.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== "user";
              return (
                <Link
                  key={conversation._id}
                  className={cn(
                    "relative flex cursor-pointer items-start  gap-3 border-b p-4 py-5 leading-tight  hover:bg-accent hover:text-accent-foreground text-sm",
                    pathname === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                  href={`/conversations/${conversation._id}`}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                      pathname === `/conversations/${conversation._id}` &&
                        "opacity-100"
                    )}
                  />
                  <Dicebear
                    seed={conversation._id}
                    size={40}
                    className="shrink-0"
                  />
                  <div className="w-full flex flex-col flex-1 ">
                    <div className="flex">
                      <div className="flex w-full items-center gap-2">
                        <span className="truncate font-bold">
                          {conversation.contactSession.name}
                        </span>
                        <span className=" ml-auto shrink-0 text-muted-foreground text-xs">
                          {formatDistanceToNow(conversation._creationTime)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 ">
                      <div className="flex w-0  grow items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            " text-xs truncate text-muted-foreground",
                            !isLastMessageFromOperator &&
                              "font-bold text-md text-blue-500"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export const SkeletionConversation = () => {
  return (
    <div className="flex-1 flex min-h-0 flex-col gap-2 overflow-auto">
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="w-full space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="flex items-start gap-3 rounded-lg p-4" key={index}>
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
