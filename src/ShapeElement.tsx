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
  onDelete: (id: string) => void;
  onChangeGradient: (id: string) => void;
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
  onDelete,
  onChangeGradient,
  onResizeStart,
}) => {
  return (
    <div
      className={`absolute group cursor-pointer${selected ? ' ring-2 ring-blue-400 z-20' : ''} hover:ring-2 hover:ring-gray-400`}
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
        {/* Shape Controls */}
        <div className="absolute -top-8 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onChangeGradient(shape.id); }}
            className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
            title="Change gradient"
          >
            🎨
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(shape.id); }}
            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            title="Delete"
          >
            ×
          </button>
        </div>
        {/* Resize handle */}
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white shadow-lg"
          onMouseDown={e => onResizeStart(e, shape.id)}
          title="Drag to resize"
        />
      </div>
    </div>
  );
};

export default ShapeElement;
