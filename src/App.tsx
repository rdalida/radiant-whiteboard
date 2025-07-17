import React, { useState, useRef } from 'react';
import WhiteboardCanvas from './WhiteboardCanvas';
import TextBox from './TextBox';
interface WhiteboardImage {
  id: string;
  x: number;
  y: number;
  src: string;
  width: number;
  height: number;
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  createdAt: number; // timestamp in ms
}
import { Plus, Palette, Square, Circle, Diamond, Pen } from 'lucide-react';

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  gradient: string;
  isEditing: boolean;
  fontSize: number;
  width: number;
  height: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
  gradient: string;
  text: string;
  isEditing: boolean;
}

const gradients = [
  {
    name: 'Rainbow',
    value: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
    preview: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)'
  },
  {
    name: 'Sunset',
    value: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500',
    preview: 'linear-gradient(to right, #fb923c, #ef4444, #ec4899)'
  },
  {
    name: 'Ocean',
    value: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500',
    preview: 'linear-gradient(to right, #60a5fa, #06b6d4, #14b8a6)'
  },
  {
    name: 'Forest',
    value: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600',
    preview: 'linear-gradient(to right, #4ade80, #10b981, #0d9488)'
  },
  {
    name: 'Purple',
    value: 'bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500',
    preview: 'linear-gradient(to right, #a78bfa, #8b5cf6, #6366f1)'
  },
  {
    name: 'Fire',
    value: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600',
    preview: 'linear-gradient(to right, #facc15, #f97316, #dc2626)'
  },
  {
    name: 'Mint',
    value: 'bg-gradient-to-r from-emerald-300 via-cyan-400 to-blue-400',
    preview: 'linear-gradient(to right, #6ee7b7, #22d3ee, #60a5fa)'
  },
  {
    name: 'Rose',
    value: 'bg-gradient-to-r from-pink-400 via-rose-500 to-red-500',
    preview: 'linear-gradient(to right, #f472b6, #f43f5e, #ef4444)'
  },
  {
    name: 'Cosmic',
    value: 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500',
    preview: 'linear-gradient(to right, #6366f1, #9333ea, #ec4899)'
  },
  {
    name: 'Gold',
    value: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500',
    preview: 'linear-gradient(to right, #fbbf24, #eab308, #f97316)'
  }
];

