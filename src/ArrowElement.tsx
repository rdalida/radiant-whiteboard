import React from 'react';

interface Gradient {
  name: string;
  value: string;
  preview: string;
}

interface ArrowElementProps {
  arrow: {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    gradient: Gradient;
  };
  selected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
}

const ArrowElement: React.FC<ArrowElementProps> = ({ arrow, selected, onClick }) => {
  const stops = arrow.gradient.preview.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g) || ['#000'];
  const gradientId = `arrow-gradient-${arrow.id}`;
  const markerId = `arrowhead-${arrow.id}`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 6, overflow: 'visible' }}
      onClick={(e) => onClick(e, arrow.id)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {stops.map((color, i) => (
            <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={color} />
          ))}
        </linearGradient>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={`url(#${gradientId})`} />
        </marker>
      </defs>
      <line
        x1={arrow.x1}
        y1={arrow.y1}
        x2={arrow.x2}
        y2={arrow.y2}
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: 'stroke' }}
      />
      {selected && (
        <line
          x1={arrow.x1}
          y1={arrow.y1}
          x2={arrow.x2}
          y2={arrow.y2}
          stroke="#3b82f6"
          strokeWidth={4}
          markerEnd={`url(#${markerId})`}
          strokeOpacity={0.3}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  );
};

export default ArrowElement;
