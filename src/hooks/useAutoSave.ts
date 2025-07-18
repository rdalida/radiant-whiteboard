import { useCallback, useRef, useEffect } from 'react';
import { useFirebaseWhiteboard } from './useFirebaseWhiteboard';

interface AutoSaveData {
  textBoxes: any[];
  shapes: any[];
  images: any[];
  drawingPaths: any[];
  mindMapNodes: any[];
}

export const useAutoSave = (
  currentWhiteboardId: string | null,
  user: any,
  data: AutoSaveData,
  title: string
) => {
  const { updateWhiteboard, saveWhiteboard } = useFirebaseWhiteboard();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const currentDataRef = useRef<AutoSaveData>(data);
  const currentTitleRef = useRef<string>(title);

  // Keep refs up to date
  currentDataRef.current = data;
  currentTitleRef.current = title;

  // Debounced save function for existing whiteboards
  const debouncedSave = useCallback(async () => {
    if (!currentWhiteboardId || !user) return;

    const currentData = currentDataRef.current;
    const currentDataString = JSON.stringify(currentData);
    
    // Only save if data has actually changed
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    try {
      const success = await updateWhiteboard(currentWhiteboardId, currentData);
      if (success) {
        lastSavedDataRef.current = currentDataString;
      } else {
        console.error('Auto-save failed - updateWhiteboard returned false');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [currentWhiteboardId, user, updateWhiteboard]); // Removed 'data' from dependencies

  // Debounced save function for new whiteboards
  const debouncedSaveNew = useCallback(async () => {
    if (currentWhiteboardId || !user) return;

    const currentData = currentDataRef.current;
    const currentTitle = currentTitleRef.current;
    
    const hasContent = currentData.textBoxes.length > 0 || currentData.shapes.length > 0 || 
                      currentData.images.length > 0 || currentData.drawingPaths.length > 0 || 
                      currentData.mindMapNodes.length > 0;

    if (!hasContent) return;

    try {
      const whiteboardId = await saveWhiteboard(currentTitle, currentData);
      if (whiteboardId) {
        return whiteboardId;
      } else {
        console.error('Failed to save new whiteboard - no ID returned');
      }
    } catch (error) {
      console.error('Auto-save new whiteboard error:', error);
    }
    return null;
  }, [currentWhiteboardId, user, saveWhiteboard]); // Removed 'data' and 'title' from dependencies

  // Auto-save trigger function
  const triggerAutoSave = useCallback((isNewWhiteboard = false): Promise<string | null> => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Return a promise that resolves with the whiteboard ID (for new whiteboards)
    return new Promise((resolve) => {
      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        if (isNewWhiteboard) {
          const newId = await debouncedSaveNew();
          resolve(newId || null);
        } else {
          await debouncedSave();
          resolve(null);
        }
        timeoutRef.current = null;
      }, isNewWhiteboard ? 3000 : 2000);
    });
  }, [debouncedSave, debouncedSaveNew]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    triggerAutoSave,
    cancelAutoSave: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };
};
