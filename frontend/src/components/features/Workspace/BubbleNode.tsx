import { Handle, Position } from '@xyflow/react';

const BubbleNode = ({ data }) => {
  return (
    <div className="circle-node">
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ backgroundColor: '#4a5568' }} 
      />
      <div className="circle-content">
        {data.label}
      </div>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ backgroundColor: '#4a5568' }} 
      />
    </div>
  );
};
export default BubbleNode;