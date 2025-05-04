// src/components/ClassNode.tsx
import React, { useState } from "react";
import { Handle, Position } from "reactflow";

interface ClassNodeData {
  label: string;
  start: string;
  isSelected: boolean;
  highlightColor: string; // e.g. "#dd6b20"
}

function getComplement(hex: string): string {
  const clean = hex.replace(/^#/, "");
  const num = parseInt(clean, 16);
  const inv = 0xffffff ^ num;
  return `#${inv.toString(16).padStart(6, "0")}`;
}

export default function ClassNode({ data }: { data: ClassNodeData }) {
  const { label, isSelected, highlightColor } = data;
  const complement = getComplement(highlightColor);
  const [hovered, setHovered] = useState(false);

  // Outer wrapper style: gradient background only on hover
  const outerStyle: React.CSSProperties = hovered
    ? {
        background: `linear-gradient(135deg, ${highlightColor}, ${complement})`,
      }
    : {};

  // Inner content style: solid background, box shadow if selected
  const innerStyle: React.CSSProperties = isSelected
    ? {
        backgroundColor: highlightColor,
        color: "#000",
        boxShadow: "0 0 10px rgba(0,0,0,0.6)",
      }
    : {
        backgroundColor: "rgba(60,60,60,0.8)",
        color: "#eee",
      };

  return (
    <div
      className="rounded-[20px] p-[4px] transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={outerStyle}
    >
      <div
        className="rounded-[16px] p-3 shadow w-48 text-center"
        style={innerStyle}
      >
        <Handle type="target" position={Position.Top} />
        <div className="font-medium">{label}</div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}
