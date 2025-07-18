import { useCallback } from 'react';

interface Gradient {
  name: string;
  value: string;
  preview: string;
}

interface Arrow {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  gradient: Gradient;
}

export function useArrowHandlers(arrows: Arrow[], setArrows: (fn: any) => void, setSelectedArrows: (fn: any) => void) {
  const handleArrowClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelectedArrows((prev: string[]) =>
        prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
      );
    } else {
      setSelectedArrows((prev: string[]) => (prev.length === 1 && prev[0] === id ? [] : [id]));
    }
  }, [setSelectedArrows]);

  const handleArrowDelete = useCallback((id: string) => {
    setArrows((prev: Arrow[]) => prev.filter(a => a.id !== id));
  }, [setArrows]);

  return {
    handleArrowClick,
    handleArrowDelete
  };
}
