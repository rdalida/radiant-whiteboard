import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, X } from 'lucide-react';
import { useFirebaseWhiteboard, WhiteboardData } from '../hooks/useFirebaseWhiteboard';

interface WhiteboardManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, id: string) => void;
  onLoad: (data: WhiteboardData) => void;
  currentWhiteboardData: {
    textBoxes: any[];
    shapes: any[];
    images: any[];
    drawingPaths: any[];
    mindMapNodes: any[];
  };
}

const WhiteboardManager: React.FC<WhiteboardManagerProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  currentWhiteboardData
}) => {
  const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const {
    saveWhiteboard,
    getAllWhiteboards,
    deleteWhiteboard,
    loading,
    error
  } = useFirebaseWhiteboard();

  // Load whiteboards when component opens
  useEffect(() => {
    if (isOpen) {
      loadWhiteboards();
    }
  }, [isOpen]);

  const loadWhiteboards = async () => {
    const data = await getAllWhiteboards();
    setWhiteboards(data);
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) return;
    
    const id = await saveWhiteboard(saveTitle, currentWhiteboardData);
    if (id) {
      onSave(saveTitle, id);
      setSaveTitle('');
      setShowSaveForm(false);
      loadWhiteboards(); // Refresh the list
    }
  };

  const handleLoad = async (whiteboard: WhiteboardData) => {
    onLoad(whiteboard);
    onClose();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this whiteboard?')) {
      const success = await deleteWhiteboard(id);
      if (success) {
        loadWhiteboards(); // Refresh the list
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Whiteboard Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Save Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Save Current Whiteboard
          </h3>
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save as New
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter whiteboard title..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={!saveTitle.trim() || loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false);
                  setSaveTitle('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Load Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            Load Whiteboard
          </h3>
          
          {loading && <p className="text-gray-600">Loading whiteboards...</p>}
          
          {whiteboards.length === 0 && !loading ? (
            <p className="text-gray-500 text-center py-8">
              No saved whiteboards found. Create your first whiteboard by saving the current one!
            </p>
          ) : (
            <div className="space-y-2">
              {whiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{whiteboard.title}</h4>
                    <p className="text-sm text-gray-500">
                      Updated: {formatDate(whiteboard.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoad(whiteboard)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(whiteboard.id!)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhiteboardManager;
