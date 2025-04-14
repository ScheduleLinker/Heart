import React, { useMemo, useState } from 'react';
import dagre from 'dagre';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { format } from 'date-fns';

// 🌐 Bubble node component
const BubbleNode = ({ data }) => (
  <div className="w-25 h-25 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg text-sm text-center">
    {data.label}
  </div>
);

const nodeTypes = {
  bubble: BubbleNode,
};

const nodeWidth = 180;
const nodeHeight = 60;

function layoutNodes(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB' }); // Top -> Bottom
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => g.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  dagre.layout(g);

  return nodes.map(node => {
    const { x, y } = g.node(node.id);
    return {
      ...node,
      position: { x, y },
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

const Workspace = () => {
  const uploadedData = localStorage.getItem('parsed-ics');
  const [selectedDate, setSelectedDate] = useState(null);

  const { grouped, availableDates } = useMemo(() => {
    if (!uploadedData) return { grouped: {}, availableDates: [] };

    const parsedJson = JSON.parse(uploadedData);
    const grouped = groupEventsByDate(parsedJson.data.events);
    const availableDates = Object.keys(grouped).sort();
    return { grouped, availableDates };
  }, [uploadedData]);

  const { nodes, edges } = useMemo(() => {
    if (!selectedDate || !grouped[selectedDate]) return { nodes: [], edges: [] };

    const dayEvents = grouped[selectedDate].sort((a, b) => a.start - b.start);
    const nodes = [];
    const edges = [];

    for (let i = 0; i < dayEvents.length; i++) {
      const e = dayEvents[i];
      nodes.push({
        id: e.id,
        type: 'bubble',
        data: { label: e.summary },
        position: { x: 0, y: 0 },
      });

      for (let j = i - 1; j >= 0; j--) {
        if (dayEvents[j].end <= e.start) {
          edges.push({
            id: `e-${dayEvents[j].id}-${e.id}`,
            source: dayEvents[j].id,
            target: e.id,
          });
          break;
        }
      }
    }

    return {
      nodes: layoutNodes(nodes, edges),
      edges,
    };
  }, [selectedDate, grouped]);

  return (
    <div className="relative min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      {uploadedData ? (
        <>
          <div className="mb-4">
            <label className="mr-2 text-gray-700 dark:text-gray-300">Select Date:</label>
            <select
              className="border p-2 rounded"
              onChange={(e) => setSelectedDate(e.target.value)}
              value={selectedDate || ''}
            >
              <option value="" disabled>Select a date</option>
              {availableDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>

          <div className="h-[700px] border rounded bg-white dark:bg-gray-800">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              nodeTypes={nodeTypes}
            >
              
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No data uploaded yet</p>
      )}
    </div>
  );
};

export default Workspace;
