import { useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  query,
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebaseAuth } from './useAuth';

// Define the whiteboard data structure
export interface WhiteboardData {
  id?: string;
  title: string;
  textBoxes: any[];
  shapes: any[];
  images: any[];
  drawingPaths: any[];
  arrows: any[];
  mindMapNodes: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string; // Add user ID for filtering
  userName?: string; // Add user name for display
}

export const useFirebaseWhiteboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useFirebaseAuth();

  // Helper to recursively remove undefined fields from objects/arrays
  function removeUndefined(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined);
    } else if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value !== undefined) {
            newObj[key] = removeUndefined(value);
          }
        }
      }
      return newObj;
    }
    return obj;
  }

  // Save a whiteboard
  const saveWhiteboard = useCallback(async (
    title: string,
    whiteboardData: {
      textBoxes: any[];
      shapes: any[];
      images: any[];
      drawingPaths: any[];
      arrows: any[];
      mindMapNodes: any[];
    }
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    if (!user || !isAuthenticated) {
      setError('User must be authenticated to save whiteboard');
      setLoading(false);
      return null;
    }
    
    try {
      const now = Timestamp.now();
      
      // Clean the whiteboard data to remove undefined values
      const cleanedData = {
        textBoxes: removeUndefined(whiteboardData.textBoxes || []),
        shapes: removeUndefined(whiteboardData.shapes || []),
        images: removeUndefined(whiteboardData.images || []),
        drawingPaths: removeUndefined(whiteboardData.drawingPaths || []),
        arrows: removeUndefined(whiteboardData.arrows || []),
        mindMapNodes: removeUndefined(whiteboardData.mindMapNodes || [])
      };
      
      const docRef = await addDoc(collection(db, 'whiteboards'), {
        title: title || 'Untitled Whiteboard',
        ...cleanedData,
        userId: user.uid, // Use Firebase Auth UID
        userName: user.displayName || user.email || 'Anonymous',
        createdAt: now,
        updatedAt: now
      });
      
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
  }, [user, isAuthenticated]);

  // Update an existing whiteboard
  const updateWhiteboard = useCallback(async (
    id: string,
    whiteboardData: {
      textBoxes: any[];
      shapes: any[];
      images: any[];
      drawingPaths: any[];
      arrows: any[];
      mindMapNodes: any[];
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updateData = {
        textBoxes: removeUndefined(whiteboardData.textBoxes),
        shapes: removeUndefined(whiteboardData.shapes),
      images: removeUndefined(whiteboardData.images),
      drawingPaths: removeUndefined(whiteboardData.drawingPaths),
      arrows: removeUndefined(whiteboardData.arrows),
      mindMapNodes: removeUndefined(whiteboardData.mindMapNodes),
      updatedAt: Timestamp.now()
    };
      const docRef = doc(db, 'whiteboards', id);
      await updateDoc(docRef, updateData);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating whiteboard:', err);
      // More detailed error logging
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      // Check if it's a Firebase error
      if (err && typeof err === 'object' && 'code' in err) {
        console.error('Firebase error code:', (err as any).code);
      }
      setError('Failed to update whiteboard');
      setLoading(false);
      return false;
    }
  }, []);

  // Update whiteboard title
  const updateWhiteboardTitle = useCallback(async (
    id: string,
    title: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'whiteboards', id);
      await updateDoc(docRef, {
        title,
        updatedAt: Timestamp.now()
      });
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating whiteboard title:', err);
      setError('Failed to update whiteboard title');
      setLoading(false);
      return false;
    }
  }, []);

  // Load a specific whiteboard
  const loadWhiteboard = useCallback(async (id: string): Promise<WhiteboardData | null> => {
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
  }, []);

  // Get all whiteboards for a specific authenticated user
  const getAllWhiteboards = async (authenticatedUser?: any): Promise<WhiteboardData[]> => {
    const userToUse = authenticatedUser || user;
    const isUserAuthenticated = !!(authenticatedUser || (user && isAuthenticated));
    
    console.log('🔍 getAllWhiteboards called', { 
      user: user?.uid, 
      authenticatedUser: authenticatedUser?.uid,
      userToUse: userToUse?.uid,
      isAuthenticated,
      isUserAuthenticated,
      userEmail: userToUse?.email 
    });
    setLoading(true);
    setError(null);
    
    if (!userToUse || !isUserAuthenticated) {
      console.log('❌ User not authenticated, returning empty array');
      setError('User must be authenticated to load whiteboards');
      setLoading(false);
      return [];
    }
    
    try {
      // Query only whiteboards belonging to the authenticated user
      const q = query(
        collection(db, 'whiteboards'), 
        where('userId', '==', userToUse.uid)
      );
      
      console.log('🔍 Executing Firestore query for user:', userToUse.uid);
      const querySnapshot = await getDocs(q);
      const whiteboards: WhiteboardData[] = [];
      
      console.log('📊 Query snapshot size:', querySnapshot.size);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as WhiteboardData;
        console.log('📄 Found whiteboard:', doc.id, data.title, data.userId);
        whiteboards.push({ ...data, id: doc.id });
      });
      
      // Sort by updatedAt descending
      whiteboards.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
      
      console.log('✅ Returning whiteboards:', whiteboards.length);
      setLoading(false);
      return whiteboards;
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
    saveWhiteboard: useCallback(saveWhiteboard, [user]),
    updateWhiteboard: useCallback(updateWhiteboard, []),
    updateWhiteboardTitle: useCallback(updateWhiteboardTitle, []),
    loadWhiteboard: useCallback(loadWhiteboard, []),
    getAllWhiteboards: useCallback(getAllWhiteboards, []),
    deleteWhiteboard: useCallback(deleteWhiteboard, []),
    loading,
    error
  };
};
