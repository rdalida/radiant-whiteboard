import { useCallback } from 'react';
import { Arrow } from '../ArrowElement';

export function useArrowHandlers(
  setArrows: (fn: any) => void, 
  setSelectedArrows: (fn: any) => void,
  getRandomGradient: () => { name: string; value: string; preview: string }
) {
  const handleArrowClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      setSelectedArrows((prev: string[]) =>
        prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
      );
    } else {
      setSelectedArrows([id]);
    }
  }, [setSelectedArrows]);

  const handleArrowDelete = useCallback((id: string) => {
    setArrows((prev: Arrow[]) => prev.filter(a => a.id !== id));
    setSelectedArrows((prev: string[]) => prev.filter(aid => aid !== id));
  }, [setArrows, setSelectedArrows]);

  const handleToggleStrokeStyle = useCallback((id: string) => {
    setArrows((prev: Arrow[]) => 
      prev.map(arrow => 
        arrow.id === id 
          ? { ...arrow, strokeStyle: arrow.strokeStyle === 'solid' ? 'dashed' : 'solid' } 
          : arrow
      )
    );
  }, [setArrows]);

  const handleChangeArrowGradient = useCallback((id: string) => {
    const randomGradient = getRandomGradient();
    setArrows((prev: Arrow[]) => 
      prev.map(arrow => 
        arrow.id === id 
          ? { ...arrow, gradient: randomGradient.value } 
          : arrow
      )
    );
  }, [setArrows, getRandomGradient]);

  return {
    handleArrowClick,
    handleArrowDelete,
    handleToggleStrokeStyle,
    handleChangeArrowGradient
  };
}
