import { RefObject } from 'react';

interface HandleMouseUpParams {
  isDrawing: boolean;
  currentPath: any;
  setDrawingPaths: (fn: any) => void;
  setCurrentPath: (val: any) => void;
  setIsDrawing: (val: boolean) => void;
  isDrawingArrow?: boolean;
  currentArrow?: any;
  setArrows?: (fn: any) => void;
  setCurrentArrow?: (val: any) => void;
  setIsDrawingArrow?: (val: boolean) => void;
  setResizingBox: (val: string | null) => void;
  setResizingShape: (val: string | null) => void;
  setResizingImage: (val: string | null) => void;
  setRotatingBox: (val: string | null) => void;
  // REMOVED: draggingShape, setDraggingShape, setDragShapeStart
  // REMOVED: draggingBox, setDraggingBox, setDragBoxStart  
  draggingImage: string | null;
  setDraggingImage: (val: string | null) => void;
  setDragImageStart: (val: any) => void;
  draggingArrow?: string | null;
  setDraggingArrow?: (val: string | null) => void;
  setDragArrowStart?: (val: any) => void;
  isPanning: boolean;
  setIsPanning: (val: boolean) => void;
  setPanStart: (val: any) => void;
  marquee: { startX: number; startY: number; endX: number; endY: number } | null;
  whiteboardRef: RefObject<HTMLDivElement>;
  textBoxes: any[];
  shapes: any[];
  arrows?: any[];
  mindMapNodes: any[];
  setSelectedBoxes: (val: string[]) => void;
  setSelectedShapes: (val: string[]) => void;
  setSelectedArrows?: (val: string[]) => void;
  setSelectedMindMapNodes: (val: string[]) => void;
  setMarquee: (val: any) => void;
  // Universal dragging end callback
  endDragCallback?: () => void;
}

export function handleMouseUp({
  isDrawing,
  currentPath,
  setDrawingPaths,
  setCurrentPath,
  setIsDrawing,
  isDrawingArrow,
  currentArrow,
  setArrows,
  setCurrentArrow,
  setIsDrawingArrow,
  setResizingBox,
  setResizingShape,
  setResizingImage,
  setRotatingBox,
  // REMOVED: draggingShape, setDraggingShape, setDragShapeStart
  // REMOVED: draggingBox, setDraggingBox, setDragBoxStart
  draggingImage,
  setDraggingImage,
  setDragImageStart,
  draggingArrow,
  setDraggingArrow,
  setDragArrowStart,
  isPanning,
  setIsPanning,
  setPanStart,
  marquee,
  whiteboardRef,
  textBoxes,
  shapes,
  arrows,
  mindMapNodes,
  setSelectedBoxes,
  setSelectedShapes,
  setSelectedArrows,
  setSelectedMindMapNodes,
  setMarquee,
  endDragCallback
}: HandleMouseUpParams) {
  if (isDrawing && currentPath) {
    setDrawingPaths((prev: any[]) => [...prev, currentPath]);
    setCurrentPath(null);
    setIsDrawing(false);
  }
  if (isDrawingArrow && currentArrow && setArrows && setCurrentArrow) {
    setArrows((prev: any[]) => [...prev, currentArrow]);
    setCurrentArrow(null);
    if (setIsDrawingArrow) setIsDrawingArrow(false);
  }
  setResizingBox(null);
  setResizingShape(null);
  setResizingImage(null);
  setRotatingBox(null);
  // REMOVED: Shape and text box drag cleanup - now handled by universal dragging system
  if (endDragCallback) {
    endDragCallback();
  }
  if (draggingImage) {
    setDraggingImage(null);
    setDragImageStart(null);
  }
  if (draggingArrow && setDraggingArrow && setDragArrowStart) {
    setDraggingArrow(null);
    setDragArrowStart(null);
  }
  if (isPanning) {
    setIsPanning(false);
    setPanStart(null);
  }
  if (marquee && whiteboardRef.current) {
    const x1 = Math.min(marquee.startX, marquee.endX);
    const y1 = Math.min(marquee.startY, marquee.endY);
    const x2 = Math.max(marquee.startX, marquee.endX);
    const y2 = Math.max(marquee.startY, marquee.endY);
    const selectedBoxes = textBoxes.filter((box: any) => {
      const bx1 = box.x;
      const by1 = box.y;
      const bx2 = box.x + box.width;
      const by2 = box.y + box.height;
      return bx2 > x1 && bx1 < x2 && by2 > y1 && by1 < y2;
    }).map((box: any) => box.id);
    const selectedShapesIds = shapes.filter((shape: any) => {
      const sx1 = shape.x;
      const sy1 = shape.y;
      const sx2 = shape.x + shape.width;
      const sy2 = shape.y + shape.height;
      return sx2 > x1 && sx1 < x2 && sy2 > y1 && sy1 < y2;
    }).map((shape: any) => shape.id);
    const selectedMindMapNodeIds = mindMapNodes.filter((node: any) => {
      const nx1 = node.x;
      const ny1 = node.y;
      const nx2 = node.x + node.width;
      const ny2 = node.y + node.height;
      return nx2 > x1 && nx1 < x2 && ny2 > y1 && ny1 < y2;
    }).map((node: any) => node.id);
    const selectedArrowIds = arrows ? arrows.filter((arrow: any) => {
      const ax1 = Math.min(arrow.startX, arrow.endX);
      const ay1 = Math.min(arrow.startY, arrow.endY);
      const ax2 = Math.max(arrow.startX, arrow.endX);
      const ay2 = Math.max(arrow.startY, arrow.endY);
      return ax2 > x1 && ax1 < x2 && ay2 > y1 && ay1 < y2;
    }).map((a: any) => a.id) : [];
    setSelectedBoxes(selectedBoxes);
    setSelectedShapes(selectedShapesIds);
    if (setSelectedArrows) setSelectedArrows(selectedArrowIds);
    setSelectedMindMapNodes(selectedMindMapNodeIds);
    setMarquee(null);
  }
}
