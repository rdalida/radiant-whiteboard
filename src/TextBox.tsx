import React from 'react';

interface TextBoxProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  gradient: string;
  isEditing: boolean;
  fontSize: number;
  selected: boolean;
  // Text formatting properties
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  color?: string;
  onTextChange: (id: string, newText: string) => void;
  onTextBlur: (id: string) => void;
  onTextClick: (id: string, e: React.MouseEvent) => void;
  onTextDoubleClick: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  onRotateStart: (e: React.MouseEvent, id: string) => void;
}

const TextBox: React.FC<TextBoxProps> = ({
  id, x, y, width, height, rotation, text, gradient, isEditing, fontSize, selected,
  isBold, isItalic, isUnderline, color,
  onTextChange, onTextBlur, onTextClick, onTextDoubleClick, onMouseDown, onResizeStart, onRotateStart
}) => {
  // Build dynamic style classes and styles
  const textClasses = [
    'cursor-move select-none w-full h-full flex items-center leading-tight',
    isBold ? 'font-bold' : 'font-normal',
    isItalic ? 'italic' : '',
    isUnderline ? 'underline' : ''
  ].filter(Boolean).join(' ');


  const textStyle = {
    fontSize: `${fontSize}px`,
    whiteSpace: 'pre' as const,
    overflow: 'hidden' as const,
    textOverflow: 'clip' as const,
    wordBreak: 'keep-all' as const,
    lineHeight: '1.1',
    color: color || 'transparent', // Use color if provided, otherwise transparent for gradient
  };

  // If color is specified, don't use gradient classes
  const gradientClasses = color ? '' : `${gradient} bg-clip-text text-transparent`;
  return (
    <div
      className={`absolute${selected && !isEditing ? ' ring-2 ring-blue-400 z-20' : ''}`}
      style={{ left: x, top: y, width, height, transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
    >
      {isEditing ? (
        <textarea
          value={text}
          onChange={e => onTextChange(id, e.target.value)}
          onBlur={() => onTextBlur(id)}
          wrap="off"
          className={`w-full h-full bg-transparent border-2 border-dashed border-gray-400 rounded px-2 py-1 focus:outline-none focus:border-blue-500 resize-none ${isBold ? 'font-bold' : 'font-normal'} ${isItalic ? 'italic' : ''}`}
          style={{ 
            fontSize: `${fontSize}px`, 
            whiteSpace: 'pre',
            lineHeight: '1.1',
            wordBreak: 'keep-all',
            overflow: 'hidden'
          }}
          autoFocus
        />
      ) : (
        <div className="relative w-full h-full">
          <div
            className={`${textClasses} justify-center text-center ${gradientClasses}`}
            onClick={e => onTextClick(id, e)}
            onDoubleClick={() => onTextDoubleClick(id)}
            onMouseDown={e => onMouseDown(e, id)}
            style={textStyle}
            tabIndex={0}
          >
            {text}
          </div>
          {/* Resize & rotate handles - only show when selected */}
          {selected && (
            <>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow-lg"
                onMouseDown={e => onResizeStart(e, id)}
                title="Drag to resize"
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full cursor-grab border-2 border-white shadow-lg"
                onMouseDown={e => onRotateStart(e, id)}
                title="Drag to rotate"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TextBox;
