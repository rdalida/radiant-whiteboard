import { RefObject } from 'react';

interface HandleMouseUpParams {
  isDrawing: boolean;
  currentPath: any;
  setDrawingPaths: (fn: any) => void;
  setCurrentPath: (val: any) => void;
  setIsDrawing: (val: boolean) => void;
  isDrawingArrow: boolean;
  currentArrow: any;
  setArrows: (fn: any) => void;
  setCurrentArrow: (val: any) => void;
  setIsDrawingArrow: (val: boolean) => void;
  setResizingBox: (val: string | null) => void;
  setResizingShape: (val: string | null) => void;
  setResizingImage: (val: string | null) => void;
  draggingShape: string | null;
  setDraggingShape: (val: string | null) => void;
  setDragShapeStart: (val: any) => void;
  draggingBox: string | null;
  setDraggingBox: (val: string | null) => void;
  setDragBoxStart: (val: any) => void;
  draggingImage: string | null;
  setDraggingImage: (val: string | null) => void;
  setDragImageStart: (val: any) => void;
  isPanning: boolean;
  setIsPanning: (val: boolean) => void;
  setPanStart: (val: any) => void;
  marquee: { startX: number; startY: number; endX: number; endY: number } | null;
  whiteboardRef: RefObject<HTMLDivElement>;
  textBoxes: any[];
  shapes: any[];
  mindMapNodes: any[];
  setSelectedBoxes: (val: string[]) => void;
  setSelectedShapes: (val: string[]) => void;
  setSelectedMindMapNodes: (val: string[]) => void;
  setMarquee: (val: any) => void;
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
  draggingShape,
  setDraggingShape,
  setDragShapeStart,
  draggingBox,
  setDraggingBox,
  setDragBoxStart,
  draggingImage,
  setDraggingImage,
  setDragImageStart,
  isPanning,
  setIsPanning,
  setPanStart,
  marquee,
  whiteboardRef,
  textBoxes,
  shapes,
  mindMapNodes,
  setSelectedBoxes,
  setSelectedShapes,
  setSelectedMindMapNodes,
  setMarquee
}: HandleMouseUpParams) {
  if (isDrawing && currentPath) {
    setDrawingPaths((prev: any[]) => [...prev, currentPath]);
    setCurrentPath(null);
    setIsDrawing(false);
  }
  if (isDrawingArrow && currentArrow) {
    setArrows((prev: any[]) => [...prev, currentArrow]);
    setCurrentArrow(null);
    setIsDrawingArrow(false);
  }
  setResizingBox(null);
  setResizingShape(null);
  setResizingImage(null);
  if (draggingShape) {
    setDraggingShape(null);
    setDragShapeStart(null);
  }
  if (draggingBox) {
    setDraggingBox(null);
    setDragBoxStart(null);
  }
  if (draggingImage) {
    setDraggingImage(null);
    setDragImageStart(null);
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
    setSelectedBoxes(selectedBoxes);
    setSelectedShapes(selectedShapesIds);
    setSelectedMindMapNodes(selectedMindMapNodeIds);
    setMarquee(null);
  }
}
