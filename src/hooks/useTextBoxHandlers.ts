import { useCallback } from 'react';

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
}

export function useTextBoxHandlers(textBoxes: TextBox[], setTextBoxes: (fn: any) => void, setSelectedBoxes: (fn: any) => void) {
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

  // Change text
  const handleTextChange = useCallback((id: string, newText: string) => {
    setTextBoxes((prev: TextBox[]) => prev.map(box => 
      box.id === id ? { ...box, text: newText } : box
    ));
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
