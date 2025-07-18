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
  isDrawingArrow: boolean;
  currentArrow: any;
  setCurrentArrow: (arrow: any) => void;
  draggingArrow: string | null;
  dragArrowStart: { mouseX: number; mouseY: number; arrowPositions: { [id: string]: { startX: number; startY: number; endX: number; endY: number } } } | null;
  setArrows: (fn: any) => void;
  selectedArrows: string[];
  // REMOVED: draggingShape, dragShapeStart, setShapes
  // REMOVED: draggingBox, dragBoxStart, setTextBoxes
  draggingImage: string | null;
  dragImageStart: { x: number; y: number; offsetX: number; offsetY: number } | null;
  setImages: (fn: any) => void;
  resizingBox: string | null;
  resizeStart: { x: number; y: number; width: number; height: number; fontSize: number };
  setTextBoxesResize: (fn: any) => void;
  rotatingBox: string | null;
  rotateStart: { centerX: number; centerY: number; startAngle: number; initialRotation: number };
  setTextBoxesRotate: (fn: any) => void;
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
  isDrawingArrow,
  currentArrow,
  setCurrentArrow,
  draggingArrow,
  dragArrowStart,
  setArrows,
  selectedArrows,
  // REMOVED: draggingShape, dragShapeStart, setShapes
  // REMOVED: draggingBox, dragBoxStart, setTextBoxes
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
  rotatingBox,
  rotateStart,
  setTextBoxesRotate,
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
  if (isDrawingArrow && currentArrow) {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setCurrentArrow({ ...currentArrow, endX: x, endY: y });
    return;
  }
  // REMOVED: Shape dragging logic - now handled by universal dragging system
  if (draggingArrow && dragArrowStart) {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    // Calculate delta from current mouse position to drag start mouse position
    const deltaX = mouseX - dragArrowStart.mouseX;
    const deltaY = mouseY - dragArrowStart.mouseY;
    
    setArrows((prev: any[]) => prev.map((arrow: any) => {
      // Move all selected arrows using their original positions
      if (selectedArrows.includes(arrow.id) && dragArrowStart.arrowPositions[arrow.id]) {
        const originalPos = dragArrowStart.arrowPositions[arrow.id];
        return { 
          ...arrow, 
          startX: originalPos.startX + deltaX, 
          startY: originalPos.startY + deltaY, 
          endX: originalPos.endX + deltaX, 
          endY: originalPos.endY + deltaY 
        };
      }
      return arrow;
    }));
    return;
  }
  // REMOVED: Text box dragging logic - now handled by universal dragging system
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
  if (rotatingBox) {
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    const angle = Math.atan2(mouseY - rotateStart.centerY, mouseX - rotateStart.centerX);
    const delta = angle - rotateStart.startAngle;
    const newRotation = rotateStart.initialRotation + delta * (180 / Math.PI);
    setTextBoxesRotate((textBoxes: any[]) => textBoxes.map((box: any) =>
      box.id === rotatingBox ? { ...box, rotation: newRotation } : box
    ));
    return;
  }
  if (resizingBox) {
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const widthScale = (resizeStart.width + deltaX) / resizeStart.width;
    const heightScale = (resizeStart.height + deltaY) / resizeStart.height;
    const scale = Math.max(widthScale, heightScale);
    const newWidth = Math.max(120, resizeStart.width * scale);
    const newHeight = Math.max(30, resizeStart.height * scale);
    setTextBoxesResize((textBoxes: any[]) =>
      textBoxes.map((box: any) =>
        box.id === resizingBox
          ? {
              ...box,
              width: newWidth,
              height: newHeight,
              fontSize: resizeStart.fontSize * scale,
            }
          : box
      )
    );
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
