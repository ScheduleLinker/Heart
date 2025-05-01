import React, { useMemo } from 'react';
import dagre from 'dagre';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import 'reactflow/dist/style.css';

function BubbleColor({ data }) {
  const startHour = Number(String(data.start).substring(16, 18));
  const endHour = Number(String(data.end).substring(16, 18));
  var startColor = "";
  var endColor = "";

  switch (startHour) {
    case 0: startColor = "from-violet-950 "; break;
    case 1: startColor = "from-purple-950 "; break;
    case 2: startColor = "from-violet-900 "; break;
    case 3: startColor = "from-purple-900 "; break;
    case 4: startColor = "from-fuschia-900 "; break;
    case 5: startColor = "from-fuschia-800 "; break;
    case 6: startColor = "from-pink-900 "; break;
    case 7: startColor = "from-rose-900 "; break;
    case 8: startColor = "from-pink-800 "; break;
    case 9: startColor = "from-yellow-400 "; break;
    case 10: startColor = "from-amber-300 "; break;
    case 11: startColor = "from-yellow-300 "; break;
    case 12: startColor = "from-cyan-300 "; break;
    case 13: startColor = "from-cyan-400 "; break;
    case 14: startColor = "from-cyan-500 "; break;
    case 15: startColor = "from-sky-400 "; break;
    case 16: startColor = "from-sky-500 "; break;
    case 17: startColor = "from-sky-600 "; break;
    case 18: startColor = "from-blue-600 "; break;
    case 19: startColor = "from-blue-900 "; break;
    case 20: startColor = "from-orange-600 "; break;
    case 21: startColor = "from-red-600 "; break;
    case 22: startColor = "from-purple-600 "; break;
    case 23: startColor = "from-purple-700 "; break;
  }

  switch (endHour) {
    case 0: endColor = "to-violet-950"; break;
    case 1: endColor = "to-purple-950"; break;
    case 2: endColor = "to-violet-900"; break;
    case 3: endColor = "to-purple-900"; break;
    case 4: endColor = "to-fuschia-900"; break;
    case 5: endColor = "to-fuschia-800"; break;
    case 6: endColor = "to-pink-900"; break;
    case 7: endColor = "to-rose-900"; break;
    case 8: endColor = "to-pink-800"; break;
    case 9: endColor = "to-yellow-400"; break;
    case 10: endColor = "to-amber-300"; break;
    case 11: endColor = "to-yellow-300"; break;
    case 12: endColor = "to-cyan-300"; break;
    case 13: endColor = "to-cyan-400"; break;
    case 14: endColor = "to-cyan-500"; break;
    case 15: endColor = "to-sky-400"; break;
    case 16: endColor = "to-sky-500"; break;
    case 17: endColor = "to-sky-600"; break;
    case 18: endColor = "to-blue-600"; break;
    case 19: endColor = "to-blue-900"; break;
    case 20: endColor = "to-orange-600"; break;
    case 21: endColor = "to-red-600"; break;
    case 22: endColor = "to-purple-600"; break;
    case 23: endColor = "to-purple-700"; break;
  }

  return startColor + endColor;
}

// 🌐 Bubble node component
const BubbleNode = ({ data }) => (
  <div className={"bg-gradient-to-b " + BubbleColor({ data }) + " w-25 h-25 rounded-full text-black flex items-center justify-center shadow-lg text-sm text-center"}>
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
  g.setGraph({ rankdir: 'TB' });
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

function generateBubbleNode(event, index) {
  return {
    id: `event-${index}`,
    type: 'bubble',
    data: {
      label: event.summary,
      start: new Date(event.start),
      end: new Date(event.end),
    },
    position: { x: 0, y: 0 },
  };
}


const Workspace = () => {
  const uploadedData = localStorage.getItem('parsed-ics');

  const { nodes, edges } = useMemo(() => {
    if (!uploadedData) return { nodes: [], edges: [] };

    const parsedJson = JSON.parse(uploadedData);

    if (!Array.isArray(parsedJson) || !parsedJson[0]?.data?.events) {
      return { nodes: [], edges: [] };
    }

    const allEvents = parsedJson[0].data.events
    .map((event, i) => {
      const parsedEvent = {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      };
      return generateBubbleNode(parsedEvent, i);
    })
    .sort((a, b) => a.data.start - b.data.start);

    const nodes = [...allEvents];
const edges = [];

for (let i = 0; i < allEvents.length; i++) {
  const current = allEvents[i];
  for (let j = i - 1; j >= 0; j--) {
    if (allEvents[j].data.end <= current.data.start) {
      edges.push({
        id: `e-${allEvents[j].id}-${current.id}`,
        source: allEvents[j].id,
        target: current.id,
      });
      break;
    }
  }
}

    return {
      nodes: layoutNodes(nodes, edges),
      edges,
    };
  }, [uploadedData]);

  return (
    <div className="relative min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      {uploadedData ? (
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
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No data uploaded yet</p>
      )}
    </div>
  );
};

export default Workspace;
