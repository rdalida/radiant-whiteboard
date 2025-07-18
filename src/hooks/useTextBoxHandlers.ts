import { useCallback } from 'react';
import { calculateFontSizeToFit } from '../utils/fontUtils';

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  gradient: string;
  isEditing: boolean;
  fontSize: number;
  width: number;
  height: number;
  // Text formatting properties
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export function useTextBoxHandlers(setTextBoxes: (fn: any) => void, setSelectedBoxes: (fn: any) => void) {
  // Double click to edit
  const handleTextDoubleClick = useCallback((id: string) => {
    setTextBoxes((prev: TextBox[]) => prev.map(box => 
      box.id === id ? { ...box, isEditing: true } : box
    ));
    setSelectedBoxes([]);
  }, [setTextBoxes, setSelectedBoxes]);

  // Multi-select logic: Ctrl/Cmd+Click adds/removes, else single select
  const handleTextClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelectedBoxes((prev: string[]) => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedBoxes([id]);
    }
  }, [setSelectedBoxes]);

  // Change text and adjust font size to always fit width
  const handleTextChange = useCallback((id: string, newText: string) => {
    setTextBoxes((prev: TextBox[]) => prev.map(box => {
      if (box.id !== id) return box;
      const newFont = calculateFontSizeToFit(newText, box.width, {
        isBold: box.isBold,
        isItalic: box.isItalic
      });
      return { ...box, text: newText, fontSize: newFont };
    }));
  }, [setTextBoxes]);

  // Blur (finish editing)
  const handleTextBlur = useCallback((id: string) => {
    setTextBoxes((prev: TextBox[]) => prev.map(box => 
      box.id === id ? { ...box, isEditing: false } : box
    ));
  }, [setTextBoxes]);

  return {
    handleTextDoubleClick,
    handleTextClick,
    handleTextChange,
    handleTextBlur
  };
}
