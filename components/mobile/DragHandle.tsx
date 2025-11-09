interface DragHandleProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function DragHandle({
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
}: DragHandleProps) {
  return (
    <div
      className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      role="separator"
      aria-label="Drag to resize"
    >
      <div className="w-10 h-1 bg-foreground/30 rounded-full" />
    </div>
  );
}
