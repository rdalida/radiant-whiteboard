import { Dispatch, SetStateAction } from 'react';
import { WhiteboardImage } from '../App';

interface UseImageHandlersProps {
  images: WhiteboardImage[];
  setImages: Dispatch<SetStateAction<WhiteboardImage[]>>;
  setDraggingImage: Dispatch<SetStateAction<string | null>>;
  setDragImageStart: Dispatch<SetStateAction<{ x: number; y: number; offsetX: number; offsetY: number } | null>>;
  setResizingImage: Dispatch<SetStateAction<string | null>>;
  setResizeStart: Dispatch<SetStateAction<{ x: number; y: number; width: number; height: number; fontSize: number }>>;
  selectedImages: string[];
  setSelectedImages: Dispatch<SetStateAction<string[]>>;
  setSelectedBoxes: Dispatch<SetStateAction<string[]>>;
  setSelectedShapes: Dispatch<SetStateAction<string[]>>;
  whiteboardRef: React.RefObject<HTMLDivElement>;
  pan: { x: number; y: number };
  zoom: number;
}

export function useImageHandlers({
  images,
  setImages,
  setDraggingImage,
  setDragImageStart,
  setResizingImage,
  setResizeStart,
  setSelectedImages,
  setSelectedBoxes,
  setSelectedShapes,
  whiteboardRef,
  pan,
  zoom
}: UseImageHandlersProps) {
  // Handle image selection
  const handleImageClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      setSelectedImages(prev => 
        prev.includes(id) ? prev.filter(imageId => imageId !== id) : [...prev, id]
      );
    } else {
      // Single select
      setSelectedImages([id]);
    }
    
    // Clear other selections
    setSelectedBoxes([]);
    setSelectedShapes([]);
  };

  // Drag image
  const handleImageMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const rect = whiteboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const img = images.find(i => i.id === id);
    if (!img) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setDraggingImage(id);
    setDragImageStart({
      x: mouseX,
      y: mouseY,
      offsetX: mouseX - img.x,
      offsetY: mouseY - img.y
    });
  };

  // Resize image
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

  // Delete image
  const handleImageDelete = (id: string) => {
    setImages(images => images.filter(i => i.id !== id));
  };

  return {
    handleImageClick,
    handleImageMouseDown,
    handleImageResizeStart,
    handleImageDelete
  };
}
