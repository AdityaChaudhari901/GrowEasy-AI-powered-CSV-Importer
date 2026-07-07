"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent
} from "react";

type UseVirtualRowsOptions = {
  rowCount: number;
  rowHeight: number;
  overscan?: number;
  defaultViewportHeight?: number;
};

export type VirtualRow = {
  index: number;
};

export function useVirtualRows({
  rowCount,
  rowHeight,
  overscan = 8,
  defaultViewportHeight = 420
}: UseVirtualRowsOptions) {
  const scrollElementRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(defaultViewportHeight);

  const setScrollElement = useCallback(
    (node: HTMLDivElement | null) => {
      scrollElementRef.current = node;
      setScrollTop(node?.scrollTop ?? 0);
      setViewportHeight(node?.clientHeight || defaultViewportHeight);
    },
    [defaultViewportHeight]
  );

  useEffect(() => {
    const node = scrollElementRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setViewportHeight(entry?.contentRect.height || defaultViewportHeight);
    });
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [defaultViewportHeight]);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const virtualRows = useMemo(() => {
    if (rowCount === 0) {
      return {
        items: [] as VirtualRow[],
        paddingTop: 0,
        paddingBottom: 0
      };
    }

    const visibleCount = Math.ceil(viewportHeight / rowHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      rowCount - 1,
      startIndex + visibleCount + overscan * 2
    );
    const items = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, offset) => ({
        index: startIndex + offset
      })
    );

    return {
      items,
      paddingTop: startIndex * rowHeight,
      paddingBottom: Math.max(0, (rowCount - endIndex - 1) * rowHeight)
    };
  }, [overscan, rowCount, rowHeight, scrollTop, viewportHeight]);

  return {
    ...virtualRows,
    handleScroll,
    setScrollElement
  };
}
