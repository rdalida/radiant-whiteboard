import React from 'react';

interface ImageElementProps {
  id: string;
  x: number;
  y: number;
  src: string;
  width: number;
  height: number;
  selected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
}

const ImageElement: React.FC<ImageElementProps> = ({
  id,
  x,
  y,
  src,
  width,
  height,
  selected,
  onClick,
  onMouseDown,
  onResizeStart,
}) => {
  return (
    <div
      className={`absolute cursor-move${selected ? ' ring-2 ring-blue-400 z-20' : ''}`}
      style={{ left: x, top: y, width, height, zIndex: 5 }}
      onClick={e => onClick(e, id)}
      onMouseDown={e => onMouseDown(e, id)}
    >
      <img
        src={src}
        alt="Pasted"
        className="w-full h-full object-contain"
        draggable={false}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      />
      {/* Resize handle - only show when selected */}
      {selected && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow-lg"
          onMouseDown={e => onResizeStart(e, id)}
          title="Drag to resize"
        />
      )}
    </div>
  );
};

export default ImageElement;
