import React from 'react';

export interface Arrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  gradient: string;
  strokeStyle: 'solid' | 'dashed';
}

interface ArrowElementProps {
  arrow: Arrow;
  selected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart?: (e: React.MouseEvent, id: string, handle: 'start' | 'end') => void;
}

const ArrowElement: React.FC<ArrowElementProps> = ({ arrow, selected, onClick, onMouseDown, onResizeStart }) => {
  const left = Math.min(arrow.startX, arrow.endX);
  const top = Math.min(arrow.startY, arrow.endY);
  const width = Math.abs(arrow.endX - arrow.startX) || 1;
  const height = Math.abs(arrow.endY - arrow.startY) || 1;

  const startX = arrow.startX - left;
  const startY = arrow.startY - top;
  const endX = arrow.endX - left;
  const endY = arrow.endY - top;

  const angle = Math.atan2(endY - startY, endX - startX);
  const headLength = 30;
  
  // Calculate where the line should end (before the arrow head)
  const lineEndX = endX - headLength * Math.cos(angle) * 0.7; // 0.7 to leave some space
  const lineEndY = endY - headLength * Math.sin(angle) * 0.7;
  
  const arrowHead = `${endX},${endY} ${endX - headLength * Math.cos(angle - Math.PI / 6)},${endY - headLength * Math.sin(angle - Math.PI / 6)} ${endX - headLength * Math.cos(angle + Math.PI / 6)},${endY - headLength * Math.sin(angle + Math.PI / 6)}`;

  // Helper function to extract gradient colors from Tailwind class
  const getGradientColors = (gradientClass: string) => {
    const gradientMap: { [key: string]: { from: string; to: string } } = {
      'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500': {
        from: '#ef4444', to: '#a855f7'
      },
      'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500': {
        from: '#fb923c', to: '#ec4899'
      },
      'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500': {
        from: '#60a5fa', to: '#14b8a6'
      },
      'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600': {
        from: '#4ade80', to: '#0d9488'
      },
      'bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500': {
        from: '#a78bfa', to: '#6366f1'
      },
      'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600': {
        from: '#facc15', to: '#dc2626'
      },
      'bg-gradient-to-r from-emerald-300 via-cyan-400 to-blue-400': {
        from: '#6ee7b7', to: '#60a5fa'
      },
      'bg-gradient-to-r from-pink-400 via-rose-500 to-red-500': {
        from: '#f472b6', to: '#ef4444'
      },
      'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500': {
        from: '#6366f1', to: '#ec4899'
      },
      'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500': {
        from: '#fbbf24', to: '#f97316'
      }
    };
    
    return gradientMap[gradientClass] || { from: '#6b7280', to: '#374151' };
  };

  const colors = getGradientColors(arrow.gradient);

  return (
    <div
      className={`absolute${selected ? ' ring-2 ring-blue-400 ring-offset-2' : ''}`}
      style={{ left: left - 10, top: top - 10, width: width + 20, height: height + 20 }}
      onClick={e => onClick(e, arrow.id)}
      onMouseDown={e => onMouseDown(e, arrow.id)}
    >
      <svg className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`arrow-gradient-${arrow.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <line 
          x1={startX + 10} 
          y1={startY + 10} 
          x2={lineEndX + 10} 
          y2={lineEndY + 10} 
          stroke={`url(#arrow-gradient-${arrow.id})`} 
          strokeWidth={8}
          strokeDasharray={arrow.strokeStyle === 'dashed' ? '8,4' : 'none'}
          strokeLinecap="round"
        />
        <polygon 
          points={arrowHead.split(' ').map(point => {
            const [x, y] = point.split(',').map(Number);
            return `${x + 10},${y + 10}`;
          }).join(' ')} 
          fill={colors.to}
        />
        
        {/* Resize handles when selected */}
        {selected && onResizeStart && (
          <>
            {/* Start handle */}
            <circle
              cx={startX + 10}
              cy={startY + 10}
              r={4}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              className="cursor-nw-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, arrow.id, 'start');
              }}
            />
            {/* End handle */}
            <circle
              cx={endX + 10}
              cy={endY + 10}
              r={4}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              className="cursor-se-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, arrow.id, 'end');
              }}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default ArrowElement;
