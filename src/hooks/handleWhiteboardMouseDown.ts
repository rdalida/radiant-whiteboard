import { MouseEvent } from 'react';

interface HandleWhiteboardMouseDownParams {
  e: MouseEvent;
  whiteboardRef: React.RefObject<HTMLDivElement>;
  pan: { x: number; y: number };
  zoom: number;
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setIsPanning: (val: boolean) => void;
  setPanStart: (val: { x: number; y: number } | null) => void;
  setMarquee: (val: { startX: number; startY: number; endX: number; endY: number } | null) => void;
  setIsDrawing: (val: boolean) => void;
  setCurrentPath: (path: any) => void;
  setIsDrawingArrow: (val: boolean) => void;
  setCurrentArrow: (arrow: any) => void;
  getRandomGradient: () => any;
}

export function handleWhiteboardMouseDown({
  e,
  whiteboardRef,
  pan,
  zoom,
  activeTool,
  setIsPanning,
  setPanStart,
  setMarquee,
  setIsDrawing,
  setCurrentPath,
  setIsDrawingArrow,
  setCurrentArrow,
  getRandomGradient
}: HandleWhiteboardMouseDownParams) {
  if (e.button === 2) {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    return;
  }
  if (e.button === 0) {
    const target = e.target as HTMLElement;
    const isResizeHandle = target.className?.includes('cursor-se-resize');
    const isControlButton = target.tagName === 'BUTTON' || target.className?.includes('control');
    if (!isResizeHandle && !isControlButton) {
      if (!whiteboardRef.current) return;
      const rect = whiteboardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      if (activeTool === 'pen') {
        setIsDrawing(true);
        const randomGradient = getRandomGradient();
        const gradientId = 'pen-gradient-' + Date.now().toString() + Math.random().toString(36).slice(2);
        const newPath = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          points: [{ x, y }],
          color: gradientId,
          strokeWidth: 2,
          createdAt: Date.now(),
          gradient: randomGradient
        };
        setCurrentPath(newPath);
        return;
      }
      if (e.shiftKey) {
        setIsDrawingArrow(true);
        setCurrentArrow({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          startX: x,
          startY: y,
          endX: x,
          endY: y
        });
        return;
      }
      setMarquee({ startX: x, startY: y, endX: x, endY: y });
    }
  }
}
