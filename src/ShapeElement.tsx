import React from 'react';

interface ShapeElementProps {
  shape: {
    id: string;
    type: 'rectangle' | 'circle' | 'diamond';
    x: number;
    y: number;
    width: number;
    height: number;
    gradient: string;
    text: string;
    isEditing: boolean;
  };
  selected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onTextChange: (id: string, newText: string) => void;
  onTextBlur: (id: string) => void;
  onTextDoubleClick: (id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
}

const ShapeElement: React.FC<ShapeElementProps> = ({
  shape,
  selected,
  onClick,
  onMouseDown,
  onTextChange,
  onTextBlur,
  onTextDoubleClick,
  onResizeStart,
}) => {
  return (
    <div
      className={`absolute cursor-pointer${selected ? ' ring-2 ring-blue-400 z-20' : ''}`}
      style={{ left: shape.x, top: shape.y, width: shape.width, height: shape.height }}
      onClick={e => onClick(e, shape.id)}
      onMouseDown={e => onMouseDown(e, shape.id)}
    >
      <div className="relative w-full h-full">
        {shape.isEditing ? (
          <input
            type="text"
            value={shape.text}
            onChange={e => onTextChange(shape.id, e.target.value)}
            onBlur={() => onTextBlur(shape.id)}
            onKeyDown={e => { if (e.key === 'Enter') onTextBlur(shape.id); }}
            className="absolute w-full h-full rounded-lg px-2 py-1 font-bold bg-white/80 border-2 border-dashed border-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            style={{ fontSize: `${Math.max(12, Math.min(72, shape.height * 0.25))}px`, textAlign: 'center' }}
            autoFocus
          />
        ) : (
          <div
            className={`absolute w-full h-full flex items-center justify-center select-none px-2 py-1 font-bold text-gray-700 ${shape.type === 'rectangle' ? 'rounded-lg' : ''} ${shape.type === 'circle' ? 'rounded-full' : ''} ${shape.type === 'diamond' ? 'transform rotate-45' : ''} ${shape.gradient}`}
            style={{ fontSize: `${Math.max(12, Math.min(72, shape.height * 0.25))}px`, textAlign: 'center', overflow: 'hidden', wordBreak: 'break-word' }}
            onDoubleClick={() => onTextDoubleClick(shape.id)}
          >
            {shape.text}
          </div>
        )}
        {/* Resize handle - only show when selected */}
        {selected && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow-lg"
            onMouseDown={e => onResizeStart(e, shape.id)}
            title="Drag to resize"
          />
        )}
      </div>
    </div>
  );
};

export default ShapeElement;
