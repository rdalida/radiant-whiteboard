import React from 'react';
import { Square, Circle, Diamond, Pen, Palette } from 'lucide-react';

interface ToolbarProps {
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setActiveTool: (tool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen') => void;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showGradientPicker: boolean;
  setShowGradientPicker: (show: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  handleExport,
  handleImport,
  showGradientPicker,
  setShowGradientPicker,
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
      {/* Export/Import buttons */}
      <button
        onClick={handleExport}
        className="ml-2 flex items-center space-x-1 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm"
        title="Export whiteboard as file"
      >
        <span>Export</span>
      </button>
      <label className="ml-1 flex items-center space-x-1 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm cursor-pointer" title="Import whiteboard from file">
        <span>Import</span>
        <input
          type="file"
          accept="application/json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </label>
      <button
        onClick={() => setShowGradientPicker(!showGradientPicker)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <Palette className="w-4 h-4" />
        <span>Gradients</span>
      </button>
    </div>
  );
};

export default Toolbar;
