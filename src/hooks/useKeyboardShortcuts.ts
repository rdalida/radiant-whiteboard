import { useEffect } from 'react';


interface UseKeyboardShortcutsProps {
  setActiveTool: (tool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen') => void;
  setTextBoxes: React.Dispatch<React.SetStateAction<any[]>>;
  setShapes: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedBoxes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedShapes: React.Dispatch<React.SetStateAction<string[]>>;
  lastMousePos: { x: number; y: number };
  selectedBoxes: string[];
  selectedShapes: string[];
  textBoxes: any[];
  shapes: any[];
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
}

export function useKeyboardShortcuts({
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
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.key === 'd' || e.key === 'D') && document.activeElement?.tagName !== 'INPUT') {
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
          }
        ]);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedBoxes.length > 0 || selectedShapes.length > 0 || selectedMindMapNodes.length > 0)) {
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
        
        // Delete selected mind map nodes
        if (selectedMindMapNodes.length > 0) {
          selectedMindMapNodes.forEach(nodeId => {
            handleMindMapNodeDelete(nodeId);
          });
          setSelectedMindMapNodes([]);
        }
      }
      
      // Mind Map shortcuts
      if ((e.key === 'm' || e.key === 'M') && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        addMindMapNode('Node');
      }
      
      if (e.key === 'Tab' && activeMindMapNode && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        addSiblingNode(activeMindMapNode);
      }
      
      if (e.key === 'Enter' && activeMindMapNode && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        addChildNode(activeMindMapNode);
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeMindMapNode && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleMindMapNodeDelete(activeMindMapNode);
      }
      
      // Arrow key movement for selected mind map nodes
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selectedMindMapNodes.length > 0 && document.activeElement?.tagName !== 'INPUT') {
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
