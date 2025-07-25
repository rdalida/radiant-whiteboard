import React, { useState, useRef } from 'react';
import { useWhiteboardPanZoom } from './hooks/useWhiteboardPanZoom';
import { handleWhiteboardMouseDown } from './hooks/handleWhiteboardMouseDown';
import { handleWhiteboardMouseMove } from './hooks/handleWhiteboardMouseMove';
import { handleMouseUp } from './hooks/handleMouseUp';
import { useTextBoxHandlers } from './hooks/useTextBoxHandlers';
import { useShapeHandlers } from './hooks/useShapeHandlers';
import { useImageHandlers } from './hooks/useImageHandlers';
import { useArrowHandlers } from './hooks/useArrowHandlers';
import { useUniversalDragging } from './hooks/useUniversalDragging';
import { measureTextDimensions } from './utils/fontUtils';
import WhiteboardCanvas from './WhiteboardCanvas';
import TextBox from './TextBox';
import ImageElement from './ImageElement';
import ShapeElement from './ShapeElement';
import ArrowElement, { Arrow } from './ArrowElement';
import FloatingToolbar from './FloatingToolbar';
import MindMapNode, { MindMapNodeData } from './MindMapNode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';
import { useFirebaseAuth } from './hooks/useAuth';
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
  rotation: number;
  // Text formatting properties
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
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
  // Text formatting properties for shape text
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
}

import { gradients } from './gradients';
import { WhiteboardData, useFirebaseWhiteboard } from './hooks/useFirebaseWhiteboard';
import WhiteboardSidebarSheet from './components/WhiteboardSidebarSheet';
import AuthModal from './components/AuthModal';

function App() {
  const { user, loading: authLoading, error: authError } = useFirebaseAuth();
  const { updateWhiteboardTitle, getAllWhiteboards } = useFirebaseWhiteboard();
  
  // Debug user state
  React.useEffect(() => {
    console.log('🎯 App: User state changed', { 
      user: user?.uid, 
      userEmail: user?.email,
      authLoading, 
      authError 
    });
  }, [user, authLoading, authError]);
  
  const [currentWhiteboardId, setCurrentWhiteboardId] = useState<string | null>(null);
  const [currentWhiteboardTitle, setCurrentWhiteboardTitle] = useState<string>('New whiteboard');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [images, setImages] = useState<WhiteboardImage[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [currentArrow, setCurrentArrow] = useState<Arrow | null>(null);
  const [draggingArrow, setDraggingArrow] = useState<string | null>(null);
  const [dragArrowStart, setDragArrowStart] = useState<{ mouseX: number; mouseY: number; arrowPositions: { [id: string]: { startX: number; startY: number; endX: number; endY: number } } } | null>(null);
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // multi-select images
  const [selectedArrows, setSelectedArrows] = useState<string[]>([]); // multi-select arrows
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
  
  // Universal dragging system
  const { universalDragState, startDrag, updateDrag, endDrag } = useUniversalDragging();
  
  const [resizingBox, setResizingBox] = useState<string | null>(null);
  const [resizingShape, setResizingShape] = useState<string | null>(null);
  const [resizingImage, setResizingImage] = useState<string | null>(null);
  const [resizingArrow, setResizingArrow] = useState<{ id: string; handle: 'start' | 'end' } | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, fontSize: 0 });
  const [rotatingBox, setRotatingBox] = useState<string | null>(null);
  const [rotateStart, setRotateStart] = useState<{ centerX: number; centerY: number; startAngle: number; initialRotation: number }>({ centerX: 0, centerY: 0, startAngle: 0, initialRotation: 0 });
