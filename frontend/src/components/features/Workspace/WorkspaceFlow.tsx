import React, {
    useMemo,
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
  } from 'react';
  import dagre from 'dagre';
  import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
  } from 'reactflow';
  import 'reactflow/dist/style.css';
  import { format } from 'date-fns';
  
  // 🔵 Bubble Node Component
  const BubbleNode = ({ data }) => (
    <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg text-sm text-center relative">
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} id="default" style={{ background: '#fff' }} />
      <Handle type="target" position={Position.Top} id="default" style={{ background: '#fff' }} />
    </div>
  );
  
  const nodeTypes = {
    bubble: BubbleNode,
  };
  
  const nodeWidth = 180;
  const nodeHeight = 60;
  
  function layoutNodes(nodes, edges) {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB' });
    g.setDefaultEdgeLabel(() => ({}));
    nodes.forEach((node) => g.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    dagre.layout(g);
    return nodes.map((node) => {
      const { x, y } = g.node(node.id);
      return {
        ...node,
        position: { x, y },
        style: { width: nodeWidth, height: nodeHeight },
      };
    });
  }
  
  function groupEventsByDate(events) {
    const groups = {};
    events.forEach((event, i) => {
      const dateKey = format(new Date(event.start), 'MM-dd-yyyy');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push({
        ...event,
        id: `event-${i}`,
        start: new Date(event.start),
        end: new Date(event.end),
      });
    });
    return groups;
  }
  
  // ✅ Forward ref to allow parent to call `addNode`
  const WorkspaceFlow = forwardRef((_, ref) => {
    const uploadedData = localStorage.getItem('parsed-ics');
    const [selectedDate, setSelectedDate] = useState('');
    const [mainLabel, setMainLabel] = useState('Classes');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const { grouped, availableDates } = useMemo(() => {
      if (!uploadedData) return { grouped: {}, availableDates: [] };
      const parsedJson = JSON.parse(uploadedData);
      const grouped = groupEventsByDate(parsedJson.data.events);
      const availableDates = Object.keys(grouped).sort();
      return { grouped, availableDates };
    }, [uploadedData]);
  
    useEffect(() => {
      if (!selectedDate || !grouped[selectedDate]) {
        setNodes([]);
        setEdges([]);
        return;
      }
  
      const dayEvents = grouped[selectedDate].sort((a, b) => a.start - b.start);
      const mainNodeId = 'main-classes';
  
      const newNodes = [
        {
          id: mainNodeId,
          type: 'bubble',
          data: { label: mainLabel },
          position: { x: 0, y: 0 },
        },
      ];
      const newEdges = [];
  
      for (let i = 0; i < dayEvents.length; i++) {
        const e = dayEvents[i];
        const nodeId = e.id;
  
        newNodes.push({
          id: nodeId,
          type: 'bubble',
          data: { label: e.summary },
          position: { x: 0, y: 0 },
        });
  
        newEdges.push({
          id: `main-to-${nodeId}`,
          source: mainNodeId,
          target: nodeId,
          sourceHandle: 'default',
          targetHandle: 'default',
        });
      }
  
      const laidOutNodes = layoutNodes(newNodes, newEdges);
      setNodes(laidOutNodes);
      setEdges(newEdges);
    }, [selectedDate, grouped, mainLabel]);
  
    const handleEdgeClick = (event, edge) => {
      event.stopPropagation();
      setEdges((prev) => prev.filter((e) => e.id !== edge.id));
    };
  
    const handleConnect = (connection) => {
      const newEdge = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        sourceHandle: connection.sourceHandle || 'default',
        targetHandle: connection.targetHandle || 'default',
      };
      setEdges((eds) => [...eds, newEdge]);
    };
  
    // ✅ Expose this method to parent via `ref`
    useImperativeHandle(ref, () => ({
      addNode: () => {
        const newId = `node-${Date.now()}`;
        const newNode = {
          id: newId,
          type: 'bubble',
          data: { label: `New Node` },
          position: {
            x: Math.random() * 600 + 100,
            y: Math.random() * 300 + 100,
          },
        };
        setNodes((prev) => [...prev, newNode]);
      },
    }));
  
    return (
      <div>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          <div>
            <label className="mr-2 text-gray-700 dark:text-gray-300">Select Date:</label>
            <select
              className="border p-2 rounded dark:bg-gray-800 dark:text-white"
              onChange={(e) => setSelectedDate(e.target.value)}
              value={selectedDate}
            >
              <option value="" disabled>Select a date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="mr-2 text-gray-700 dark:text-gray-300">Main Bubble Label:</label>
            <input
              type="text"
              className="border p-2 rounded dark:bg-gray-800 dark:text-white"
              value={mainLabel}
              onChange={(e) => setMainLabel(e.target.value)}
            />
          </div>
        </div>
  
        <div className="h-[700px] border rounded bg-white dark:bg-gray-800">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onEdgeClick={handleEdgeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    );
  });
  
  export default WorkspaceFlow;
  