import { useEffect } from 'react';


interface UseKeyboardShortcutsProps {
  setActiveTool: (tool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen') => void;
  setTextBoxes: React.Dispatch<React.SetStateAction<any[]>>;
  setShapes: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedBoxes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedShapes: React.Dispatch<React.SetStateAction<string[]>>;
  lastMousePos: { x: number; y: number };
  selectedBoxes: string[];
  selectedShapes: string[];
  textBoxes: any[];
  shapes: any[];
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  getRandomGradient: () => any;
}

export function useKeyboardShortcuts({
  setActiveTool,
  setTextBoxes,
  setShapes,
  setSelectedBoxes,
  setSelectedShapes,
  lastMousePos,
  selectedBoxes,
  selectedShapes,
  textBoxes,
  shapes,
  activeTool,
  getRandomGradient
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'q' || e.key === 'Q') {
          setActiveTool('rectangle');
        } else if (e.key === 'w' || e.key === 'W') {
          setActiveTool('circle');
        } else if (e.key === 'e' || e.key === 'E') {
          setActiveTool('diamond');
        } else if (e.key === 'r' || e.key === 'R') {
          setActiveTool('pen');
        }
      }
      if ((e.key === 't' || e.key === 'T') && document.activeElement?.tagName !== 'INPUT') {
        const randomGradient = getRandomGradient();
        setTextBoxes(boxes => [
          ...boxes,
          {
            id: Date.now().toString(),
            x: lastMousePos.x - 100,
            y: lastMousePos.y - 20,
            text: 'Text',
            gradient: randomGradient.value,
            isEditing: false,
            fontSize: 32,
            width: 200,
            height: 40
          }
        ]);
      }
      if ((e.key === 's' || e.key === 'S') && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setShapes(shapes => [
          ...shapes,
          {
            id: Date.now().toString(),
            type: activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond' ? activeTool : 'rectangle',
            x: lastMousePos.x - 50,
            y: lastMousePos.y - 50,
            width: 100,
            height: 100,
            gradient: 'bg-gray-200',
            text: '',
            isEditing: true,
          }
        ]);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedBoxes.length > 0 || selectedShapes.length > 0)) {
        setTextBoxes(boxes => boxes.filter(box => !selectedBoxes.includes(box.id)));
        setShapes(shapes => shapes.filter(shape => !selectedShapes.includes(shape.id)));
        setSelectedBoxes([]);
        setSelectedShapes([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxes, selectedShapes, lastMousePos, textBoxes, shapes, activeTool]);
}