function App() {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [images, setImages] = useState<WhiteboardImage[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingImage, setDraggingImage] = useState<string | null>(null);
  const [dragImageStart, setDragImageStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]); // multi-select
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]); // multi-select shapes
  const [lastMousePos, setLastMousePos] = useState<{x: number, y: number}>({x: 200, y: 200});
  const [marquee, setMarquee] = useState<null | {startX: number, startY: number, endX: number, endY: number}>(null);
  const [activeTool, setActiveTool] = useState<'text' | 'rectangle' | 'circle' | 'diamond' | 'pen'>('text');
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);
const [resizingBox, setResizingBox] = useState<string | null>(null);
const [resizingShape, setResizingShape] = useState<string | null>(null);
const [resizingImage, setResizingImage] = useState<string | null>(null);
const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, fontSize: 0 });
// Drag state for shapes
const [draggingShape, setDraggingShape] = useState<string | null>(null);
const [dragShapeStart, setDragShapeStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
// Drag state for text boxes
const [draggingBox, setDraggingBox] = useState<string | null>(null);
const [dragBoxStart, setDragBoxStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);

  // Handle paste event for images
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!whiteboardRef.current) return;
      if (e.clipboardData) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const src = event.target?.result as string;
                // Default size: 200x200, place at lastMousePos
                setImages(images => [
                  ...images,
                  {
                    id: Date.now().toString() + Math.random().toString(36).slice(2),
                    x: lastMousePos.x - 100,
                    y: lastMousePos.y - 100,
                    src,
                    width: 200,
                    height: 200
                  }
                ]);
              };
              reader.readAsDataURL(file);
            }
            e.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [lastMousePos]);

  // Restore resize for text box
  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const box = textBoxes.find(b => b.id === id);
    if (!box) return;
    setResizingBox(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: box.width,
      height: box.height,
      fontSize: box.fontSize
    });
  };

  // Restore resize for shape
  const handleShapeResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    setResizingShape(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: shape.width,
      height: shape.height,
      fontSize: 0 // Not used for shapes
    });
  };

  // Restore resize for image
  const handleImageResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const image = images.find(img => img.id === id);
    if (!image) return;
    setResizingImage(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: image.width,
      height: image.height,
      fontSize: 0 // Not used for images
    });
  };

  const getRandomGradient = () => {
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Improved: Deselect on any click not on control/resize, and allow marquee from any non-control area
  const handleWhiteboardClick = (e: React.MouseEvent) => {
    // Only deselect if not holding Ctrl/Cmd
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedBoxes([]);
      setSelectedShapes([]);
    }
  };

  // Marquee selection: start drag (left mouse) on any non-control area, Pan (right mouse) anywhere
  const handleWhiteboardMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      // Right mouse: Pan from anywhere
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    // Only start marquee if left mouse and not on a control/resize handle
    if (e.button === 0) {
      // If not clicking a resize handle or control button, start marquee or drawing
      // (Check for className containing 'cursor-se-resize' or 'control' or 'bg-blue-500' for buttons)
      const target = e.target as HTMLElement;
      const isResizeHandle = target.className?.includes('cursor-se-resize');
      const isControlButton = target.tagName === 'BUTTON' || target.className?.includes('control');
      if (!isResizeHandle && !isControlButton) {
        if (!whiteboardRef.current) return;
        const rect = whiteboardRef.current.getBoundingClientRect();
        // Adjust for pan/zoom
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        
        // Start drawing if pen tool is active
        if (activeTool === 'pen') {
          setIsDrawing(true);
          // Pick a random gradient for this path
          const randomGradient = getRandomGradient();
          // We'll use the gradient name as a unique id for the SVG gradient
          const gradientId = 'pen-gradient-' + Date.now().toString() + Math.random().toString(36).slice(2);
          const newPath: DrawingPath = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            points: [{ x, y }],
            color: gradientId, // store the gradient id
            strokeWidth: 2,
            createdAt: Date.now()
          };
          // Attach the gradient info to the path object for rendering
          (newPath as any).gradient = randomGradient;
          setCurrentPath(newPath);
          return;
        }
        
        // Otherwise start marquee selection
        setMarquee({ startX: x, startY: y, endX: x, endY: y });
      }
    }
  };

  // Pan move, shape drag, text drag, image drag, resize, drawing
  const handleWhiteboardMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      setPan(pan => ({
        x: pan.x + (e.clientX - panStart.x),
        y: pan.y + (e.clientY - panStart.y)
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Drawing with pen tool
    if (isDrawing && currentPath && activeTool === 'pen') {
      const rect = whiteboardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setCurrentPath(prev => prev ? {
        ...prev,
        points: [...prev.points, { x, y }]
      } : null);
      return;
    }
    
    // Drag shape
    if (draggingShape && dragShapeStart) {
      const rect = whiteboardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setShapes(shapes => shapes.map(shape =>
        shape.id === draggingShape
          ? { ...shape, x: mouseX - dragShapeStart.offsetX, y: mouseY - dragShapeStart.offsetY }
          : shape
      ));
      return;
    }
    // Drag text box
    if (draggingBox && dragBoxStart) {
      const rect = whiteboardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setTextBoxes(textBoxes => textBoxes.map(box =>
        box.id === draggingBox
          ? { ...box, x: mouseX - dragBoxStart.offsetX, y: mouseY - dragBoxStart.offsetY }
          : box
      ));
      return;
    }
    // Drag image
    if (draggingImage && dragImageStart) {
      const rect = whiteboardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setImages(images => images.map(img =>
        img.id === draggingImage
          ? { ...img, x: mouseX - dragImageStart.offsetX, y: mouseY - dragImageStart.offsetY }
          : img
      ));
      return;
    }
    // Resize text box
    if (resizingBox) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(100, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);
      const scaleFactor = Math.max(newWidth / resizeStart.width, newHeight / resizeStart.height);
      const newFontSize = Math.max(12, Math.min(72, resizeStart.fontSize * scaleFactor));
      setTextBoxes(textBoxes.map(box =>
        box.id === resizingBox ? {
          ...box,
          width: newWidth,
          height: newHeight,
          fontSize: newFontSize
        } : box
      ));
      return;
    }
    // Resize shape
    if (resizingShape) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(50, resizeStart.height + deltaY);
      setShapes(shapes.map(shape =>
        shape.id === resizingShape ? {
          ...shape,
          width: newWidth,
          height: newHeight
        } : shape
      ));
      return;
    }
    // Resize image
    if (resizingImage) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(50, resizeStart.height + deltaY);
      setImages(images.map(img =>
        img.id === resizingImage ? {
          ...img,
          width: newWidth,
          height: newHeight
        } : img
      ));
      return;
    }
    // Track last mouse position for 'T' shortcut
    if (whiteboardRef.current) {
      const rect = whiteboardRef.current.getBoundingClientRect();
      setLastMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      });
      // Marquee selection: update drag
      if (marquee) {
        setMarquee(m => m ? { ...m, endX: (e.clientX - rect.left - pan.x) / zoom, endY: (e.clientY - rect.top - pan.y) / zoom } : null);
      }
    }
  };

  const handleTextDoubleClick = (id: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, isEditing: true } : box
    ));
    setSelectedBoxes([]);
  };

  // Multi-select logic: Ctrl/Cmd+Click adds/removes, else single select
  const handleTextClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      // Add/remove from selection
      setSelectedBoxes(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      // Single select
      setSelectedBoxes([id]);
    }
  };

  const handleTextChange = (id: string, newText: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, text: newText } : box
    ));
  };

  const handleTextBlur = (id: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, isEditing: false } : box
    ));
  };

  // Delete selected boxes with Delete key, add text with 'T'
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool selection shortcuts (ignore if in input)
      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'q' || e.key === 'Q') {
          setActiveTool('rectangle');
        } else if (e.key === 'w' || e.key === 'W') {
          setActiveTool('circle');
        } else if (e.key === 'e' || e.key === 'E') {
          setActiveTool('diamond');
        } else if (e.key === 'r' || e.key === 'R') {
          setActiveTool('pen');
        }
      }
      // Add text block with 'T' (not in input)
      if ((e.key === 't' || e.key === 'T') && document.activeElement?.tagName !== 'INPUT') {
        const randomGradient = getRandomGradient();
        setTextBoxes(boxes => [
          ...boxes,
          {
            id: Date.now().toString(),
            x: lastMousePos.x - 100,
            y: lastMousePos.y - 20,
            text: 'Text',
            gradient: randomGradient.value,
            isEditing: false,
            fontSize: 32,
            width: 200,
            height: 40
          }
        ]);
      }
      // Add shape with 'S' (not in input)
      if ((e.key === 's' || e.key === 'S') && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault(); // Prevent the 's' from being typed into the input
        setShapes(shapes => [
          ...shapes,
          {
            id: Date.now().toString(),
            type: activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond' ? activeTool : 'rectangle',
            x: lastMousePos.x - 50,
            y: lastMousePos.y - 50,
            width: 100,
            height: 100,
            gradient: 'bg-gray-200', // gray by default
            text: '',
            isEditing: true,
          }
        ]);
      }
      // Delete selected boxes and shapes
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedBoxes.length > 0 || selectedShapes.length > 0)) {
        setTextBoxes(boxes => boxes.filter(box => !selectedBoxes.includes(box.id)));
        setShapes(shapes => shapes.filter(shape => !selectedShapes.includes(shape.id)));
        setSelectedBoxes([]);
        setSelectedShapes([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxes, selectedShapes, lastMousePos, textBoxes, shapes, activeTool]);

  // ...existing code...

  // ...existing code...

  const handleMouseUp = () => {
    // Complete drawing path
    if (isDrawing && currentPath) {
      setDrawingPaths(prev => [...prev, currentPath]);
      setCurrentPath(null);
      setIsDrawing(false);
    }
    setResizingBox(null);
    setResizingShape(null);
    setResizingImage(null);
    if (draggingShape) {
      setDraggingShape(null);
      setDragShapeStart(null);
    }
    if (draggingBox) {
      setDraggingBox(null);
      setDragBoxStart(null);
    }
    if (draggingImage) {
      setDraggingImage(null);
      setDragImageStart(null);
    }
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }
    // Marquee selection: finish drag
    if (marquee && whiteboardRef.current) {
      const x1 = Math.min(marquee.startX, marquee.endX);
      const y1 = Math.min(marquee.startY, marquee.endY);
      const x2 = Math.max(marquee.startX, marquee.endX);
      const y2 = Math.max(marquee.startY, marquee.endY);
      // Select all boxes that intersect with the marquee rectangle
      const selectedBoxes = textBoxes.filter(box => {
        const bx1 = box.x;
        const by1 = box.y;
        const bx2 = box.x + box.width;
        const by2 = box.y + box.height;
        return bx2 > x1 && bx1 < x2 && by2 > y1 && by1 < y2;
      }).map(box => box.id);
      // Select all shapes that intersect with the marquee rectangle
      const selectedShapesIds = shapes.filter(shape => {
        const sx1 = shape.x;
        const sy1 = shape.y;
        const sx2 = shape.x + shape.width;
        const sy2 = shape.y + shape.height;
        return sx2 > x1 && sx1 < x2 && sy2 > y1 && sy1 < y2;
      }).map(shape => shape.id);
      setSelectedBoxes(selectedBoxes);
      setSelectedShapes(selectedShapesIds);
      setMarquee(null);
    }
  };
  // Fade out and remove pen marks after a few seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDrawingPaths(paths => paths.filter(path => now - path.createdAt < 4000)); // 4 seconds
    }, 500);
    return () => clearInterval(interval);
  }, []);
  // Zoom with mouse wheel
  const handleWhiteboardWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) return; // Let browser handle pinch-zoom
    e.preventDefault();
    // Zoom in/out centered on mouse
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const prevZoom = zoom;
    let newZoom = zoom * (e.deltaY < 0 ? 1.1 : 0.9);
    newZoom = Math.max(0.2, Math.min(3, newZoom));
    // Adjust pan so zoom is centered on mouse
    setPan(pan => ({
      x: (pan.x - mouseX) * (newZoom / prevZoom) + mouseX,
      y: (pan.y - mouseY) * (newZoom / prevZoom) + mouseY
    }));
    setZoom(newZoom);
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
  };

  const changeGradient = (id: string, gradient: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, gradient } : box
    ));
  };

  // Export whiteboard state as JSON
  const handleExport = () => {
    const data = {
      textBoxes,
      shapes,
      images,
      drawingPaths
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'radiant-notes-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import whiteboard state from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.textBoxes && data.shapes && data.images && data.drawingPaths) {
          setTextBoxes(data.textBoxes);
          setShapes(data.shapes);
          setImages(data.images);
          setDrawingPaths(data.drawingPaths);
        } else {
          alert('Invalid file format.');
        }
      } catch {
        alert('Failed to import file.');
      }
    };
    reader.readAsText(file);
    // Reset input value so the same file can be imported again if needed
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Header (fixed, always visible) */}
      <div className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <span className="text-white text-3xl font-bold select-none">R</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Radiant Notes
            </h1>
          </div>
          {/* Toolbar */}
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
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGradientPicker(!showGradientPicker)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Gradients</span>
            </button>
            <div className="text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full">
              {activeTool === 'text' ? 'Press T to add text' : activeTool === 'pen' ? 'Draw freely on the whiteboard' : `Click to add ${activeTool}`}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Picker (fixed, always visible when open) */}
      {showGradientPicker && (
        <div className="fixed top-20 right-4 z-40 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-80">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Gradients</h3>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {gradients.map((gradient) => (
              <div
                key={gradient.name}
                className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                onClick={() => setShowGradientPicker(false)}
              >
                <div 
                  className="w-full h-6 rounded mb-1"
                  style={{ background: gradient.preview }}
                />
                <div className="text-xs text-gray-600 font-medium">{gradient.name}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">New text boxes get random gradients automatically</p>
        </div>
      )}

      {/* Whiteboard (zoomed/panned area) */}
      <div
        ref={whiteboardRef}
        className={`relative w-full h-screen select-none pt-24 ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onClick={handleWhiteboardClick}
        onMouseDown={handleWhiteboardMouseDown}
        onMouseMove={handleWhiteboardMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWhiteboardWheel}
        onContextMenu={e => e.preventDefault()}
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'auto', // Always allow pointer events for panning
          }}
          onMouseDown={handleWhiteboardMouseDown}
        >
        {/* Marquee selection rectangle */}
        {marquee && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-200 bg-opacity-20 pointer-events-none z-30"
            style={{
              left: Math.min(marquee.startX, marquee.endX),
              top: Math.min(marquee.startY, marquee.endY),
              width: Math.abs(marquee.endX - marquee.startX),
              height: Math.abs(marquee.endY - marquee.startY)
            }}
          />
        )}
        
        {/* Render drawing paths using WhiteboardCanvas */}
        <WhiteboardCanvas
          drawingPaths={drawingPaths}
          currentPath={currentPath}
          gradients={gradients}
        />
        
        {/* Render images behind shapes and text */}
        {images.map((img) => (
          <div
            key={img.id}
            className="absolute group cursor-move"
            style={{
              left: img.x,
              top: img.y,
              width: img.width,
              height: img.height,
              zIndex: 5
            }}
            onMouseDown={e => {
              if (e.button !== 0) return;
              if (isPanning || resizingBox || resizingShape || resizingImage || draggingBox || draggingShape) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              setDraggingImage(img.id);
              setDragImageStart({
                x: mouseX,
                y: mouseY,
                offsetX: mouseX - img.x,
                offsetY: mouseY - img.y
              });
            }}
          >
            <img
              src={img.src}
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
                  setImages(images => images.filter(i => i.id !== img.id));
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
              onMouseDown={(e) => handleImageResizeStart(e, img.id)}
              title="Drag to resize"
            />
          </div>
        ))}
        {/* Render shapes first so they are always behind text */}
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`absolute group cursor-pointer ${selectedShapes.includes(shape.id) ? 'ring-2 ring-blue-400 z-20' : ''} hover:ring-2 hover:ring-gray-400`}
            style={{ 
              left: shape.x, 
              top: shape.y,
              width: shape.width,
              height: shape.height
            }}
            onClick={(e) => {
              e.stopPropagation();
              const isMultiSelect = e.ctrlKey || e.metaKey;
              if (isMultiSelect) {
                if (selectedShapes.includes(shape.id)) {
                  setSelectedShapes(selectedShapes.filter(id => id !== shape.id));
                } else {
                  setSelectedShapes([...selectedShapes, shape.id]);
                }
              } else {
                // If already selected, deselect all
                if (selectedShapes.length === 1 && selectedShapes[0] === shape.id) {
                  setSelectedShapes([]);
                  setSelectedBoxes([]);
                } else {
                  setSelectedShapes([shape.id]);
                  setSelectedBoxes([]);
                }
              }
            }}
            onMouseDown={(e) => {
              if (e.button !== 0) return; // Only left mouse
              // Prevent drag if resizing or panning
              if (isPanning || resizingShape || resizingBox) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              setDraggingShape(shape.id);
              setDragShapeStart({
                x: mouseX,
                y: mouseY,
                offsetX: mouseX - shape.x,
                offsetY: mouseY - shape.y
              });
            }}
          >
            <div className="relative w-full h-full">
              {shape.isEditing ? (
                <input
                  type="text"
                  value={shape.text}
                  onChange={e => setShapes(shapes.map(s => s.id === shape.id ? { ...s, text: e.target.value } : s))}
                  onBlur={() => setShapes(shapes.map(s => s.id === shape.id ? { ...s, isEditing: false } : s))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') setShapes(shapes.map(s => s.id === shape.id ? { ...s, isEditing: false } : s));
                  }}
                  className={`absolute w-full h-full rounded-lg px-2 py-1 font-bold bg-white/80 border-2 border-dashed border-gray-400 focus:outline-none focus:border-blue-500 resize-none`}
                  style={{ fontSize: `${Math.max(12, Math.min(72, shape.height * 0.25))}px`, textAlign: 'center' }}
                  autoFocus
                />
              ) : (
                <div
                  className={`absolute w-full h-full flex items-center justify-center select-none px-2 py-1 font-bold text-gray-700 ${shape.type === 'rectangle' ? 'rounded-lg' : ''} ${shape.type === 'circle' ? 'rounded-full' : ''} ${shape.type === 'diamond' ? 'transform rotate-45' : ''} ${shape.gradient}`}
                  style={{ fontSize: `${Math.max(12, Math.min(72, shape.height * 0.25))}px`, textAlign: 'center', overflow: 'hidden', wordBreak: 'break-word' }}
                  onDoubleClick={() => setShapes(shapes.map(s => s.id === shape.id ? { ...s, isEditing: true } : s))}
                >
                  {shape.text}
                </div>
              )}
              {/* Shape Controls */}
              <div className="absolute -top-8 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const randomGradient = getRandomGradient();
                    setShapes(shapes.map(s => 
                      s.id === shape.id ? { ...s, gradient: randomGradient.value } : s
                    ));
                  }}
                  className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                  title="Change gradient"
                >
                  🎨
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShapes(shapes.filter(s => s.id !== shape.id));
                  }}
                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  ×
                </button>
              </div>
              
              {/* Resize handle */}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white shadow-lg"
                onMouseDown={(e) => handleShapeResizeStart(e, shape.id)}
                title="Drag to resize"
              />
            </div>
          </div>
        ))}
        {textBoxes.map((box) => (
          <TextBox
            key={box.id}
            id={box.id}
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            text={box.text}
            gradient={box.gradient}
            isEditing={box.isEditing}
            fontSize={box.fontSize}
            selected={selectedBoxes.includes(box.id) && !box.isEditing}
            // ...removed unused props...
            onTextChange={handleTextChange}
            onTextBlur={handleTextBlur}
            onTextClick={(id, e) => {
              // Deselect if already selected and not multi-select
              if (!(e.ctrlKey || e.metaKey) && selectedBoxes.length === 1 && selectedBoxes[0] === id) {
                setSelectedBoxes([]);
                setSelectedShapes([]);
                e.stopPropagation();
                return;
              }
              handleTextClick(id, e);
            }}
            onTextDoubleClick={handleTextDoubleClick}
            onMouseDown={(e, id) => {
              if (e.button !== 0) return; // Only left mouse
              // Prevent drag if resizing or panning
              if (isPanning || resizingBox || resizingShape) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              setDraggingBox(id);
              setDragBoxStart({
                x: mouseX,
                y: mouseY,
                offsetX: mouseX - box.x,
                offsetY: mouseY - box.y
              });
            }}
            onResizeStart={handleResizeStart}
            onDelete={deleteTextBox}
            onChangeGradient={(id) => {
              const randomGradient = getRandomGradient();
              changeGradient(id, randomGradient.value);
            }}
          />
        ))}

        {/* Empty State */}
        {textBoxes.length === 0 && shapes.length === 0 && images.length === 0 && drawingPaths.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                <Plus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">Use the toolbar to add elements</p>
                <p className="text-gray-500">Select a tool and click to add text or shapes</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Instructions (fixed, always visible) */}
      <div className="fixed bottom-4 left-4 z-30 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">How to use:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Press T to add text with random gradient</li>
          <li>• Press Q/W/E/R for Rectangle/Circle/Diamond/Pen tools</li>
          <li>• Press S to add shapes, click and drag to draw</li>
          <li>• Double-click text to edit content</li>
          <li>• Drag elements to move them around</li>
          <li>• Drag corner handle to resize</li>
          <li>• Click 🎨 to change gradient randomly</li>
          <li>• Click × to delete elements</li>
          <li>• Paste images with Ctrl+V</li>
        </ul>
      </div>
    </div>
  );
}

export default App;