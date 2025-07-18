import { useState } from 'react';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface DragStartData {
  mouseX: number;
  mouseY: number;
  elementPositions: { [id: string]: ElementPosition };
}

export type ElementType = 'textbox' | 'shape' | 'image' | 'arrow' | 'mindmap';

export interface UniversalDragState {
  draggingElement: string | null;
  dragType: ElementType | null;
  dragStartData: DragStartData | null;
  hasDragged: boolean; // Track if actual dragging occurred
}

export function useUniversalDragging() {
  const [universalDragState, setUniversalDragState] = useState<UniversalDragState>({
    draggingElement: null,
    dragType: null,
    dragStartData: null,
    hasDragged: false
  });

  const startDrag = (
    elementId: string,
    elementType: ElementType,
    mouseX: number,
    mouseY: number,
    selectedElements: string[],
    allElements: any[]
  ) => {
    // Store original positions of all selected elements
    const elementPositions: { [id: string]: ElementPosition } = {};
    
    selectedElements.forEach(id => {
      const element = allElements.find(el => el.id === id);
      if (element) {
        if (elementType === 'arrow') {
          // For arrows, store both start and end positions
          elementPositions[id] = {
            x: element.startX,
            y: element.startY,
            // Store end positions as well for arrows
            endX: element.endX,
            endY: element.endY
          } as any;
        } else {
          elementPositions[id] = { x: element.x, y: element.y };
        }
      }
    });

    setUniversalDragState({
      draggingElement: elementId,
      dragType: elementType,
      dragStartData: {
        mouseX,
        mouseY,
        elementPositions
      },
      hasDragged: false
    });
  };

  const updateDrag = (
    currentMouseX: number,
    currentMouseY: number,
    updateFunction: (deltaX: number, deltaY: number, originalPositions: { [id: string]: ElementPosition }) => void
  ) => {
    if (!universalDragState.dragStartData) return;

    const deltaX = currentMouseX - universalDragState.dragStartData.mouseX;
    const deltaY = currentMouseY - universalDragState.dragStartData.mouseY;
    
    // Consider it a drag if moved more than 3 pixels
    const hasDragged = Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3;
    
    if (hasDragged && !universalDragState.hasDragged) {
      setUniversalDragState(prev => ({ ...prev, hasDragged: true }));
    }

    updateFunction(deltaX, deltaY, universalDragState.dragStartData.elementPositions);
  };

  const endDrag = () => {
    const wasDragging = universalDragState.hasDragged;
    setUniversalDragState({
      draggingElement: null,
      dragType: null,
      dragStartData: null,
      hasDragged: false
    });
    return wasDragging; // Return whether actual dragging occurred
  };

  return {
    universalDragState,
    startDrag,
    updateDrag,
    endDrag
  };
}
