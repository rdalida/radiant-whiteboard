
import React, { useState } from 'react';
import Toolbar from './Toolbar';
import ClerkAuthButtons from './ClerkAuthButtons';
import UserInfo from './UserInfo';
import WhiteboardManager from './components/WhiteboardManager';
import { useUser } from '@clerk/clerk-react';
import { Save, FolderOpen } from 'lucide-react';
import { WhiteboardData } from './hooks/useFirebaseWhiteboard';

interface HeaderProps {
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setActiveTool: React.Dispatch<React.SetStateAction<'text' | 'rectangle' | 'circle' | 'diamond' | 'pen'>>;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentWhiteboardData: {
    textBoxes: any[];
    shapes: any[];
    images: any[];
    drawingPaths: any[];
    mindMapNodes: any[];
  };
  onLoadWhiteboard: (data: WhiteboardData) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTool, 
  setActiveTool, 
  handleExport, 
  handleImport, 
  currentWhiteboardData,
  onLoadWhiteboard
}) => {
  const { isSignedIn } = useUser();
  const [showWhiteboardManager, setShowWhiteboardManager] = useState(false);

  const handleSave = (title: string, id: string) => {
    console.log('Whiteboard saved:', title, 'with ID:', id);
    // You can add additional logic here, such as updating the current whiteboard ID
  };

  const handleLoad = (data: WhiteboardData) => {
    onLoadWhiteboard(data);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <span className="text-white text-3xl font-bold select-none">R</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Radiant Notes
            </h1>
          </div>
          <div className="flex-1 flex justify-center">
            <Toolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              handleExport={handleExport}
              handleImport={handleImport}
            />
          </div>
          <div className="flex items-center justify-end min-w-[120px] space-x-3">
            {isSignedIn && (
              <>
                <button
                  onClick={() => setShowWhiteboardManager(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  title="Save/Load Whiteboards"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={() => setShowWhiteboardManager(true)}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  title="Load Whiteboard"
                >
                  <FolderOpen className="w-4 h-4 mr-1" />
                  Load
                </button>
              </>
            )}
            {isSignedIn && <UserInfo />}
            <ClerkAuthButtons />
          </div>
        </div>
      </div>
      
      <WhiteboardManager
        isOpen={showWhiteboardManager}
        onClose={() => setShowWhiteboardManager(false)}
        onSave={handleSave}
        onLoad={handleLoad}
        currentWhiteboardData={currentWhiteboardData}
      />
    </>
  );
};

export default Header;
