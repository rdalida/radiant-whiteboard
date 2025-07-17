import React, { useState, useRef } from 'react';
import { handleWhiteboardMouseDown } from './hooks/handleWhiteboardMouseDown';
import { handleWhiteboardMouseMove } from './hooks/handleWhiteboardMouseMove';
import { handleMouseUp } from './hooks/handleMouseUp';
import WhiteboardCanvas from './WhiteboardCanvas';
import TextBox from './TextBox';
import ImageElement from './ImageElement';
import ShapeElement from './ShapeElement';
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
import { Plus } from 'lucide-react';
import Toolbar from './Toolbar';

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
  // const [showGradientPicker, setShowGradientPicker] = useState(false);
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
  // Refactored: handleWhiteboardMouseDown is now imported from hooks

  // Pan move, shape drag, text drag, image drag, resize, drawing
  // Refactored: handleWhiteboardMouseMove is now imported from hooks

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

  // Refactored: handleMouseUp is now imported from hooks
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
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            handleExport={handleExport}
            handleImport={handleImport}
          />
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full">
              {activeTool === 'text' ? 'Press T to add text' : activeTool === 'pen' ? 'Draw freely on the whiteboard' : `Click to add ${activeTool}`}
            </div>
          </div>
        </div>
      </div>



      {/* Whiteboard (zoomed/panned area) */}
      <div
        ref={whiteboardRef}
        className={`relative w-full h-screen select-none pt-24 ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onClick={handleWhiteboardClick}
        onMouseDown={e => handleWhiteboardMouseDown({
          e,
          whiteboardRef,
          pan,
          zoom,
          activeTool,
          setIsPanning,
          setPanStart,
          setMarquee,
          setIsDrawing,
          setCurrentPath,
          getRandomGradient
        })}
        onMouseMove={e => handleWhiteboardMouseMove({
          e,
          whiteboardRef,
          pan,
          zoom,
          isPanning,
          panStart,
          setPan,
          setPanStart,
          isDrawing,
          currentPath,
          activeTool,
          setCurrentPath,
          draggingShape,
          dragShapeStart,
          setShapes,
          draggingBox,
          dragBoxStart,
          setTextBoxes,
          draggingImage,
          dragImageStart,
          setImages,
          resizingBox,
          resizeStart,
          setTextBoxesResize: setTextBoxes,
          resizingShape,
          setShapesResize: setShapes,
          resizingImage,
          setImagesResize: setImages,
          setLastMousePos,
          marquee,
          setMarquee
        })}
        onMouseUp={() => handleMouseUp({
          isDrawing,
          currentPath,
          setDrawingPaths,
          setCurrentPath,
          setIsDrawing,
          setResizingBox,
          setResizingShape,
          setResizingImage,
          draggingShape,
          setDraggingShape,
          setDragShapeStart,
          draggingBox,
          setDraggingBox,
          setDragBoxStart,
          draggingImage,
          setDraggingImage,
          setDragImageStart,
          isPanning,
          setIsPanning,
          setPanStart,
          marquee,
          whiteboardRef,
          textBoxes,
          shapes,
          setSelectedBoxes,
          setSelectedShapes,
          setMarquee
        })}
        onMouseLeave={() => handleMouseUp({
          isDrawing,
          currentPath,
          setDrawingPaths,
          setCurrentPath,
          setIsDrawing,
          setResizingBox,
          setResizingShape,
          setResizingImage,
          draggingShape,
          setDraggingShape,
          setDragShapeStart,
          draggingBox,
          setDraggingBox,
          setDragBoxStart,
          draggingImage,
          setDraggingImage,
          setDragImageStart,
          isPanning,
          setIsPanning,
          setPanStart,
          marquee,
          whiteboardRef,
          textBoxes,
          shapes,
          setSelectedBoxes,
          setSelectedShapes,
          setMarquee
        })}
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
        onMouseDown={e => handleWhiteboardMouseDown({
          e,
          whiteboardRef,
          pan,
          zoom,
          activeTool,
          setIsPanning,
          setPanStart,
          setMarquee,
          setIsDrawing,
          setCurrentPath,
          getRandomGradient
        })}
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
          <ImageElement
            key={img.id}
            id={img.id}
            x={img.x}
            y={img.y}
            src={img.src}
            width={img.width}
            height={img.height}
            onMouseDown={(e, id) => {
              if (e.button !== 0) return;
              if (isPanning || resizingBox || resizingShape || resizingImage || draggingBox || draggingShape) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              setDraggingImage(id);
              setDragImageStart({
                x: mouseX,
                y: mouseY,
                offsetX: mouseX - img.x,
                offsetY: mouseY - img.y
              });
            }}
            onResizeStart={(e, id) => handleImageResizeStart(e, id)}
            onDelete={id => setImages(images => images.filter(i => i.id !== id))}
          />
        ))}
        {/* Render shapes first so they are always behind text */}
        {shapes.map((shape) => (
          <ShapeElement
            key={shape.id}
            shape={shape}
            selected={selectedShapes.includes(shape.id)}
            onClick={(e, id) => {
              e.stopPropagation();
              const isMultiSelect = e.ctrlKey || e.metaKey;
              if (isMultiSelect) {
                if (selectedShapes.includes(id)) {
                  setSelectedShapes(selectedShapes.filter(sid => sid !== id));
                } else {
                  setSelectedShapes([...selectedShapes, id]);
                }
              } else {
                if (selectedShapes.length === 1 && selectedShapes[0] === id) {
                  setSelectedShapes([]);
                  setSelectedBoxes([]);
                } else {
                  setSelectedShapes([id]);
                  setSelectedBoxes([]);
                }
              }
            }}
            onMouseDown={(e, id) => {
              if (e.button !== 0) return;
              if (isPanning || resizingShape || resizingBox) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              setDraggingShape(id);
              setDragShapeStart({
                x: mouseX,
                y: mouseY,
                offsetX: mouseX - shape.x,
                offsetY: mouseY - shape.y
              });
            }}
            onTextChange={(id, newText) => setShapes(shapes.map(s => s.id === id ? { ...s, text: newText } : s))}
            onTextBlur={id => setShapes(shapes.map(s => s.id === id ? { ...s, isEditing: false } : s))}
            onTextDoubleClick={id => setShapes(shapes.map(s => s.id === id ? { ...s, isEditing: true } : s))}
            onDelete={id => setShapes(shapes.filter(s => s.id !== id))}
            onChangeGradient={id => {
              const randomGradient = getRandomGradient();
              setShapes(shapes.map(s => s.id === id ? { ...s, gradient: randomGradient.value } : s));
            }}
            onResizeStart={(e, id) => handleShapeResizeStart(e, id)}
          />
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


    </div>
  );
}

export default App;