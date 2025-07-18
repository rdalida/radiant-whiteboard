import { MouseEvent } from 'react';

interface HandleWhiteboardMouseMoveParams {
  e: MouseEvent;
  whiteboardRef: React.RefObject<HTMLDivElement>;
  pan: { x: number; y: number };
  zoom: number;
  isPanning: boolean;
  panStart: { x: number; y: number } | null;
  setPan: (val: any) => void;
  setPanStart: (val: { x: number; y: number } | null) => void;
  isDrawing: boolean;
  currentPath: any;
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setCurrentPath: (path: any) => void;
  draggingShape: string | null;
  dragShapeStart: { x: number; y: number; offsetX: number; offsetY: number } | null;
  setShapes: (fn: any) => void;
  draggingBox: string | null;
  dragBoxStart: { x: number; y: number; offsetX: number; offsetY: number } | null;
  setTextBoxes: (fn: any) => void;
  draggingImage: string | null;
  dragImageStart: { x: number; y: number; offsetX: number; offsetY: number } | null;
  setImages: (fn: any) => void;
  resizingBox: string | null;
  resizeStart: { x: number; y: number; width: number; height: number; fontSize: number };
  setTextBoxesResize: (fn: any) => void;
  resizingShape: string | null;
  setShapesResize: (fn: any) => void;
  resizingImage: string | null;
  setImagesResize: (fn: any) => void;
  setLastMousePos: (pos: { x: number; y: number }) => void;
  marquee: { startX: number; startY: number; endX: number; endY: number } | null;
  setMarquee: (fn: any) => void;
}

export function handleWhiteboardMouseMove({
  e,
  whiteboardRef,
  pan,
  zoom,
  isPanning,
  panStart,
  setPan,
  setPanStart,
  isDrawing,
  currentPath,
  activeTool,
  setCurrentPath,
  draggingShape,
  dragShapeStart,
  setShapes,
  draggingBox,
  dragBoxStart,
  setTextBoxes,
  draggingImage,
  dragImageStart,
  setImages,
  resizingBox,
  resizeStart,
  setTextBoxesResize,
  resizingShape,
  setShapesResize,
  resizingImage,
  setImagesResize,
  setLastMousePos,
  marquee,
  setMarquee
}: HandleWhiteboardMouseMoveParams) {
  if (isPanning && panStart) {
    setPan({
      x: pan.x + (e.clientX - panStart.x),
      y: pan.y + (e.clientY - panStart.y)
    });
    setPanStart({ x: e.clientX, y: e.clientY });
    return;
  }
  if (isDrawing && currentPath && activeTool === 'pen') {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setCurrentPath((prev: any) => prev ? {
      ...prev,
      points: [...prev.points, { x, y }]
    } : null);
    return;
  }
  if (draggingShape && dragShapeStart) {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setShapes((prev: any[]) => prev.map((shape: any) =>
      shape.id === draggingShape
        ? { ...shape, x: mouseX - dragShapeStart.offsetX, y: mouseY - dragShapeStart.offsetY }
        : shape
    ));
    return;
  }
  if (draggingBox && dragBoxStart) {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setTextBoxes((prev: any[]) => prev.map((box: any) =>
      box.id === draggingBox
        ? { ...box, x: mouseX - dragBoxStart.offsetX, y: mouseY - dragBoxStart.offsetY }
        : box
    ));
    return;
  }
  if (draggingImage && dragImageStart) {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setImages((prev: any[]) => prev.map((img: any) =>
      img.id === draggingImage
        ? { ...img, x: mouseX - dragImageStart.offsetX, y: mouseY - dragImageStart.offsetY }
        : img
    ));
    return;
  }
  if (resizingBox) {
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(100, resizeStart.width + deltaX);
    const newHeight = Math.max(30, resizeStart.height + deltaY);
    const scaleFactor = Math.max(newWidth / resizeStart.width, newHeight / resizeStart.height);
    const newFontSize = resizeStart.fontSize * scaleFactor;
    setTextBoxesResize((textBoxes: any[]) => textBoxes.map((box: any) =>
      box.id === resizingBox ? {
        ...box,
        width: newWidth,
        height: newHeight,
        fontSize: newFontSize
      } : box
    ));
    return;
  }
  if (resizingShape) {
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(50, resizeStart.width + deltaX);
    const newHeight = Math.max(50, resizeStart.height + deltaY);
    setShapesResize((shapes: any[]) => shapes.map((shape: any) =>
      shape.id === resizingShape ? {
        ...shape,
        width: newWidth,
        height: newHeight
      } : shape
    ));
    return;
  }
  if (resizingImage) {
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(50, resizeStart.width + deltaX);
    const newHeight = Math.max(50, resizeStart.height + deltaY);
    setImagesResize((images: any[]) => images.map((img: any) =>
      img.id === resizingImage ? {
        ...img,
        width: newWidth,
        height: newHeight
      } : img
    ));
    return;
  }
  if (whiteboardRef.current) {
    const rect = whiteboardRef.current.getBoundingClientRect();
    setLastMousePos({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    });
    if (marquee) {
      setMarquee((m: any) => m ? { ...m, endX: (e.clientX - rect.left - pan.x) / zoom, endY: (e.clientY - rect.top - pan.y) / zoom } : null);
    }
  }
}
