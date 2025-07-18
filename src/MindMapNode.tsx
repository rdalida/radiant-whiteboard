import React, { useState, useRef, useEffect } from 'react';

export interface MindMapNodeData {
  id: string;
  parentId: string | null;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: string[];
  gradient: string;
}

interface MindMapNodeProps {
  node: MindMapNodeData;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (id: string, e?: React.MouseEvent) => void;
  onTextChange: (id: string, text: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isActive,
  isSelected,
  onSelect,
  onTextChange,
  onResizeStart,
  onDelete,
  onDragStart
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(node.text);
  };

  const handleTextSubmit = () => {
    onTextChange(node.id, editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.text);
    }
  };

  return (
    <div
      className={`absolute border-2 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
        isActive ? 'border-blue-500 shadow-lg' : 
        isSelected ? 'border-blue-400 shadow-md' : 
        'border-gray-300 hover:border-gray-400'
      } ${node.gradient}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        zIndex: isActive ? 20 : isSelected ? 15 : 10
      }}
      data-mindmap-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e);
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={(e) => {
        if (e.button !== 0) return; // Only left mouse button
        e.stopPropagation();
        onDragStart(e, node.id);
      }}
    >
      {/* Node content */}
      <div className="w-full h-full flex items-center justify-center p-2">
        {isEditing ? (
          <input
            ref={inputRef}
            className="w-full h-full bg-transparent outline-none text-center text-sm font-medium"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="text-sm font-medium text-gray-700 text-center break-words">
            {node.text}
          </span>
        )}
      </div>

      {/* Resize handle - only show when active */}
      {isActive && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl-sm"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, node.id);
          }}
        />
      )}

      {/* Delete button - only show when active */}
      {isActive && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default MindMapNode;
