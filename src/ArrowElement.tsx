import React from 'react';

export interface Arrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface ArrowElementProps {
  arrow: Arrow;
  selected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}

const ArrowElement: React.FC<ArrowElementProps> = ({ arrow, selected, onClick, onMouseDown }) => {
  const left = Math.min(arrow.startX, arrow.endX);
  const top = Math.min(arrow.startY, arrow.endY);
  const width = Math.abs(arrow.endX - arrow.startX) || 1;
  const height = Math.abs(arrow.endY - arrow.startY) || 1;

  const startX = arrow.startX - left;
  const startY = arrow.startY - top;
  const endX = arrow.endX - left;
  const endY = arrow.endY - top;

  const angle = Math.atan2(endY - startY, endX - startX);
  const headLength = 10;
  const arrowHead = `${endX},${endY} ${endX - headLength * Math.cos(angle - Math.PI / 6)},${endY - headLength * Math.sin(angle - Math.PI / 6)} ${endX - headLength * Math.cos(angle + Math.PI / 6)},${endY - headLength * Math.sin(angle + Math.PI / 6)}`;

  return (
    <div
      className={`absolute${selected ? ' ring-2 ring-blue-400 z-20' : ''}`}
      style={{ left, top, width, height }}
      onClick={e => onClick(e, arrow.id)}
      onMouseDown={e => onMouseDown(e, arrow.id)}
    >
      <svg className="w-full h-full" style={{ overflow: 'visible' }}>
        <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="black" strokeWidth={2} />
        <polygon points={arrowHead} fill="black" />
      </svg>
    </div>
  );
};

export default ArrowElement;
