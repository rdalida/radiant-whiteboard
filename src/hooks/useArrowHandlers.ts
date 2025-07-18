import { Dispatch, SetStateAction } from 'react';
import { Arrow } from '../ArrowElement';

interface UseArrowHandlersProps {
  arrows: Arrow[];
  setArrows: Dispatch<SetStateAction<Arrow[]>>;
  setSelectedArrows: Dispatch<SetStateAction<string[]>>;
  setSelectedBoxes: Dispatch<SetStateAction<string[]>>;
  setSelectedShapes: Dispatch<SetStateAction<string[]>>;
  setSelectedImages: Dispatch<SetStateAction<string[]>>;
  whiteboardRef: React.RefObject<HTMLDivElement>;
  pan: { x: number; y: number };
  zoom: number;
  setDraggingArrow: Dispatch<SetStateAction<string | null>>;
  setDragArrowStart: Dispatch<SetStateAction<{ startX:number; startY:number; endX:number; endY:number; mouseX:number; mouseY:number } | null>>;
}

export function useArrowHandlers({
  arrows,
  setArrows,
  setSelectedArrows,
  setSelectedBoxes,
  setSelectedShapes,
  setSelectedImages,
  whiteboardRef,
  pan,
  zoom,
  setDraggingArrow,
  setDragArrowStart
}: UseArrowHandlersProps) {
  const handleArrowClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelectedArrows(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    } else {
      setSelectedArrows(prev => (prev.length === 1 && prev[0] === id ? [] : [id]));
      setSelectedBoxes([]);
      setSelectedShapes([]);
      setSelectedImages([]);
    }
  };

  const handleArrowMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const arrow = arrows.find(a => a.id === id);
    if (!arrow) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setDraggingArrow(id);
    setDragArrowStart({
      startX: arrow.startX,
      startY: arrow.startY,
      endX: arrow.endX,
      endY: arrow.endY,
      mouseX,
      mouseY
    });
  };

  const handleArrowDelete = (id: string) => {
    setArrows(arrows => arrows.filter(a => a.id !== id));
  };

  return { handleArrowClick, handleArrowMouseDown, handleArrowDelete };
}
