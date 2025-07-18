import { useCallback } from 'react';

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
  gradient: string;
  text: string;
  isEditing: boolean;
  // Text formatting properties
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
}

export function useShapeHandlers(shapes: Shape[], setShapes: (fn: any) => void, setSelectedShapes: (fn: any) => void, setSelectedBoxes: (fn: any) => void, getRandomGradient: () => any) {
  // Double click to edit
  const handleTextDoubleClick = useCallback((id: string) => {
    setShapes((prev: Shape[]) => prev.map(s => s.id === id ? { ...s, isEditing: true } : s));
  }, [setShapes]);

  // Blur (finish editing)
  const handleTextBlur = useCallback((id: string) => {
    setShapes((prev: Shape[]) => prev.map(s => s.id === id ? { ...s, isEditing: false } : s));
  }, [setShapes]);

  // Change text
  const handleTextChange = useCallback((id: string, newText: string) => {
    setShapes((prev: Shape[]) => prev.map(s => s.id === id ? { ...s, text: newText } : s));
  }, [setShapes]);

  // Select shape
  const handleShapeClick = useCallback((e: React.MouseEvent, id: string, selectedShapes: string[], setSelectedShapes: (fn: any) => void, setSelectedBoxes: (fn: any) => void) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    if (isMultiSelect) {
      setSelectedShapes((prev: string[]) => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    } else {
      setSelectedShapes((prev: string[]) => (prev.length === 1 && prev[0] === id ? [] : [id]));
      setSelectedBoxes([]);
    }
  }, [setSelectedShapes, setSelectedBoxes]);

  // Delete shape
  const handleDelete = useCallback((id: string) => {
    setShapes((prev: Shape[]) => prev.filter(s => s.id !== id));
  }, [setShapes]);

  // Change gradient
  const handleChangeGradient = useCallback((id: string) => {
    const randomGradient = getRandomGradient();
    setShapes((prev: Shape[]) => prev.map(s => s.id === id ? { ...s, gradient: randomGradient.value } : s));
  }, [setShapes, getRandomGradient]);

  return {
    handleTextDoubleClick,
    handleTextBlur,
    handleTextChange,
    handleShapeClick,
    handleDelete,
    handleChangeGradient
  };
}
