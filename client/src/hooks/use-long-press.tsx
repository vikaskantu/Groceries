import { useCallback, useRef } from "react";

export function useLongPress(onLongPress: () => void, delay: number = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    timeoutRef.current = setTimeout(() => {
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}
