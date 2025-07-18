import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Plus, FileText, Users, Trash2, Clock } from 'lucide-react';
import { useFirebaseWhiteboard, WhiteboardData } from '../hooks/useFirebaseWhiteboard';

interface WhiteboardSidebarProps {
  onNewWhiteboard: () => void;
  onLoadWhiteboard: (data: WhiteboardData) => void;
  currentWhiteboardId?: string | null;
}

const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  onNewWhiteboard,
  onLoadWhiteboard,
  currentWhiteboardId
}) => {
  const { user } = useUser();
  const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllWhiteboards, deleteWhiteboard } = useFirebaseWhiteboard();

  useEffect(() => {
    if (user) {
      loadWhiteboards();
    }
  }, [user]);

  const loadWhiteboards = async () => {
    setLoading(true);
    try {
      const userWhiteboards = await getAllWhiteboards(user?.id);
      setWhiteboards(userWhiteboards);
    } catch (error) {
      console.error('Error loading whiteboards:', error);
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
    <div className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg z-20 overflow-y-auto">
      <div className="p-4">
        {/* New Whiteboard Button */}
        <button
          onClick={onNewWhiteboard}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Whiteboard
        </button>

        {/* My Whiteboards Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            My Whiteboards
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading whiteboards...</p>
            </div>
          ) : whiteboards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No whiteboards yet</p>
              <p className="text-sm">Create your first whiteboard!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {whiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  onClick={() => onLoadWhiteboard(whiteboard)}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 border ${
                    currentWhiteboardId === whiteboard.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
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
                      className="p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 transition-colors"
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
            <Users className="w-5 h-5 mr-2" />
            Shared Whiteboards
          </h3>
          
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p>Coming soon!</p>
            <p className="text-sm">Collaboration features will be added here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardSidebar;
