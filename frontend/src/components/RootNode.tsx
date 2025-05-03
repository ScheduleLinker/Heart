import { useState } from 'react';
import { Handle, Position } from 'reactflow';

const RootNode = ({ data }: any) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label);

  return (
    <div
      className="relative rounded bg-yellow-500 text-white p-3 shadow-md text-center w-[180px]"
      onDoubleClick={() => setEditing(true)}
    >
      <Handle type="source" position={Position.Bottom} style={{ background: 'cyan' }} />
      <Handle type="target" position={Position.Top} style={{ background: 'cyan' }} />
      {editing ? (
        <input
          className="text-black p-1 rounded w-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            data.setLabel(value);
            setEditing(false);
          }}
          autoFocus
        />
      ) : (
        <div>{value}</div>
      )}
    </div>
  );
};

export default RootNode;
