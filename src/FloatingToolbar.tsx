import React from 'react';
import { Palette, Trash2, Copy, RotateCcw } from 'lucide-react';

interface FloatingToolbarProps {
  x: number;
  y: number;
  width: number;
  elementType: 'shape' | 'textbox' | 'image';
  onChangeGradient?: () => void;
  onDelete: () => void;
  onCopy?: () => void;
  onRotate?: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  x,
  y,
  width,
  elementType,
  onChangeGradient,
  onDelete,
  onCopy,
  onRotate,
}) => {
  // Position the toolbar above the element, centered
  const toolbarX = x + width / 2;
  const toolbarY = y - 50; // 50px above the element

  return (
    <div
      className="absolute z-30 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1 flex items-center space-x-1"
      style={{
        left: toolbarX,
        top: toolbarY,
        transform: 'translateX(-50%)', // Center horizontally
      }}
    >
      {/* Change Gradient/Color - only for shapes and textboxes */}
      {(elementType === 'shape' || elementType === 'textbox') && onChangeGradient && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChangeGradient();
          }}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Change gradient"
        >
          <Palette className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Copy - for all element types */}
      {onCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Copy"
        >
          <Copy className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Rotate - for shapes and images */}
      {(elementType === 'shape' || elementType === 'image') && onRotate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRotate();
          }}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Rotate"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Delete - for all element types */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 rounded hover:bg-red-100 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
};

export default FloatingToolbar;
