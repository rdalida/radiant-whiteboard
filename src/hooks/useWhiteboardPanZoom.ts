import { useState, useCallback } from 'react';

export function useWhiteboardPanZoom() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);

  // Mouse wheel zoom logic
  const handleWheel = useCallback((e: React.WheelEvent, whiteboardRef: React.RefObject<HTMLDivElement>) => {
    if (e.ctrlKey) return; // Let browser handle pinch-zoom
    e.preventDefault();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const prevZoom = zoom;
    let newZoom = zoom * (e.deltaY < 0 ? 1.1 : 0.9);
    newZoom = Math.max(0.2, Math.min(3, newZoom));
    setPan(pan => ({
      x: (pan.x - mouseX) * (newZoom / prevZoom) + mouseX,
      y: (pan.y - mouseY) * (newZoom / prevZoom) + mouseY
    }));
    setZoom(newZoom);
  }, [zoom]);

  // Mouse drag for panning
  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX, y: clientY });
  }, []);

  const movePan = useCallback((clientX: number, clientY: number) => {
    setPan(prev => ({
      x: prev.x + (clientX - (panStart?.x ?? clientX)),
      y: prev.y + (clientY - (panStart?.y ?? clientY))
    }));
    setPanStart({ x: clientX, y: clientY });
  }, [panStart]);

  const endPan = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    handleWheel,
    startPan,
    movePan,
    endPan
  };
}
