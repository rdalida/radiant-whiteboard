import { useState } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from '@clerk/clerk-react';

// Define the whiteboard data structure
export interface WhiteboardData {
  id?: string;
  title: string;
  textBoxes: any[];
  shapes: any[];
  images: any[];
  drawingPaths: any[];
  mindMapNodes: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string; // Add user ID for filtering
  userName?: string; // Add user name for display
}

export const useFirebaseWhiteboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Save a whiteboard
  const saveWhiteboard = async (
    title: string,
    whiteboardData: {
      textBoxes: any[];
      shapes: any[];
      images: any[];
      drawingPaths: any[];
      mindMapNodes: any[];
    }
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to save whiteboard:', { title, dataSize: Object.keys(whiteboardData).length });
      
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'whiteboards'), {
        title,
        ...whiteboardData,
        userId: user?.id || 'anonymous',
        userName: user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'Anonymous',
        createdAt: now,
        updatedAt: now
      });
      
      console.log('Whiteboard saved successfully with ID:', docRef.id);
      setLoading(false);
      return docRef.id;
    } catch (err) {
      console.error('Error saving whiteboard:', err);
      
      // More detailed error reporting
      if (err instanceof Error) {
        setError(`Failed to save whiteboard: ${err.message}`);
      } else {
        setError('Failed to save whiteboard: Unknown error');
      }
      
      setLoading(false);
      return null;
    }
  };

  // Update an existing whiteboard
  const updateWhiteboard = async (
    id: string,
    whiteboardData: {
      textBoxes: any[];
      shapes: any[];
      images: any[];
      drawingPaths: any[];
      mindMapNodes: any[];
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'whiteboards', id);
      await updateDoc(docRef, {
        ...whiteboardData,
        updatedAt: Timestamp.now()
      });
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating whiteboard:', err);
      setError('Failed to update whiteboard');
      setLoading(false);
      return false;
    }
  };

  // Load a specific whiteboard
  const loadWhiteboard = async (id: string): Promise<WhiteboardData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'whiteboards', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as WhiteboardData;
        setLoading(false);
        return { ...data, id: docSnap.id };
      } else {
        setError('Whiteboard not found');
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error('Error loading whiteboard:', err);
      setError('Failed to load whiteboard');
      setLoading(false);
      return null;
    }
  };

  // Get all whiteboards (optionally filtered by user)
  const getAllWhiteboards = async (userId?: string): Promise<WhiteboardData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const querySnapshot = await getDocs(collection(db, 'whiteboards'));
      const whiteboards: WhiteboardData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as WhiteboardData;
        whiteboards.push({ ...data, id: doc.id });
      });
      
      // Filter by user if specified
      let filteredWhiteboards = whiteboards;
      if (userId) {
        filteredWhiteboards = whiteboards.filter(wb => wb.userId === userId);
      }
      
      // Sort by updatedAt descending
      filteredWhiteboards.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
      
      setLoading(false);
      return filteredWhiteboards;
    } catch (err) {
      console.error('Error getting whiteboards:', err);
      setError('Failed to load whiteboards');
      setLoading(false);
      return [];
    }
  };

  // Delete a whiteboard
  const deleteWhiteboard = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, 'whiteboards', id));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting whiteboard:', err);
      setError('Failed to delete whiteboard');
      setLoading(false);
      return false;
    }
  };

  return {
    saveWhiteboard,
    updateWhiteboard,
    loadWhiteboard,
    getAllWhiteboards,
    deleteWhiteboard,
    loading,
    error
  };
};
