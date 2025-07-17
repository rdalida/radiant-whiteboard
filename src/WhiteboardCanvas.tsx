import React from 'react';

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  createdAt: number;
  gradient?: any;
}

interface WhiteboardCanvasProps {
  drawingPaths: DrawingPath[];
  currentPath: DrawingPath | null;
  gradients: any[];
  style?: React.CSSProperties;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  drawingPaths,
  currentPath,
  gradients,
  style = {},
}) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1, ...style }}>
      {/* SVG gradients for pen paths */}
      {drawingPaths.map((path) => {
        const grad = (path as any).gradient || gradients[0];
        const stops = grad.preview.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g) || ['#000'];
        return (
          <linearGradient id={path.color} key={path.color} x1="0%" y1="0%" x2="100%" y2="0%">
            {stops.map((color: string, i: number) => (
              <stop key={i} offset={`${(i/(stops.length-1))*100}%`} stopColor={color} />
            ))}
          </linearGradient>
        );
      })}
      {/* Current path gradient */}
      {currentPath && (currentPath as any).gradient && (() => {
        const grad = (currentPath as any).gradient;
        const gradientId = currentPath.color;
        const stops = grad.preview.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g) || ['#000'];
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {stops.map((color: string, i: number) => (
              <stop key={i} offset={`${(i/(stops.length-1))*100}%`} stopColor={color} />
            ))}
          </linearGradient>
        );
      })()}
      {drawingPaths.map((path) => {
        const now = Date.now();
        const age = now - path.createdAt;
        const fadeDuration = 1000; // ms
        const visibleDuration = 3000; // ms
        let opacity = 1;
        if (age > visibleDuration) {
          opacity = Math.max(0, 1 - (age - visibleDuration) / fadeDuration);
        }
        return (
          <path
            key={path.id}
            d={path.points.length > 1 ? `M ${path.points[0].x} ${path.points[0].y} ${path.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}` : ''}
            stroke={`url(#${path.color})`}
            strokeWidth={path.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity, transition: 'opacity 0.3s linear' }}
          />
        );
      })}
      {/* Render current path being drawn */}
      {currentPath && currentPath.points.length > 1 && (
        <path
          d={`M ${currentPath.points[0].x} ${currentPath.points[0].y} ${currentPath.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
          stroke={`url(#${currentPath.color})`}
          strokeWidth={currentPath.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export default WhiteboardCanvas;
