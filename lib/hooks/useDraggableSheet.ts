import { useState, useEffect, useCallback, useRef } from "react";
import { MOBILE_SHEET_HEIGHT } from "@/lib/constants/navigation";

interface UseDraggableSheetReturn {
  dragHeight: number;
  isDragging: boolean;
  isExpanded: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  expand: () => void;
  sheetRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for managing draggable bottom sheet behavior
 * Handles both touch and mouse events with automatic snapping to predefined positions
 */
export function useDraggableSheet(): UseDraggableSheetReturn {
  const [dragHeight, setDragHeight] = useState<number>(MOBILE_SHEET_HEIGHT.MIN);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const MAX_HEIGHT =
    typeof window !== "undefined"
      ? window.innerHeight * MOBILE_SHEET_HEIGHT.MAX_PERCENT
      : 600;

  const snapToNearestPosition = useCallback(() => {
    const snapPoints = [MOBILE_SHEET_HEIGHT.MIN, MAX_HEIGHT];
    const nearest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - dragHeight) < Math.abs(prev - dragHeight) ? curr : prev
    );
    setDragHeight(nearest);
  }, [dragHeight, MAX_HEIGHT]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      setIsDragging(true);
      setStartY(touch.clientY);
      setStartHeight(dragHeight);
    },
    [dragHeight]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (!touch) return;

      const currentY = touch.clientY;
      const diff = startY - currentY;
      const newHeight = Math.min(
        MAX_HEIGHT,
        Math.max(MOBILE_SHEET_HEIGHT.MIN, startHeight + diff)
      );
      setDragHeight(newHeight);
    },
    [isDragging, startY, startHeight, MAX_HEIGHT]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    snapToNearestPosition();
  }, [snapToNearestPosition]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setStartY(e.clientY);
      setStartHeight(dragHeight);
    },
    [dragHeight]
  );

  const expand = useCallback(() => {
    if (dragHeight <= MOBILE_SHEET_HEIGHT.MIN + 50) {
      setDragHeight(MAX_HEIGHT);
    }
  }, [dragHeight, MAX_HEIGHT]);

  // Mouse event handling
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentY = e.clientY;
      const diff = startY - currentY;
      const newHeight = Math.min(
        MAX_HEIGHT,
        Math.max(MOBILE_SHEET_HEIGHT.MIN, startHeight + diff)
      );
      setDragHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      snapToNearestPosition();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startY, startHeight, MAX_HEIGHT, snapToNearestPosition]);

  // Only consider expanded when actually snapped to MAX height
  const isExpanded = dragHeight > MAX_HEIGHT * 0.8;

  return {
    dragHeight,
    isDragging,
    isExpanded,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    expand,
    sheetRef,
  };
}
