import React from 'react';

interface TextBoxProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  gradient: string;
  isEditing: boolean;
  fontSize: number;
  selected: boolean;
  // Text formatting properties
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  onTextChange: (id: string, newText: string) => void;
  onTextBlur: (id: string) => void;
  onTextClick: (id: string, e: React.MouseEvent) => void;
  onTextDoubleClick: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
}

const TextBox: React.FC<TextBoxProps> = ({
  id, x, y, width, height, text, gradient, isEditing, fontSize, selected,
  isBold, isItalic, isUnderline, textAlign, color,
  onTextChange, onTextBlur, onTextClick, onTextDoubleClick, onMouseDown, onResizeStart
}) => {
  // Build dynamic style classes and styles
  const textClasses = [
    'cursor-move select-none w-full h-full flex items-center leading-tight',
    isBold ? 'font-bold' : 'font-normal',
    isItalic ? 'italic' : '',
    isUnderline ? 'underline' : ''
  ].filter(Boolean).join(' ');

  const alignmentClasses = {
    left: 'justify-start text-left',
    center: 'justify-center text-center', 
    right: 'justify-end text-right'
  };

  const textStyle = {
    fontSize: `${fontSize}px`,
    wordWrap: 'break-word' as const,
    overflow: 'hidden' as const,
    color: color || 'transparent', // Use color if provided, otherwise transparent for gradient
  };

  // If color is specified, don't use gradient classes
  const gradientClasses = color ? '' : `${gradient} bg-clip-text text-transparent`;
  return (
    <div
      className={`absolute${selected && !isEditing ? ' ring-2 ring-blue-400 z-20' : ''}`}
      style={{ left: x, top: y, width, height }}
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={e => onTextChange(id, e.target.value)}
          onBlur={() => onTextBlur(id)}
          onKeyDown={e => { if (e.key === 'Enter') onTextBlur(id); }}
          className="w-full h-full bg-transparent border-2 border-dashed border-gray-400 rounded px-2 py-1 font-bold focus:outline-none focus:border-blue-500 resize-none"
          style={{ fontSize: `${fontSize}px` }}
          autoFocus
        />
      ) : (
        <div className="relative w-full h-full">
          <div
            className={`${textClasses} ${alignmentClasses[textAlign || 'center']} ${gradientClasses}`}
            onClick={e => onTextClick(id, e)}
            onDoubleClick={() => onTextDoubleClick(id)}
            onMouseDown={e => onMouseDown(e, id)}
            style={textStyle}
            tabIndex={0}
          >
            {text}
          </div>
          {/* Resize handle - only show when selected */}
          {selected && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow-lg"
              onMouseDown={e => onResizeStart(e, id)}
              title="Drag to resize"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TextBox;