// Drag state for shapes - DEPRECATED (using universal dragging now)
// const [draggingShape, setDraggingShape] = useState<string | null>(null);
// const [dragShapeStart, setDragShapeStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
// Drag state for text boxes - DEPRECATED (using universal dragging now)
// const [draggingBox, setDraggingBox] = useState<string | null>(null);
// const [dragBoxStart, setDragBoxStart] = useState<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  
  // Auto-save hook
  const { triggerAutoSave, saveStatus } = useAutoSave(
    currentWhiteboardId,
    user,
    {
      textBoxes,
      shapes,
      images,
      arrows,
      drawingPaths,
      mindMapNodes,
    },
    currentWhiteboardTitle
  );

  // Create a stable reference for the data to prevent unnecessary re-renders
  const currentDataString = JSON.stringify({
    textBoxes,
    shapes,
    images,
    arrows,
    drawingPaths,
    mindMapNodes,
  });

  // Trigger auto-save when content changes
  React.useEffect(() => {
    if (currentWhiteboardId && user) {
      // Existing whiteboard - trigger auto-save
      triggerAutoSave(false);
    } else if (!currentWhiteboardId && user && 
               (textBoxes.length > 0 || shapes.length > 0 || images.length > 0 || arrows.length > 0 ||
                drawingPaths.length > 0 || mindMapNodes.length > 0)) {
      // New whiteboard with content - trigger auto-save
      triggerAutoSave(true).then((newId) => {
        if (newId) {
          setCurrentWhiteboardId(newId);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    }
  }, [currentDataString, currentWhiteboardId, user, triggerAutoSave]); // Use data string instead of individual arrays

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

  const handleRotateStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const box = textBoxes.find(b => b.id === id);
    if (!box) return;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    const startAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
    setRotatingBox(id);
    setRotateStart({ centerX, centerY, startAngle, initialRotation: box.rotation });
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

  // Arrow resize handler
  const handleArrowResizeStart = (e: React.MouseEvent, id: string, handle: 'start' | 'end') => {
    e.stopPropagation();
    setResizingArrow({ id, handle });
  };

  // Refactored: useImageHandlers for image events
  const {
    handleImageClick,
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
    selectedImages,
    setSelectedImages,
    setSelectedBoxes,
    setSelectedShapes,
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
      setSelectedImages([]);
      setSelectedArrows([]);
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
    // handleTextClick, // Now handled in onMouseUp
    handleTextChange,
    handleTextBlur
  } = useTextBoxHandlers(setTextBoxes, setSelectedBoxes);

  // Refactored: useShapeHandlers for shape events
  const {
    handleTextDoubleClick: handleShapeTextDoubleClick,
    handleTextBlur: handleShapeTextBlur,
    handleTextChange: handleShapeTextChange,
    // handleShapeClick, // Now handled in onMouseUp
    handleDelete: handleShapeDelete,
    handleChangeGradient: handleShapeChangeGradient
  } = useShapeHandlers(shapes, setShapes, setSelectedShapes, setSelectedBoxes, getRandomGradient);

  // Refactored: useArrowHandlers for arrow events
  const {
    handleArrowClick,
    handleArrowDelete,
    handleToggleStrokeStyle,
    handleChangeArrowGradient
  } = useArrowHandlers(setArrows, setSelectedArrows, getRandomGradient);

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
    setSelectedImages([]);
    setSelectedArrows([]);
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
    setArrows,
    setSelectedBoxes,
    setSelectedShapes,
    setSelectedArrows,
    lastMousePos,
    selectedBoxes,
    selectedShapes,
    selectedArrows,
    textBoxes,
    shapes,
    arrows,
    activeTool,
    getRandomGradient,
    activeMindMapNode,
    selectedMindMapNodes,
    setSelectedMindMapNodes,
    setMindMapNodes,
    addMindMapNode,
    addSiblingNode,
    addChildNode,
    handleMindMapNodeDelete,
    setSidebarOpen
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

  // Text formatting handlers for TextBox
  const handleTextBoxToggleBold = (id: string) => {
    setTextBoxes(textBoxes.map(box => {
      if (box.id !== id) return box;
      const newBold = !box.isBold;
      const dims = measureTextDimensions(box.text, box.fontSize, {
        isBold: newBold,
        isItalic: box.isItalic
      });
      return { ...box, isBold: newBold, width: dims.width, height: dims.height };
    }));
  };

  const handleTextBoxToggleItalic = (id: string) => {
    setTextBoxes(textBoxes.map(box => {
      if (box.id !== id) return box;
      const newItalic = !box.isItalic;
      const dims = measureTextDimensions(box.text, box.fontSize, {
        isBold: box.isBold,
        isItalic: newItalic
      });
      return { ...box, isItalic: newItalic, width: dims.width, height: dims.height };
    }));
  };

  const handleTextBoxToggleUnderline = (id: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, isUnderline: !box.isUnderline } : box
    ));
  };


  const handleTextBoxColorChange = (id: string, color: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, color } : box
    ));
  };

  // Text formatting handlers for Shape
  const handleShapeToggleBold = (id: string) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, isBold: !shape.isBold } : shape
    ));
  };

  const handleShapeToggleItalic = (id: string) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, isItalic: !shape.isItalic } : shape
    ));
  };

  const handleShapeToggleUnderline = (id: string) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, isUnderline: !shape.isUnderline } : shape
    ));
  };


  const handleShapeTextColorChange = (id: string, color: string) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, textColor: color } : shape
    ));
  };

  // Firebase whiteboard handlers
  const handleLoadWhiteboard = (data: WhiteboardData) => {
    setTextBoxes((data.textBoxes || []).map(box => ({
      rotation: 0,
      ...box
    })));
    setShapes(data.shapes || []);
    setImages(data.images || []);
    setDrawingPaths(data.drawingPaths || []);
    setMindMapNodes(data.mindMapNodes || []);
    
    // Handle arrows with backwards compatibility
    const loadedArrows = (data.arrows || []).map((arrow: any) => ({
      ...arrow,
      gradient: arrow.gradient || getRandomGradient().value,
      strokeStyle: arrow.strokeStyle || 'solid'
    }));
    setArrows(loadedArrows);
    
    // Set current whiteboard info
    setCurrentWhiteboardId(data.id || null);
    setCurrentWhiteboardTitle(data.title || 'New whiteboard');
    
    // Clear selections
    setSelectedBoxes([]);
    setSelectedShapes([]);
    setSelectedImages([]);
    setSelectedArrows([]);
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
    setArrows([]);
    
    // Reset whiteboard info
    setCurrentWhiteboardId(null);
    setCurrentWhiteboardTitle('New whiteboard');
    
    // Clear selections
    setSelectedBoxes([]);
    setSelectedShapes([]);
    setSelectedImages([]);
    setSelectedArrows([]);
    setSelectedMindMapNodes([]);
    setActiveMindMapNode(null);
  };

  // Function to update whiteboard title
  const handleTitleChange = async (newTitle: string) => {
    setCurrentWhiteboardTitle(newTitle);
    
    // If we have an existing whiteboard, just update the title
    if (currentWhiteboardId && user) {
      try {
        await updateWhiteboardTitle(currentWhiteboardId, newTitle);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error updating whiteboard title:', error);
      }
    }
    // For new whiteboards, the title will be used when auto-save creates the whiteboard
  };

  // Load the most recently updated whiteboard when a user logs in
  React.useEffect(() => {
    const loadLastWhiteboard = async () => {
      if (!user || currentWhiteboardId) return;
      const boards = await getAllWhiteboards(user);
      if (boards.length > 0) {
        handleLoadWhiteboard(boards[0]);
      } else {
        handleNewWhiteboard();
      }
    };

    if (!authLoading) {
      if (user) {
        loadLastWhiteboard();
      } else {
        handleNewWhiteboard();
      }
    }
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Show auth error if present */}
      {authError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong className="font-bold">Authentication Error: </strong>
          <span className="block sm:inline">{authError}</span>
        </div>
      )}
      
      {/* Show loading state while authenticating */}
      {authLoading && user && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50">
          <span className="block sm:inline">Authenticating...</span>
        </div>
      )}
      
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
          refreshTrigger={refreshTrigger}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      )}

      {/* Header (fixed, always visible) */}
      <Header 
        currentWhiteboardTitle={currentWhiteboardTitle}
        onTitleChange={handleTitleChange}
        onShowAuthModal={() => setShowAuthModal(true)}
        saveStatus={saveStatus}
      />

      {/* Floating Toolbar */}
      <Toolbar
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
          setIsDrawingArrow,
          setCurrentArrow,
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
            isDrawingArrow,
            currentArrow,
            setCurrentArrow,
            draggingArrow,
            dragArrowStart,
            setArrows,
            selectedArrows,
            draggingImage,
            dragImageStart,
            setImages,
            resizingBox,
            resizeStart,
            setTextBoxesResize: setTextBoxes,
            rotatingBox,
            rotateStart,
            setTextBoxesRotate: setTextBoxes,
            resizingShape,
            setShapesResize: setShapes,
            resizingImage,
            setImagesResize: setImages,
            setLastMousePos,
            marquee,
            setMarquee
          });
          
          // Universal dragging system - handle all element types
          if (universalDragState.draggingElement && universalDragState.dragStartData) {
            const rect = whiteboardRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const mouseX = (e.clientX - rect.left - pan.x) / zoom;
            const mouseY = (e.clientY - rect.top - pan.y) / zoom;
            
            updateDrag(mouseX, mouseY, (deltaX, deltaY, originalPositions) => {
              switch (universalDragState.dragType) {
                case 'textbox':
                  setTextBoxes(textBoxes =>
                    textBoxes.map(textBox => {
                      if (originalPositions[textBox.id]) {
                        const originalPos = originalPositions[textBox.id];
                        return { ...textBox, x: originalPos.x + deltaX, y: originalPos.y + deltaY };
                      }
                      return textBox;
                    })
                  );
                  break;
                case 'shape':
                  setShapes(shapes =>
                    shapes.map(shape => {
                      if (originalPositions[shape.id]) {
                        const originalPos = originalPositions[shape.id];
                        return { ...shape, x: originalPos.x + deltaX, y: originalPos.y + deltaY };
                      }
                      return shape;
                    })
                  );
                  break;
                case 'image':
                  setImages(images =>
                    images.map(image => {
                      if (originalPositions[image.id]) {
                        const originalPos = originalPositions[image.id];
                        return { ...image, x: originalPos.x + deltaX, y: originalPos.y + deltaY };
                      }
                      return image;
                    })
                  );
                  break;
              }
            });
          }
          
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
          
          // Handle arrow resizing
          if (resizingArrow) {
            const rect = whiteboardRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const mouseX = (e.clientX - rect.left - pan.x) / zoom;
            const mouseY = (e.clientY - rect.top - pan.y) / zoom;
            
            setArrows(arrows => 
              arrows.map(arrow => {
                if (arrow.id === resizingArrow.id) {
                  if (resizingArrow.handle === 'start') {
                    return { ...arrow, startX: mouseX, startY: mouseY };
                  } else {
                    return { ...arrow, endX: mouseX, endY: mouseY };
                  }
                }
                return arrow;
              })
            );
          }
        }}
        onMouseUp={(e) => {
          // Check if dragging occurred before calling endDrag
          const wasDragging = universalDragState.hasDragged;
          const draggedElementId = universalDragState.draggingElement;
          const draggedElementType = universalDragState.dragType;
          
          handleMouseUp({
            isDrawing,
            currentPath,
            setDrawingPaths,
            setCurrentPath,
            setIsDrawing,
            isDrawingArrow,
            currentArrow,
            setArrows,
            setCurrentArrow,
            setIsDrawingArrow,
            setResizingBox,
            setResizingShape,
            setResizingImage,
            setRotatingBox,
            // REMOVED: draggingShape, setDraggingShape, setDragShapeStart
            // REMOVED: draggingBox, setDraggingBox, setDragBoxStart
            draggingImage,
            setDraggingImage,
            setDragImageStart,
            draggingArrow,
            setDraggingArrow,
            setDragArrowStart,
            isPanning,
            setIsPanning,
            setPanStart,
            marquee,
            whiteboardRef,
            textBoxes,
            shapes,
            arrows,
            mindMapNodes,
            setSelectedBoxes,
            setSelectedShapes,
            setSelectedArrows,
            setSelectedMindMapNodes,
            setMarquee,
            endDragCallback: endDrag
          });
          
          // If no dragging occurred and we were preparing to drag, handle selection
          if (!wasDragging && draggedElementId && draggedElementType) {
            // This was a click, not a drag - handle selection
            if (draggedElementType === 'shape') {
              // Check if it was a Ctrl/Cmd click by looking at current event
              const isMultiSelect = e.ctrlKey || e.metaKey;
              if (isMultiSelect) {
                setSelectedShapes(prev => 
                  prev.includes(draggedElementId) 
                    ? prev.filter(id => id !== draggedElementId)
                    : [...prev, draggedElementId]
                );
              } else {
                // Single click - always select this shape
                setSelectedShapes([draggedElementId]);
                setSelectedBoxes([]);
                setSelectedImages([]);
                setSelectedArrows([]);
                setSelectedMindMapNodes([]);
              }
            } else if (draggedElementType === 'textbox') {
              const isMultiSelect = e.ctrlKey || e.metaKey;
              if (isMultiSelect) {
                setSelectedBoxes(prev => 
                  prev.includes(draggedElementId) 
                    ? prev.filter(id => id !== draggedElementId)
                    : [...prev, draggedElementId]
                );
              } else {
                // Single click - always select this text box
                setSelectedBoxes([draggedElementId]);
                setSelectedShapes([]);
                setSelectedImages([]);
                setSelectedArrows([]);
                setSelectedMindMapNodes([]);
              }
            }
          }
          
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
          
          // Handle arrow resize end
          if (resizingArrow) {
            setResizingArrow(null);
          }
        }}
        onMouseLeave={() => {
          handleMouseUp({
            isDrawing,
            currentPath,
            setDrawingPaths,
            setCurrentPath,
            setIsDrawing,
            isDrawingArrow,
            currentArrow,
            setArrows,
            setCurrentArrow,
            setIsDrawingArrow,
            setResizingBox,
            setResizingShape,
            setResizingImage,
            setRotatingBox,
            // REMOVED: draggingShape, setDraggingShape, setDragShapeStart
            // REMOVED: draggingBox, setDraggingBox, setDragBoxStart
            draggingImage,
            setDraggingImage,
            setDragImageStart,
            draggingArrow,
            setDraggingArrow,
            setDragArrowStart,
            isPanning,
            setIsPanning,
            setPanStart,
            marquee,
            whiteboardRef,
            textBoxes,
            shapes,
            arrows,
            mindMapNodes,
            setSelectedBoxes,
            setSelectedShapes,
            setSelectedArrows,
            setSelectedMindMapNodes,
            setMarquee,
            endDragCallback: endDrag
          });
          
          // Handle mind map node resize end
          if (resizingMindMapNode) {
            setResizingMindMapNode(null);
            setResizeMindMapStart(null);
          }
          
          // Handle arrow resize end (on mouse leave)
          if (resizingArrow) {
            setResizingArrow(null);
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
          setIsDrawingArrow,
          setCurrentArrow,
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
          currentArrow={currentArrow}
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
            selected={selectedImages.includes(img.id)}
            onClick={(e, id) => handleImageClick(e, id)}
            onMouseDown={(e, id) => {
              if (isPanning || resizingBox || resizingShape || resizingImage || universalDragState.draggingElement) return;
              handleImageMouseDown(e, id);
            }}
            onResizeStart={handleImageResizeStart}
          />
        ))}
        {/* Render shapes first so they are always behind text */}
        {shapes.map((shape) => (
          <ShapeElement
            key={shape.id}
            shape={shape}
            selected={selectedShapes.includes(shape.id)}
            onClick={(e) => {
              // Selection is now handled in onMouseUp to differentiate clicks from drags
              e.stopPropagation();
            }}
            onMouseDown={(e, id) => {
              if (e.button !== 0) return;
              if (isPanning || resizingShape || resizingBox) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              
              // Don't change selection here - let the onClick handler deal with selection
              // Just prepare for potential dragging with current selection
              const currentSelection = selectedShapes.includes(id) ? selectedShapes : [id];
              
              // Use universal dragging system
              startDrag(id, 'shape', mouseX, mouseY, currentSelection, shapes);
            }}
            onTextChange={handleShapeTextChange}
            onTextBlur={handleShapeTextBlur}
            onTextDoubleClick={handleShapeTextDoubleClick}
            onResizeStart={handleShapeResizeStart}
          />
        ))}
        
        {/* Render arrows */}
        {arrows.map((arrow) => (
          <ArrowElement
            key={arrow.id}
            arrow={arrow}
            selected={selectedArrows.includes(arrow.id)}
            onClick={(e, id) => handleArrowClick(e, id)}
            onMouseDown={(e, id) => {
              if (e.button !== 0) return;
              if (isPanning || resizingShape || resizingBox || resizingArrow) return;
              e.stopPropagation();
              const rect = whiteboardRef.current?.getBoundingClientRect();
              if (!rect) return;
              const mouseX = (e.clientX - rect.left - pan.x) / zoom;
              const mouseY = (e.clientY - rect.top - pan.y) / zoom;
              
              // If the clicked arrow is not selected, select it first
              if (!selectedArrows.includes(id)) {
                setSelectedArrows([id]);
                setSelectedBoxes([]);
                setSelectedShapes([]);
                setSelectedImages([]);
                setSelectedMindMapNodes([]);
              }
              
              setDraggingArrow(id);
              
              // Store the original positions of all selected arrows
              const arrowPositions: { [id: string]: { startX: number; startY: number; endX: number; endY: number } } = {};
              selectedArrows.forEach(arrowId => {
                const selectedArrow = arrows.find(a => a.id === arrowId);
                if (selectedArrow) {
                  arrowPositions[arrowId] = {
                    startX: selectedArrow.startX,
                    startY: selectedArrow.startY,
                    endX: selectedArrow.endX,
                    endY: selectedArrow.endY
                  };
                }
              });
              
              setDragArrowStart({
                mouseX,
                mouseY,
                arrowPositions
              });
            }}
            onResizeStart={handleArrowResizeStart}
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
            rotation={box.rotation}
            text={box.text}
            gradient={box.gradient}
            isEditing={box.isEditing}
            fontSize={box.fontSize}
            selected={selectedBoxes.includes(box.id) && !box.isEditing}
            isBold={box.isBold}
            isItalic={box.isItalic}
            isUnderline={box.isUnderline}
            color={box.color}
            onTextChange={handleTextChange}
            onTextBlur={handleTextBlur}
            onTextClick={(_, e) => {
              // Selection is now handled in onMouseUp to differentiate clicks from drags
              e.stopPropagation();
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
              
              // Don't change selection here - let the onClick handler deal with selection
              // Just prepare for potential dragging with current selection
              const currentSelection = selectedBoxes.includes(id) ? selectedBoxes : [id];
              
              // Use universal dragging system
              startDrag(id, 'textbox', mouseX, mouseY, currentSelection, textBoxes);
            }}
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
          />
        ))}

        {/* Floating Toolbar for selected elements */}
        {selectedShapes.length === 1 && (() => {
          const shape = shapes.find(s => s.id === selectedShapes[0]);
          if (!shape) return null;
          return (
            <FloatingToolbar
              key={`shape-toolbar-${shape.id}`}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              elementType="shape"
              textStyle={{
                isBold: shape.isBold,
                isItalic: shape.isItalic,
                isUnderline: shape.isUnderline,
                color: shape.textColor || '#000000'
              }}
              onToggleBold={() => handleShapeToggleBold(shape.id)}
              onToggleItalic={() => handleShapeToggleItalic(shape.id)}
              onToggleUnderline={() => handleShapeToggleUnderline(shape.id)}
              onColorChange={(color) => handleShapeTextColorChange(shape.id, color)}
              onChangeGradient={() => handleShapeChangeGradient(shape.id)}
              onDelete={() => handleShapeDelete(shape.id)}
            />
          );
        })()}

        {selectedBoxes.length === 1 && (() => {
          const textBox = textBoxes.find(t => t.id === selectedBoxes[0]);
          if (!textBox || textBox.isEditing) return null;
          return (
            <FloatingToolbar
              key={`textbox-toolbar-${textBox.id}`}
              x={textBox.x}
              y={textBox.y}
              width={textBox.width}
              elementType="textbox"
              textStyle={{
                isBold: textBox.isBold,
                isItalic: textBox.isItalic,
                isUnderline: textBox.isUnderline,
                color: textBox.color || '#000000'
              }}
              onToggleBold={() => handleTextBoxToggleBold(textBox.id)}
              onToggleItalic={() => handleTextBoxToggleItalic(textBox.id)}
              onToggleUnderline={() => handleTextBoxToggleUnderline(textBox.id)}
              onColorChange={(color) => handleTextBoxColorChange(textBox.id, color)}
              onChangeGradient={() => {
                const randomGradient = getRandomGradient();
                changeGradient(textBox.id, randomGradient.value);
              }}
              onDelete={() => deleteTextBox(textBox.id)}
            />
          );
        })()}

        {selectedImages.length === 1 && (() => {
          const image = images.find(i => i.id === selectedImages[0]);
          if (!image) return null;
          return (
            <FloatingToolbar
              key={`image-toolbar-${image.id}`}
              x={image.x}
              y={image.y}
              width={image.width}
              elementType="image"
              onDelete={() => handleImageDelete(image.id)}
            />
          );
        })()}

        {selectedArrows.length === 1 && (() => {
          const arrow = arrows.find(a => a.id === selectedArrows[0]);
          if (!arrow) return null;
          
          // Calculate toolbar position based on arrow bounds
          const left = Math.min(arrow.startX, arrow.endX);
          const top = Math.min(arrow.startY, arrow.endY);
          const width = Math.abs(arrow.endX - arrow.startX) || 100;
          
          return (
            <FloatingToolbar
              key={`arrow-toolbar-${arrow.id}`}
              x={left}
              y={top}
              width={width}
              elementType="arrow"
              arrowStyle={{
                strokeStyle: arrow.strokeStyle,
                gradient: arrow.gradient
              }}
              onToggleStrokeStyle={() => handleToggleStrokeStyle(arrow.id)}
              onChangeArrowGradient={() => handleChangeArrowGradient(arrow.id)}
              onDelete={() => handleArrowDelete(arrow.id)}
            />
          );
        })()}

        {/* Empty State */}
        {textBoxes.length === 0 && shapes.length === 0 && images.length === 0 && drawingPaths.length === 0 && mindMapNodes.length === 0 && arrows.length === 0 && (
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

      {/* Auth Modal - rendered at the top level to cover entire viewport */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default App;