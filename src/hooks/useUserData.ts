import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface WhiteboardData {
  textBoxes: any[];
  shapes: any[];
  images: any[];
  drawingPaths: any[];
  mindMapNodes: any[];
}

export const useUserData = (data: WhiteboardData) => {
  const { user, isSignedIn } = useUser();

  // Save data to localStorage with user-specific key
  const saveUserData = (data: WhiteboardData) => {
    if (isSignedIn && user) {
      const userKey = `whiteboard_${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(data));
    }
  };

  // Load data from localStorage with user-specific key
  const loadUserData = (): WhiteboardData | null => {
    if (isSignedIn && user) {
      const userKey = `whiteboard_${user.id}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing saved data:', error);
          return null;
        }
      }
    }
    return null;
  };

  // Auto-save data when it changes
  useEffect(() => {
    if (isSignedIn && user) {
      const timeoutId = setTimeout(() => {
        saveUserData(data);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [data, isSignedIn, user]);

  return {
    saveUserData,
    loadUserData,
  };
};
