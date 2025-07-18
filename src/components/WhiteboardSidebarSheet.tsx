import React, { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from '../hooks/useAuth';
import { Plus, FileText, Users, Trash2, Clock, Menu } from 'lucide-react';
import { useFirebaseWhiteboard, WhiteboardData } from '../hooks/useFirebaseWhiteboard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface WhiteboardSidebarSheetProps {
  onNewWhiteboard: () => void;
  onLoadWhiteboard: (data: WhiteboardData) => void;
  currentWhiteboardId?: string | null;
  refreshTrigger?: number; // Add refresh trigger
  open?: boolean; // Add external open control
  onOpenChange?: (open: boolean) => void; // Add external open change handler
}

const WhiteboardSidebarSheet: React.FC<WhiteboardSidebarSheetProps> = ({
  onNewWhiteboard,
  onLoadWhiteboard,
  currentWhiteboardId,
  refreshTrigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const { user } = useFirebaseAuth();
  const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalOpen, setInternalOpen] = useState(false);
  const { getAllWhiteboards, deleteWhiteboard } = useFirebaseWhiteboard();

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const handleNewWhiteboard = () => {
    onNewWhiteboard();
    setOpen(false); // Close the sheet
  };

  // Keyboard shortcut: N for new whiteboard (when sidebar is open)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (open && (e.key === 'n' || e.key === 'N') && !e.repeat) {
      e.preventDefault();
      handleNewWhiteboard();
    }
  }, [open, handleNewWhiteboard]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  // Load whiteboards when sidebar opens and user is available
  useEffect(() => {
    console.log('📱 Sidebar open effect triggered:', { open, user: user?.uid });
    if (open && user) {
      console.log('🚀 Sidebar opened with user, loading whiteboards');
      loadWhiteboards();
    }
  }, [open, user]);

  useEffect(() => {
    console.log('👤 User effect triggered:', { user: user?.uid, userExists: !!user });
    if (user) {
      console.log('🚀 User authenticated, loading whiteboards');
      loadWhiteboards();
    } else {
      console.log('🧹 No user, clearing whiteboards');
      setWhiteboards([]);
    }
  }, [user]);

  // Refresh whiteboards when refreshTrigger changes
  useEffect(() => {
    console.log('🔄 Refresh trigger effect:', { 
      user: user?.uid, 
      userExists: !!user, 
      refreshTrigger 
    });
    if (user && refreshTrigger && refreshTrigger > 0) {
      console.log('🚀 Refresh trigger activated, loading whiteboards');
      loadWhiteboards();
    }
  }, [user, refreshTrigger]);

  const loadWhiteboards = async () => {
    console.log('🔄 Loading whiteboards...', { user: user?.uid, userExists: !!user });
    setLoading(true);
    try {
      const userWhiteboards = await getAllWhiteboards(user); // Pass user explicitly
      console.log('✅ Loaded whiteboards:', userWhiteboards.length, userWhiteboards);
      setWhiteboards(userWhiteboards);
    } catch (error) {
      console.error('❌ Error loading whiteboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, whiteboardId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this whiteboard?')) {
      const success = await deleteWhiteboard(whiteboardId);
      if (success) {
        loadWhiteboards(); // Refresh the list
      }
    }
  };

  const handleLoadWhiteboard = (data: WhiteboardData) => {
    onLoadWhiteboard(data);
    setOpen(false); // Close the sheet
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed left-4 top-28 z-50 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg"
          title="Open whiteboard menu (Press B to toggle)"
        >
          <Menu className="w-4 h-4 mr-2" />
          Whiteboards
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96 p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <SheetTitle className="text-xl font-semibold text-gray-800">
            My Whiteboards
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* New Whiteboard Button */}
            <button
              onClick={handleNewWhiteboard}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 shadow-sm"
              title="Create a new whiteboard (Press N when sidebar is open)"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Whiteboard
            </button>

            {/* Debug: Manual Refresh Button */}
            <button
              onClick={() => {
                console.log('🔄 Manual refresh clicked');
                loadWhiteboards();
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-6 shadow-sm text-sm"
            >
              🔄 Debug: Refresh Whiteboards
            </button>

            {/* My Whiteboards Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Recent Whiteboards
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading whiteboards...</p>
                </div>
              ) : whiteboards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No whiteboards yet</p>
                  <p className="text-sm">Create your first whiteboard!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {whiteboards.map((whiteboard) => (
                    <div
                      key={whiteboard.id}
                      onClick={() => handleLoadWhiteboard(whiteboard)}
                      className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 border ${
                        currentWhiteboardId === whiteboard.id 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">
                            {whiteboard.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(whiteboard.updatedAt)}
                            <span className="mx-1">•</span>
                            {formatTime(whiteboard.updatedAt)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, whiteboard.id!)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 transition-all"
                          title="Delete whiteboard"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Whiteboards Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Shared Whiteboards
              </h3>
              
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="font-medium">Coming soon!</p>
                <p className="text-sm">Collaboration features will be added here</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WhiteboardSidebarSheet;
