import React, { useState, useRef } from 'react';
import { useWhiteboardPanZoom } from './hooks/useWhiteboardPanZoom';
import { handleWhiteboardMouseDown } from './hooks/handleWhiteboardMouseDown';
import { handleWhiteboardMouseMove } from './hooks/handleWhiteboardMouseMove';
import { handleMouseUp } from './hooks/handleMouseUp';
import { useTextBoxHandlers } from './hooks/useTextBoxHandlers';
import { useShapeHandlers } from './hooks/useShapeHandlers';
import { useImageHandlers } from './hooks/useImageHandlers';
import WhiteboardCanvas from './WhiteboardCanvas';
import TextBox from './TextBox';
import ImageElement from './ImageElement';
import ShapeElement from './ShapeElement';
import MindMapNode, { MindMapNodeData } from './MindMapNode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
export interface WhiteboardImage {
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
import Header from './Header';

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

import { gradients } from './gradients';
import { WhiteboardData } from './hooks/useFirebaseWhiteboard';
import WhiteboardSidebarSheet from './components/WhiteboardSidebarSheet';
import { useUser } from '@clerk/clerk-react';

function App() {
  const { user } = useUser();
  const [currentWhiteboardId, setCurrentWhiteboardId] = useState<string | null>(null);
  // Removed unused currentWhiteboardTitle state
  
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [images, setImages] = useState<WhiteboardImage[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingImage, setDraggingImage] = useState<string | null>(null);
  const [dragImageStart, setDragImageStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
  
  // Mind Map state
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNodeData[]>([]);
  const [activeMindMapNode, setActiveMindMapNode] = useState<string | null>(null);
  const [selectedMindMapNodes, setSelectedMindMapNodes] = useState<string[]>([]);
  const [draggingMindMapNode, setDraggingMindMapNode] = useState<string | null>(null);
  const [dragMindMapStart, setDragMindMapStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
  const [resizingMindMapNode, setResizingMindMapNode] = useState<string | null>(null);
  const [resizeMindMapStart, setResizeMindMapStart] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  // const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]); // multi-select
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]); // multi-select shapes
  const [lastMousePos, setLastMousePos] = useState<{x: number, y: number}>({x: 200, y: 200});
  const [marquee, setMarquee] = useState<null | {startX: number, startY: number, endX: number, endY: number}>(null);
  const [activeTool, setActiveTool] = useState<'text' | 'rectangle' | 'circle' | 'diamond' | 'pen'>('text');
  const {
    pan,
    setPan,
    zoom,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    handleWheel
  } = useWhiteboardPanZoom();
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

  // Refactored: useImageHandlers for image events
  const {
    handleImageMouseDown,
    handleImageResizeStart,
    handleImageDelete
  } = useImageHandlers({
    images,
    setImages,
    setDraggingImage,
    setDragImageStart,
    setResizingImage,
    setResizeStart,
    whiteboardRef,
    pan,
    zoom
  });

  const getRandomGradient = () => {
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Improved: Deselect on any click not on control/resize, and allow marquee from any non-control area
  const handleWhiteboardClick = (e: React.MouseEvent) => {
    // Only deselect if not holding Ctrl/Cmd
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedBoxes([]);
      setSelectedShapes([]);
      setSelectedMindMapNodes([]);
      setActiveMindMapNode(null);
    }
  };

  // Marquee selection: start drag (left mouse) on any non-control area, Pan (right mouse) anywhere
  // Refactored: handleWhiteboardMouseDown is now imported from hooks

  // Pan move, shape drag, text drag, image drag, resize, drawing
  // Refactored: handleWhiteboardMouseMove is now imported from hooks

  // Refactored: useTextBoxHandlers for text box events
  const {
    handleTextDoubleClick,
    handleTextClick,
    handleTextChange,
    handleTextBlur
  } = useTextBoxHandlers(textBoxes, setTextBoxes, setSelectedBoxes);

  // Refactored: useShapeHandlers for shape events
  const {
    handleTextDoubleClick: handleShapeTextDoubleClick,
    handleTextBlur: handleShapeTextBlur,
    handleTextChange: handleShapeTextChange,
    handleShapeClick,
    handleDelete: handleShapeDelete,
    handleChangeGradient: handleShapeChangeGradient
  } = useShapeHandlers(shapes, setShapes, setSelectedShapes, setSelectedBoxes, getRandomGradient);

  // Mind Map handlers
  const handleMindMapNodeSelect = (id: string, e?: React.MouseEvent) => {
    if (e && (e.ctrlKey || e.metaKey)) {
      // Multi-select with Ctrl/Cmd
      setSelectedMindMapNodes(prev => 
        prev.includes(id) 
          ? prev.filter(nodeId => nodeId !== id)
          : [...prev, id]
      );
    } else {
      // Single select
      setSelectedMindMapNodes([id]);
      setActiveMindMapNode(id);
    }
    // Clear other selections
    setSelectedBoxes([]);
    setSelectedShapes([]);
  };

  const handleMindMapNodeTextChange = (id: string, text: string) => {
    setMindMapNodes(nodes => 
      nodes.map(node => 
        node.id === id ? { ...node, text } : node
      )
    );
  };

  const handleMindMapNodeResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = mindMapNodes.find(n => n.id === id);
    if (!node) return;
    
    setResizingMindMapNode(id);
    setResizeMindMapStart({
      x: e.clientX,
      y: e.clientY,
      width: node.width,
      height: node.height
    });
  };

