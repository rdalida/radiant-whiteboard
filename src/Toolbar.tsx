import React from 'react';
import { Square, Circle, Diamond, Pen } from 'lucide-react';

interface ToolbarProps {
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setActiveTool: (tool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {/* Removed Text tool button, use 'T' keyboard shortcut to add text */}
        <button
          onClick={() => setActiveTool('rectangle')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
            activeTool === 'rectangle'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Rectangle Tool"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm">Rectangle</span>
        </button>
        <button
          onClick={() => setActiveTool('circle')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
            activeTool === 'circle'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Circle Tool"
        >
          <Circle className="w-4 h-4" />
          <span className="text-sm">Circle</span>
        </button>
        <button
          onClick={() => setActiveTool('diamond')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
            activeTool === 'diamond'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Diamond Tool"
        >
          <Diamond className="w-4 h-4" />
          <span className="text-sm">Diamond</span>
        </button>
        <button
          onClick={() => setActiveTool('pen')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
            activeTool === 'pen'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Pen Tool"
        >
          <Pen className="w-4 h-4" />
          <span className="text-sm">Pen</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
