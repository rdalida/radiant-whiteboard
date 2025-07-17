import React from 'react';

export function handleExport({ textBoxes, shapes, images, drawingPaths }: {
  textBoxes: any[];
  shapes: any[];
  images: any[];
  drawingPaths: any[];
}) {
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
}

export function handleImport(e: React.ChangeEvent<HTMLInputElement>, {
  setTextBoxes,
  setShapes,
  setImages,
  setDrawingPaths
}: {
  setTextBoxes: React.Dispatch<React.SetStateAction<any[]>>;
  setShapes: React.Dispatch<React.SetStateAction<any[]>>;
  setImages: React.Dispatch<React.SetStateAction<any[]>>;
  setDrawingPaths: React.Dispatch<React.SetStateAction<any[]>>;
}) {
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
}
