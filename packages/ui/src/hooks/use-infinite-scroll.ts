import { useCallback, useEffect, useRef } from "react";

interface prop {
  loadMore: (numItems: number) => void;
  observerEnabled: boolean;
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadSize: number;
}

export const useInfinteScroll = ({
  status,
  loadMore,
  loadSize = 10,
  observerEnabled = true,
}: prop) => {
  const topElementRef = useRef<HTMLDivElement>(null);
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(loadSize);
    }
  }, [status, loadMore, loadSize]);

  useEffect(() => {
    const topElement = topElementRef.current;
    if (!(topElement && observerEnabled)) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(topElement);
  }, [handleLoadMore, observerEnabled]);
  return {
    topElementRef,
    handleLoadMore,
    canLoadMore: status === "CanLoadMore",
    isLoadingFirstPage: status === "LoadingFirstPage",
    isLoadingMore: status === "LoadingMore",
    isExhausted: status === "Exhausted",
  };
};
