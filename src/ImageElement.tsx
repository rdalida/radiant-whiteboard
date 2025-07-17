import React from 'react';

interface ImageElementProps {
  id: string;
  x: number;
  y: number;
  src: string;
  width: number;
  height: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
}

const ImageElement: React.FC<ImageElementProps> = ({
  id,
  x,
  y,
  src,
  width,
  height,
  onMouseDown,
  onResizeStart,
  onDelete,
}) => {
  return (
    <div
      className="absolute group cursor-move"
      style={{ left: x, top: y, width, height, zIndex: 5 }}
      onMouseDown={e => onMouseDown(e, id)}
    >
      <img
        src={src}
        alt="Pasted"
        className="w-full h-full object-contain"
        draggable={false}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      />
      {/* Delete button */}
      <div className="absolute -top-8 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          title="Delete image"
        >
          ×
        </button>
      </div>
      {/* Resize handle */}
      <div
        className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white shadow-lg"
        onMouseDown={e => onResizeStart(e, id)}
        title="Drag to resize"
      />
    </div>
  );
};

export default ImageElement;
