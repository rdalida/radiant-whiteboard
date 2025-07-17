import React from 'react';
import Toolbar from './Toolbar';

interface HeaderProps {
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setActiveTool: React.Dispatch<React.SetStateAction<'text' | 'rectangle' | 'circle' | 'diamond' | 'pen'>>;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool, handleExport, handleImport }) => {
  return (
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
        {/* Toolbar */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          handleExport={handleExport}
          handleImport={handleImport}
        />
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full">
            {activeTool === 'text' ? 'Press T to add text' : activeTool === 'pen' ? 'Draw freely on the whiteboard' : `Click to add ${activeTool}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
