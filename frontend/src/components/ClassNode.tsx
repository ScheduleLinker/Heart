import React from 'react';
import { Handle, Position } from 'reactflow';

interface ClassNodeData {
  label: string;
  start: string;
  isSelected: boolean;
  highlightColor: string;
  // Add debug info
  debugDate?: string;
}

export default function ClassNode({ data }: { data: ClassNodeData }) {
  const { label, isSelected, highlightColor, debugDate } = data;
  
  // Very distinct styling for selected nodes
  const style = isSelected
    ? {
        backgroundColor: highlightColor,
        color: '#000000',
        fontWeight: 'bold',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: '#ffffff',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
      }
    : {
        backgroundColor: 'rgba(60, 60, 60, 0.8)',
        color: '#eeeeee', 
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(100, 100, 100, 0.5)'
      };

  return (
    <div
      style={style}
      className="p-3 rounded shadow w-48 text-center"
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-medium">{label}</div>
      {isSelected && (
        <div className="bg-white text-black rounded-full px-2 py-1 mt-1 text-xs font-bold">
          SELECTED
        </div>
      )}
      {debugDate && (
        <div className="text-xs mt-1 opacity-70">
          {debugDate}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}