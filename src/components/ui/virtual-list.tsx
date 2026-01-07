import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * Virtualized list component for rendering large datasets efficiently
 * Only renders visible items plus overscan buffer
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
  onEndReached,
  endReachedThreshold = 100,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [endReachedCalled, setEndReachedCalled] = useState(false);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems, offsetY } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end + 1),
      offsetY: start * itemHeight,
      totalHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check if near end for infinite scroll
    if (onEndReached && !endReachedCalled) {
      const distanceFromEnd = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distanceFromEnd < endReachedThreshold) {
        setEndReachedCalled(true);
        onEndReached();
      }
    }
  }, [onEndReached, endReachedCalled, endReachedThreshold]);

  // Reset endReachedCalled when items change
  useEffect(() => {
    setEndReachedCalled(false);
  }, [items.length]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for windowed/virtualized data
 * Returns only the visible subset of items
 */
export function useVirtualWindow<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  itemHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    updateHeight();
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return useMemo(() => {
    if (containerHeight === 0) {
      return {
        visibleItems: items.slice(0, 20), // Initial render
        startIndex: 0,
        endIndex: Math.min(19, items.length - 1),
        totalHeight: items.length * itemHeight,
        offsetY: 0,
      };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return {
      visibleItems: items.slice(start, end + 1),
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * itemHeight,
      offsetY: start * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);
}

/**
 * Infinite scroll hook for loading more data
 */
export function useInfiniteScroll(
  containerRef: React.RefObject<HTMLElement>,
  onLoadMore: () => void,
  options: {
    threshold?: number;
    enabled?: boolean;
    hasMore?: boolean;
  } = {}
) {
  const { threshold = 100, enabled = true, hasMore = true } = options;
  const loadingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || !hasMore) return;

    const handleScroll = () => {
      if (loadingRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold) {
        loadingRef.current = true;
        onLoadMore();
        // Reset after a short delay
        setTimeout(() => {
          loadingRef.current = false;
        }, 500);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, onLoadMore, threshold, enabled, hasMore]);
}
