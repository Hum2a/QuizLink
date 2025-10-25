import { useCallback, useRef, useState, useEffect } from 'react';

export interface TouchGesture {
  type:
    | 'swipe-left'
    | 'swipe-right'
    | 'swipe-up'
    | 'swipe-down'
    | 'tap'
    | 'long-press'
    | 'pinch'
    | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  velocity?: number;
  duration?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export interface TouchGestureOptions {
  swipeThreshold?: number;
  tapThreshold?: number;
  longPressDuration?: number;
  velocityThreshold?: number;
  preventDefault?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const useTouchGestures = (
  onGesture: (gesture: TouchGesture) => void,
  options: TouchGestureOptions = {}
) => {
  const {
    swipeThreshold = 50,
    tapThreshold = 10,
    longPressDuration = 500,
    velocityThreshold = 0.3,
    preventDefault = true,
  } = options;

  const [isTouching, setIsTouching] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<TouchPoint | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const elementRef = useRef<HTMLElement>(null);

  const calculateDistance = (
    point1: TouchPoint,
    point2: TouchPoint
  ): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateVelocity = (
    point1: TouchPoint,
    point2: TouchPoint
  ): number => {
    const distance = calculateDistance(point1, point2);
    const time = point2.timestamp - point1.timestamp;
    return time > 0 ? distance / time : 0;
  };

  const getDirection = (
    start: TouchPoint,
    end: TouchPoint
  ): 'left' | 'right' | 'up' | 'down' => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      setIsTouching(true);
      setTouchStart(touchPoint);
      setTouchCurrent(touchPoint);

      // Start long press timer
      const timer = window.setTimeout(() => {
        if (touchStart && touchCurrent) {
          const gesture: TouchGesture = {
            type: 'long-press',
            startX: touchStart.x,
            startY: touchStart.y,
            endX: touchCurrent.x,
            endY: touchCurrent.y,
            duration: Date.now() - touchStart.timestamp,
          };
          onGesture(gesture);
        }
      }, longPressDuration);

      setLongPressTimer(timer);
    },
    [preventDefault, longPressDuration, touchStart, touchCurrent, onGesture]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      if (!isTouching || !touchStart) return;

      const touch = e.touches[0];
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      setTouchCurrent(touchPoint);

      // Cancel long press if user moves too much
      const distance = calculateDistance(touchStart, touchPoint);
      if (distance > tapThreshold && longPressTimer) {
        window.clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    },
    [preventDefault, isTouching, touchStart, tapThreshold, longPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      if (!isTouching || !touchStart || !touchCurrent) return;

      // Clear long press timer
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      const distance = calculateDistance(touchStart, touchCurrent);
      const velocity = calculateVelocity(touchStart, touchCurrent);
      const duration = touchCurrent.timestamp - touchStart.timestamp;

      let gesture: TouchGesture = { type: 'none' };

      if (distance < tapThreshold && duration < longPressDuration) {
        // Tap gesture
        gesture = {
          type: 'tap',
          startX: touchStart.x,
          startY: touchStart.y,
          endX: touchCurrent.x,
          endY: touchCurrent.y,
          duration,
        };
      } else if (distance >= swipeThreshold && velocity >= velocityThreshold) {
        // Swipe gesture
        const direction = getDirection(touchStart, touchCurrent);
        gesture = {
          type: `swipe-${direction}` as TouchGesture['type'],
          direction,
          distance,
          velocity,
          duration,
          startX: touchStart.x,
          startY: touchStart.y,
          endX: touchCurrent.x,
          endY: touchCurrent.y,
        };
      }

      if (gesture.type !== 'none') {
        onGesture(gesture);
      }

      // Reset state
      setIsTouching(false);
      setTouchStart(null);
      setTouchCurrent(null);
    },
    [
      preventDefault,
      isTouching,
      touchStart,
      touchCurrent,
      longPressTimer,
      tapThreshold,
      longPressDuration,
      swipeThreshold,
      velocityThreshold,
      onGesture,
    ]
  );

  const handleTouchCancel = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      // Clear long press timer
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Reset state
      setIsTouching(false);
      setTouchStart(null);
      setTouchCurrent(null);
    },
    [preventDefault, longPressTimer]
  );

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: !preventDefault,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: !preventDefault,
    });
    element.addEventListener('touchend', handleTouchEnd, {
      passive: !preventDefault,
    });
    element.addEventListener('touchcancel', handleTouchCancel, {
      passive: !preventDefault,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    preventDefault,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return {
    elementRef,
    isTouching,
    touchStart,
    touchCurrent,
  };
};

export default useTouchGestures;