  const handleMindMapNodeDelete = (id: string) => {
    setMindMapNodes(nodes => {
      // Remove the node and update parent's children array
      const nodeToDelete = nodes.find(n => n.id === id);
      if (!nodeToDelete) return nodes;
      
      // Update parent's children array
      const updatedNodes = nodes.map(node => {
        if (node.id === nodeToDelete.parentId) {
          return {
            ...node,
            children: node.children.filter(childId => childId !== id)
          };
        }
        return node;
      });
      
      // Remove the node and all its descendants
      const removeDescendants = (nodeId: string, allNodes: MindMapNodeData[]): MindMapNodeData[] => {
        const node = allNodes.find(n => n.id === nodeId);
        if (!node) return allNodes;
        
        let result = allNodes.filter(n => n.id !== nodeId);
        node.children.forEach(childId => {
          result = removeDescendants(childId, result);
        });
        
        return result;
      };
      
      return removeDescendants(id, updatedNodes);
    });
    
    if (activeMindMapNode === id) {
      setActiveMindMapNode(null);
    }
  };

  const handleMindMapNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const node = mindMapNodes.find(n => n.id === id);
    if (!node) return;
    
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    // If the clicked node is not selected, select it first
    if (!selectedMindMapNodes.includes(id)) {
      setSelectedMindMapNodes([id]);
      setActiveMindMapNode(id);
    }
    
    setDraggingMindMapNode(id);
    setDragMindMapStart({
      x: mouseX,
      y: mouseY,
      offsetX: mouseX - node.x,
      offsetY: mouseY - node.y
    });
  };

  const createMindMapNode = (text: string, parentId: string | null = null, x?: number, y?: number): MindMapNodeData => {
    const newId = Date.now().toString() + Math.random().toString(36).slice(2);
    
    // Assign gradient based on parent relationship
    let gradient: string;
    if (parentId === null) {
      // Root node - assign random gradient
      gradient = getRandomGradient().value;
    } else {
      // Check if there are existing siblings with the same parent
      const siblings = mindMapNodes.filter(n => n.parentId === parentId);
      if (siblings.length > 0) {
        // Use the same gradient as existing siblings
        gradient = siblings[0].gradient;
      } else {
        // First child of this parent - assign new random gradient
        gradient = getRandomGradient().value;
      }
    }
    
    return {
      id: newId,
      parentId,
      text,
      x: x ?? lastMousePos.x - 60,
      y: y ?? lastMousePos.y - 30,
      width: 120,
      height: 60,
      children: [],
      gradient
    };
  };

  const addMindMapNode = (text: string, parentId: string | null = null, x?: number, y?: number) => {
    const newNode = createMindMapNode(text, parentId, x, y);
    
    setMindMapNodes(nodes => {
      const updatedNodes = [...nodes, newNode];
      
      // If it has a parent, add this node to parent's children
      if (parentId) {
        return updatedNodes.map(node => 
          node.id === parentId 
            ? { ...node, children: [...node.children, newNode.id] }
            : node
        );
      }
      
      return updatedNodes;
    });
    
    setActiveMindMapNode(newNode.id);
    return newNode.id;
  };

  const addSiblingNode = (currentNodeId: string) => {
    const currentNode = mindMapNodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;
    
    const siblingX = currentNode.x + currentNode.width + 40;
    const siblingY = currentNode.y;
    
    // If current node has no parent (root node), create another root node
    // Otherwise, create a sibling with the same parent
    addMindMapNode('Sibling', currentNode.parentId, siblingX, siblingY);
  };

  const addChildNode = (currentNodeId: string) => {
    const currentNode = mindMapNodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;
    
    const childX = currentNode.x;
    const childY = currentNode.y + currentNode.height + 60;
    
    addMindMapNode('Child', currentNode.id, childX, childY);
  };

  // Render connector lines between parent and child nodes
  const renderMindMapConnectors = () => {
    const connections = mindMapNodes.filter(node => node.parentId).map(node => {
      const parent = mindMapNodes.find(n => n.id === node.parentId);
      if (!parent) return null;
      
      // Calculate connection points
      const parentCenterX = parent.x + parent.width / 2;
      const parentCenterY = parent.y + parent.height / 2;
      const childCenterX = node.x + node.width / 2;
      const childCenterY = node.y + node.height / 2;
      
      return {
        id: node.id,
        x1: parentCenterX,
        y1: parentCenterY,
        x2: childCenterX,
        y2: childCenterY,
        childGradient: node.gradient, // Use child's gradient for the connector
      };
    }).filter((conn): conn is NonNullable<typeof conn> => conn !== null);
    
    if (connections.length === 0) return null;
    
    // Calculate bounds for the SVG
    const allX = connections.flatMap(c => [c.x1, c.x2]);
    const allY = connections.flatMap(c => [c.y1, c.y2]);
    const minX = Math.min(...allX) - 20;
    const minY = Math.min(...allY) - 20;
    const maxX = Math.max(...allX) + 20;
    const maxY = Math.max(...allY) + 20;
    
    // Create smooth curved path function
    const createSmoothPath = (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      
      // Control points for smooth curve
      const controlPoint1X = x1 + dx * 0.3;
      const controlPoint1Y = y1;
      const controlPoint2X = x2 - dx * 0.3;
      const controlPoint2Y = y2;
      
      return `M ${x1} ${y1} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${x2} ${y2}`;
    };
    
    // Helper function to extract gradient colors from Tailwind class
    const getGradientColors = (gradientClass: string) => {
      const gradientMap: { [key: string]: { from: string; via: string; to: string } } = {
        'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500': {
          from: '#ef4444', via: '#eab308', to: '#a855f7'
        },
        'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500': {
          from: '#fb923c', via: '#ef4444', to: '#ec4899'
        },
        'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500': {
          from: '#60a5fa', via: '#06b6d4', to: '#14b8a6'
        },
        'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600': {
          from: '#4ade80', via: '#10b981', to: '#0d9488'
        },
        'bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500': {
          from: '#a78bfa', via: '#8b5cf6', to: '#6366f1'
        },
        'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600': {
          from: '#facc15', via: '#f97316', to: '#dc2626'
        },
        'bg-gradient-to-r from-emerald-300 via-cyan-400 to-blue-400': {
          from: '#6ee7b7', via: '#22d3ee', to: '#60a5fa'
        },
        'bg-gradient-to-r from-pink-400 via-rose-500 to-red-500': {
          from: '#f472b6', via: '#f43f5e', to: '#ef4444'
        },
        'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500': {
          from: '#6366f1', via: '#9333ea', to: '#ec4899'
        },
        'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500': {
          from: '#fbbf24', via: '#eab308', to: '#f97316'
        }
      };
      
      return gradientMap[gradientClass] || { from: '#6b7280', via: '#4b5563', to: '#374151' };
    };
    
    return (
      <svg
        className="absolute pointer-events-none"
        style={{ 
          left: minX,
          top: minY,
          width: maxX - minX,
          height: maxY - minY,
          zIndex: 1 
        }}
      >
        {/* Define gradients dynamically */}
        <defs>
          {connections.map(conn => {
            const colors = getGradientColors(conn.childGradient);
            return (
              <linearGradient key={`gradient-${conn.id}`} id={`gradient-${conn.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.from} />
                <stop offset="50%" stopColor={colors.via} />
                <stop offset="100%" stopColor={colors.to} />
              </linearGradient>
            );
          })}
        </defs>
        
        {connections.map(conn => {
          const smoothPath = createSmoothPath(
            conn.x1 - minX,
            conn.y1 - minY,
            conn.x2 - minX,
            conn.y2 - minY
          );
          
          return (
            <path
              key={`connector-${conn.id}`}
              d={smoothPath}
              stroke={`url(#gradient-${conn.id})`}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    );
  };

  // Centralized keyboard shortcuts
  useKeyboardShortcuts({
    setActiveTool,
    setTextBoxes,
    setShapes,
    setSelectedBoxes,
    setSelectedShapes,
    lastMousePos,
    selectedBoxes,
    selectedShapes,
    textBoxes,
    shapes,
    activeTool,
    getRandomGradient,
    activeMindMapNode,
    selectedMindMapNodes,
    setSelectedMindMapNodes,
    setMindMapNodes,
    addMindMapNode,
    addSiblingNode,
    addChildNode,
    handleMindMapNodeDelete
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDrawingPaths(paths => paths.filter(path => now - path.createdAt < 4000)); // 4 seconds
    }, 500);
    return () => clearInterval(interval);
  }, []);
  // Zoom with mouse wheel now handled by useWhiteboardPanZoom

  const deleteTextBox = (id: string) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
  };

  const changeGradient = (id: string, gradient: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, gradient } : box
    ));
  };

  // Firebase whiteboard handlers
  const handleLoadWhiteboard = (data: WhiteboardData) => {
    setTextBoxes(data.textBoxes || []);
    setShapes(data.shapes || []);
    setImages(data.images || []);
    setDrawingPaths(data.drawingPaths || []);
    setMindMapNodes(data.mindMapNodes || []);
    
    // Set current whiteboard info
    setCurrentWhiteboardId(data.id || null);
    // setCurrentWhiteboardTitle(data.title || 'Untitled Whiteboard');
    
    // Clear selections
    setSelectedBoxes([]);
    setSelectedShapes([]);
    setSelectedMindMapNodes([]);
    setActiveMindMapNode(null);
  };

  const handleNewWhiteboard = () => {
    // Clear all elements
    setTextBoxes([]);
    setShapes([]);
    setImages([]);
    setDrawingPaths([]);
    setMindMapNodes([]);
    
    // Reset whiteboard info
    setCurrentWhiteboardId(null);
    // setCurrentWhiteboardTitle('Untitled Whiteboard');
    
    // Clear selections
    setSelectedBoxes([]);
    setSelectedShapes([]);
    setSelectedMindMapNodes([]);
    setActiveMindMapNode(null);
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

      {/* Sidebar Sheet - only show when user is signed in */}
      {user && (
        <WhiteboardSidebarSheet
          onNewWhiteboard={handleNewWhiteboard}
          onLoadWhiteboard={handleLoadWhiteboard}
          currentWhiteboardId={currentWhiteboardId}
        />
      )}

      {/* Header (fixed, always visible) */}
      <Header
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      {/* Whiteboard (zoomed/panned area) */}
      <div
        ref={whiteboardRef}
        className={`relative w-full h-screen select-none pt-24 ${
          isPanning ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
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
        onMouseMove={e => {
          handleWhiteboardMouseMove({
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
          });
          
          // Handle mind map node resizing
          if (resizingMindMapNode && resizeMindMapStart) {
            const deltaX = e.clientX - resizeMindMapStart.x;
            const deltaY = e.clientY - resizeMindMapStart.y;
            const newWidth = Math.max(60, resizeMindMapStart.width + deltaX);
            const newHeight = Math.max(40, resizeMindMapStart.height + deltaY);
            
            setMindMapNodes(nodes => 
              nodes.map(node => 
                node.id === resizingMindMapNode 
                  ? { ...node, width: newWidth, height: newHeight }
                  : node
              )
            );
          }
          
          // Handle mind map node dragging
          if (draggingMindMapNode && dragMindMapStart) {
            const rect = whiteboardRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const mouseX = (e.clientX - rect.left - pan.x) / zoom;
            const mouseY = (e.clientY - rect.top - pan.y) / zoom;
            
            const deltaX = mouseX - dragMindMapStart.x;
            const deltaY = mouseY - dragMindMapStart.y;
            
            setMindMapNodes(nodes => 
              nodes.map(node => {
                if (selectedMindMapNodes.includes(node.id)) {
                  return { ...node, x: node.x + deltaX, y: node.y + deltaY };
                }
                return node;
              })
            );
            
            // Update drag start position for next move
            setDragMindMapStart({
              x: mouseX,
              y: mouseY,
              offsetX: dragMindMapStart.offsetX,
              offsetY: dragMindMapStart.offsetY
            });
          }
        }}
        onMouseUp={() => {
          handleMouseUp({
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
            mindMapNodes,
            setSelectedBoxes,
            setSelectedShapes,
            setSelectedMindMapNodes,
            setMarquee
          });
          
          // Handle mind map node resize end
          if (resizingMindMapNode) {
            setResizingMindMapNode(null);
            setResizeMindMapStart(null);
          }
          
          // Handle mind map node drag end
          if (draggingMindMapNode) {
            setDraggingMindMapNode(null);
            setDragMindMapStart(null);
          }
        }}
        onMouseLeave={() => {
          handleMouseUp({
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
            mindMapNodes,
            setSelectedBoxes,
            setSelectedShapes,
            setSelectedMindMapNodes,
            setMarquee
          });
          
          // Handle mind map node resize end
          if (resizingMindMapNode) {
            setResizingMindMapNode(null);
            setResizeMindMapStart(null);
          }
        }}
        onWheel={e => handleWheel(e, whiteboardRef)}
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
        
        {/* Mind Map connectors */}
        {renderMindMapConnectors()}
        
        {/* Mind Map nodes */}
        {mindMapNodes.map(node => (
          <MindMapNode
            key={node.id}
            node={node}
            isActive={activeMindMapNode === node.id}
            isSelected={selectedMindMapNodes.includes(node.id)}
            onSelect={handleMindMapNodeSelect}
            onTextChange={handleMindMapNodeTextChange}
            onResizeStart={handleMindMapNodeResizeStart}
            onDelete={handleMindMapNodeDelete}
            onDragStart={handleMindMapNodeDragStart}
          />
        ))}
        
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
              if (isPanning || resizingBox || resizingShape || resizingImage || draggingBox || draggingShape) return;
              handleImageMouseDown(e, id);
            }}
            onResizeStart={handleImageResizeStart}
            onDelete={handleImageDelete}
          />
        ))}
        {/* Render shapes first so they are always behind text */}
        {shapes.map((shape) => (
          <ShapeElement
            key={shape.id}
            shape={shape}
            selected={selectedShapes.includes(shape.id)}
            onClick={(e, id) => handleShapeClick(e, id, selectedShapes, setSelectedShapes, setSelectedBoxes)}
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
            onTextChange={handleShapeTextChange}
            onTextBlur={handleShapeTextBlur}
            onTextDoubleClick={handleShapeTextDoubleClick}
            onDelete={handleShapeDelete}
            onChangeGradient={handleShapeChangeGradient}
            onResizeStart={handleShapeResizeStart}
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
        {textBoxes.length === 0 && shapes.length === 0 && images.length === 0 && drawingPaths.length === 0 && mindMapNodes.length === 0 && (
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