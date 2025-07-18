import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Trash2, 
  Copy, 
  RotateCcw, 
  Bold,
  Italic,
  Underline,
  Type,
  ChevronDown,
  Minus,
  MoreHorizontal
} from 'lucide-react';

interface FloatingToolbarProps {
  x: number;
  y: number;
  width: number;
  elementType: 'shape' | 'textbox' | 'image' | 'arrow';
  // Existing actions
  onChangeGradient?: () => void;
  onDelete: () => void;
  onCopy?: () => void;
  onRotate?: () => void;
  
  // Text formatting (for textbox and shape with text)
  textStyle?: {
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    color?: string;
  };
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onToggleUnderline?: () => void;
  onColorChange?: (color: string) => void;
  
  // Arrow-specific props
  arrowStyle?: {
    strokeStyle: 'solid' | 'dashed';
    gradient: string;
  };
  onToggleStrokeStyle?: () => void;
  onChangeArrowGradient?: () => void;
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
  textStyle,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onColorChange,
  arrowStyle,
  onToggleStrokeStyle,
  onChangeArrowGradient,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);
  
  // Position the toolbar above the element, centered
  const toolbarX = x + width / 2;
  const toolbarY = y - 60; // 60px above the element to accommodate larger toolbar
  
  const hasTextFormatting = elementType === 'textbox' || elementType === 'shape';
  
  // Common color palette
  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6',
    '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
    '#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED', '#C026D3',
    '#DB2777', '#E11D48'
  ];

  return (
    <div
      className="absolute z-30 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1.5 flex items-center space-x-1"
      style={{
        left: toolbarX,
        top: toolbarY,
        transform: 'translateX(-50%)', // Center horizontally
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Text Formatting Controls - only for textbox and shapes */}
      {hasTextFormatting && (
        <>

          {/* Text Style Controls */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2 space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBold?.();
              }}
              className={`p-1.5 rounded transition-colors ${
                textStyle?.isBold 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleItalic?.();
              }}
              className={`p-1.5 rounded transition-colors ${
                textStyle?.isItalic 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleUnderline?.();
              }}
              className={`p-1.5 rounded transition-colors ${
                textStyle?.isUnderline 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>


          {/* Color Picker */}
          <div className="relative border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors flex items-center"
              title="Text color"
            >
              <div className="flex items-center">
                <Type className="w-4 h-4 text-gray-600" />
                <div 
                  className="w-3 h-1 ml-1 rounded" 
                  style={{ backgroundColor: textStyle?.color || '#000000' }}
                />
                <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
              </div>
            </button>
            
            {/* Color Palette Dropdown */}
            {showColorPicker && (
              <div 
                ref={colorPickerRef}
                className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-40"
              >
                <div className="grid grid-cols-10 gap-1 w-48">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.stopPropagation();
                        onColorChange?.(color);
                        setShowColorPicker(false);
                      }}
                      className={`w-5 h-5 rounded border-2 hover:scale-110 transition-transform ${
                        textStyle?.color === color ? 'border-blue-500' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Arrow Controls - only for arrows */}
      {elementType === 'arrow' && (
        <>
          {/* Stroke Style Toggle */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStrokeStyle?.();
              }}
              className={`p-1.5 rounded transition-colors ${
                arrowStyle?.strokeStyle === 'dashed' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={arrowStyle?.strokeStyle === 'dashed' ? 'Switch to solid line' : 'Switch to dashed line'}
            >
              {arrowStyle?.strokeStyle === 'dashed' ? (
                <MoreHorizontal className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Arrow Gradient */}
          <div className="border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeArrowGradient?.();
              }}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Change arrow color"
            >
              <Palette className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </>
      )}

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

      {/* Rotate - for shapes, images and text boxes */}
      {(elementType === 'shape' || elementType === 'image' || elementType === 'textbox') && onRotate && (
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
