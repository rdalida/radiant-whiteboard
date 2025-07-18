import React from 'react';
import { Square, Circle, Diamond, Pen, ArrowRight } from 'lucide-react';

interface ToolbarProps {
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen' | 'arrow';
  setActiveTool: (tool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen' | 'arrow') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-2">
      <div className="flex items-center space-x-1">
        {/* Removed Text tool button, use 'T' keyboard shortcut to add text */}
        <button
          onClick={() => setActiveTool('rectangle')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-colors ${
            activeTool === 'rectangle'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Rectangle Tool"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm font-medium">Rectangle</span>
        </button>
        <button
          onClick={() => setActiveTool('circle')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-colors ${
            activeTool === 'circle'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Circle Tool"
        >
          <Circle className="w-4 h-4" />
          <span className="text-sm font-medium">Circle</span>
        </button>
        <button
          onClick={() => setActiveTool('diamond')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-colors ${
            activeTool === 'diamond'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Diamond Tool"
        >
          <Diamond className="w-4 h-4" />
          <span className="text-sm font-medium">Diamond</span>
        </button>
        <button
          onClick={() => setActiveTool('arrow')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-colors ${
            activeTool === 'arrow'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Arrow Tool"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">Arrow</span>
        </button>
        <button
          onClick={() => setActiveTool('pen')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-colors ${
            activeTool === 'pen'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Pen Tool"
        >
          <Pen className="w-4 h-4" />
          <span className="text-sm font-medium">Pen</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
