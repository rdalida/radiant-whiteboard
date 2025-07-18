import { useEffect } from 'react';
import { measureTextDimensions } from '../utils/fontUtils';


interface UseKeyboardShortcutsProps {
  setActiveTool: (tool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen') => void;
  setTextBoxes: React.Dispatch<React.SetStateAction<any[]>>;
  setShapes: React.Dispatch<React.SetStateAction<any[]>>;
  setArrows?: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedBoxes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedShapes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedArrows?: React.Dispatch<React.SetStateAction<string[]>>;
  lastMousePos: { x: number; y: number };
  selectedBoxes: string[];
  selectedShapes: string[];
  selectedArrows?: string[];
  textBoxes: any[];
  shapes: any[];
  arrows?: any[];
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  getRandomGradient: () => any;
  // Mind Map props
  activeMindMapNode: string | null;
  selectedMindMapNodes: string[];
  setSelectedMindMapNodes: React.Dispatch<React.SetStateAction<string[]>>;
  setMindMapNodes: React.Dispatch<React.SetStateAction<any[]>>;
  addMindMapNode: (text: string, parentId?: string | null, x?: number, y?: number) => void;
  addSiblingNode: (currentNodeId: string) => void;
  addChildNode: (currentNodeId: string) => void;
  handleMindMapNodeDelete: (id: string) => void;
  // Sidebar props
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useKeyboardShortcuts({
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
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      const isInputFocused = activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;
      const isEditingText = textBoxes.some(box => box.isEditing);
      if (!isInputFocused && !isEditingText) {
        if (e.key === 'q' || e.key === 'Q') {
          setActiveTool('rectangle');
        } else if (e.key === 'w' || e.key === 'W') {
          setActiveTool('circle');
        } else if (e.key === 'e' || e.key === 'E') {
          setActiveTool('diamond');
        } else if (e.key === 'r' || e.key === 'R') {
          setActiveTool('pen');
        } else if (e.key === 'b' || e.key === 'B') {
          // Toggle sidebar
          setSidebarOpen(prev => !prev);
        }
      }
      if ((e.key === 't' || e.key === 'T') && !isInputFocused && !isEditingText) {
        const randomGradient = getRandomGradient();
        setTextBoxes(boxes => {
          const fontSize = 32;
          const dims = measureTextDimensions('Text', fontSize);
          return [
            ...boxes,
            {
              id: Date.now().toString(),
              x: lastMousePos.x - dims.width / 2,
              y: lastMousePos.y - dims.height / 2,
              text: 'Text',
              gradient: randomGradient.value,
              isEditing: false,
            fontSize,
            width: dims.width,
            height: dims.height,
            rotation: 0,
            // Default formatting properties
              isBold: false,
              isItalic: false,
              isUnderline: false,
              textAlign: 'center',
              color: undefined // Use gradient by default
            }
          ];
        });
      }
      if ((e.key === 'd' || e.key === 'D') && !isInputFocused && !isEditingText) {
        e.preventDefault();
        setShapes(shapes => [
          ...shapes,
          {
            id: Date.now().toString(),
            type: activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond' ? activeTool : 'rectangle',
            x: lastMousePos.x - 50,
            y: lastMousePos.y - 50,
            width: 100,
            height: 100,
            gradient: 'bg-gray-200',
            text: '',
            isEditing: true,
            // Default formatting properties for shape text
            isBold: false,
            isItalic: false,
            isUnderline: false,
            textAlign: 'center',
            textColor: undefined // Use default text color
          }
        ]);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused && !isEditingText && (selectedBoxes.length > 0 || selectedShapes.length > 0 || (selectedArrows && selectedArrows.length > 0) || selectedMindMapNodes.length > 0)) {
        e.preventDefault();
        
        // Delete selected text boxes
        if (selectedBoxes.length > 0) {
          setTextBoxes(boxes => boxes.filter(box => !selectedBoxes.includes(box.id)));
          setSelectedBoxes([]);
        }
        
        // Delete selected shapes
        if (selectedShapes.length > 0) {
          setShapes(shapes => shapes.filter(shape => !selectedShapes.includes(shape.id)));
          setSelectedShapes([]);
        }

        // Delete selected arrows
        if (selectedArrows && selectedArrows.length > 0 && setArrows && setSelectedArrows) {
          setArrows(arrows => arrows.filter((a:any) => !selectedArrows.includes(a.id)));
          setSelectedArrows([]);
        }
        
        // Delete selected mind map nodes
        if (selectedMindMapNodes.length > 0) {
          selectedMindMapNodes.forEach(nodeId => {
            handleMindMapNodeDelete(nodeId);
          });
          setSelectedMindMapNodes([]);
        }
      }
      
      // Mind Map shortcuts
      if ((e.key === 'm' || e.key === 'M') && !isInputFocused && !isEditingText) {
        e.preventDefault();
        addMindMapNode('Node');
      }

      if (e.key === 'Tab' && activeMindMapNode && !isInputFocused && !isEditingText) {
        e.preventDefault();
        addSiblingNode(activeMindMapNode);
      }

      if (e.key === 'Enter' && activeMindMapNode && !isInputFocused && !isEditingText) {
        e.preventDefault();
        addChildNode(activeMindMapNode);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && activeMindMapNode && !isInputFocused && !isEditingText) {
        e.preventDefault();
        handleMindMapNodeDelete(activeMindMapNode);
      }

      // Arrow key movement for selected mind map nodes
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selectedMindMapNodes.length > 0 && !isInputFocused && !isEditingText) {
        e.preventDefault();
        const moveDistance = e.shiftKey ? 10 : 1; // Hold Shift for faster movement
        
        setMindMapNodes(nodes => 
          nodes.map(node => {
            if (selectedMindMapNodes.includes(node.id)) {
              let newX = node.x;
              let newY = node.y;
              
              switch (e.key) {
                case 'ArrowUp':
                  newY -= moveDistance;
                  break;
                case 'ArrowDown':
                  newY += moveDistance;
                  break;
                case 'ArrowLeft':
                  newX -= moveDistance;
                  break;
                case 'ArrowRight':
                  newX += moveDistance;
                  break;
              }
              
              return { ...node, x: newX, y: newY };
            }
            return node;
          })
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxes, selectedShapes, selectedMindMapNodes, lastMousePos, textBoxes, shapes, activeTool, activeMindMapNode]);
}
