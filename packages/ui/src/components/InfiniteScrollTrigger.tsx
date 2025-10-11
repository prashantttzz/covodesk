import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
interface props {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoretext?: string;
  noMoreText?: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}
const InfiniteScrollTrigger = ({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  loadMoretext,
  noMoreText = "no more chat to load",
  className,
  ref,
}: props) => {
  let text = "load more";
  if (isLoadingMore) {
    text = "loading...";
  } else if (!canLoadMore) {
    text = noMoreText;
  }
  return (
    <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
      <Button
        disabled={isLoadingMore || !canLoadMore}
        onClick={onLoadMore}
        size="sm"
        variant="ghost"
      >
        {text}
      </Button>
    </div>
  );
};

export default InfiniteScrollTrigger;
