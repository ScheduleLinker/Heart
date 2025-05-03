import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import dagre from 'dagre';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  Handle, 
  Position,
  applyEdgeChanges,
  Connection,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SidebarComponent from '../Sidebar/SidebarComponent';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from '@/components/ui/calendar';



/* 
  This Advanced Workspace gives the user more customizeable and detailed node layoout
  and nodes are groped in by a dates using a date picker. 

*/

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


const BubbleNode = ({ data }) => (
  <div className={"bg-gradient-to-b " + BubbleColor({ data }) + " w-25 h-25 rounded-full text-black flex items-center justify-center shadow-lg text-sm text-center"}>
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-black" connectable={true} />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-black" connectable={true} />
    {/* <Handle type="source" position={Position.Right} className="w-2 h-2 bg-black" connectable={true} />
    <Handle type="target" position={Position.Left} className="w-2 h-2 bg-black" connectable={true} /> */}
    {data.label}
  </div>
);

const nodeTypes = {
  bubble: BubbleNode,
};

const nodeWidth = 190;
const nodeHeight = 70;
const nodeVerticalGap = 80;

function layoutNodes(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB' });
  //g.setGraph({ rankdir: 'LR' }); // horizontal layout
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


const advancedWorkspace = () => {
  const uploadedData = localStorage.getItem("parsed-ics");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBubbleLabel, setNewBubbleLabel] = useState("");
  const [edgeType, setEdgeType] = useState<'straight' | 'step' | 'smoothstep' | 'default'>('straight');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);


  const { grouped, availableDates } = useMemo(() => {
    if (!uploadedData) return { grouped: {}, availableDates: [] };
  
    const parsedJson = JSON.parse(uploadedData);
    if (!Array.isArray(parsedJson) || !parsedJson[0]?.data?.events) {
      return { grouped: {}, availableDates: [] };
    }
  
    const grouped = groupEventsByDate(parsedJson[0].data.events);
    const availableDates = Object.keys(grouped).sort();
    return { grouped, availableDates };
  }, [uploadedData]);
  

  const onEdgesChange = useCallback(
    (changes) => setEdges((nds) => applyEdgeChanges(changes, nds)),
    [],
  );

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);



  const handleConfirmCreate = () => {
    if (!newBubbleLabel.trim()) return;
  
    const index = nodes.length;
    const newEvent = {
      summary: newBubbleLabel.trim(),
      start: new Date(),
      end: new Date(),
    };
  
    // Determine position: below the last node or at (0, 0) if it's the first
    const lastNode = nodes[nodes.length - 1];
    const newPosition = lastNode
      ? {
          x: lastNode.position.x,
          y: lastNode.position.y + nodeHeight + nodeVerticalGap,
        }
      : { x: 0, y: 0 };
  
    const newNode = {
      ...generateBubbleNode(newEvent, index),
      position: newPosition,
    };
  
    setNodes((prev) => [...prev, newNode]);
  
    // Reset dialog
    setShowCreateDialog(false);
    setNewBubbleLabel("");
  };
  
  const createBubble = () => {
    if (!showCreateDialog) {
      setShowCreateDialog(true);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
  
    const formatted = format(selectedDate, 'MM-dd-yyyy');
    const selectedEvents = grouped[formatted];
    if (!selectedEvents) {
      setNodes([]);
      setEdges([]);
      return;
    }
  
    const allNodes = selectedEvents.map((event, i) =>
      generateBubbleNode(event, `${formatted}-${i}`)
    );
  
    const newEdges = [];
  
    for (let i = 0; i < allNodes.length; i++) {
      const current = allNodes[i];
      for (let j = i - 1; j >= 0; j--) {
        if (allNodes[j].data.end <= current.data.start) {
          newEdges.push({
            id: `e-${allNodes[j].id}-${current.id}`,
            source: allNodes[j].id,
            target: current.id,
          });
          break;
        }
      }
    }
  
    const laidOut = layoutNodes(allNodes, newEdges);
    setNodes(laidOut);
    setEdges(newEdges);
  }, [selectedDate, grouped]);

  useEffect(() => {
    if (nodes.length > 0) {
      const simplifiedNodes = nodes.map(({ id, data, position, type }) => ({
        id,
        data,
        position,
        type,
      }));
      localStorage.setItem("saved-nodes", JSON.stringify(simplifiedNodes));
      localStorage.setItem("saved-edges", JSON.stringify(edges));
    }
  }, [nodes, edges]); // ← track `edges` too
  

  useEffect(() => {
    const savedNodesJSON = localStorage.getItem("saved-nodes");
    const savedEdgesJSON = localStorage.getItem("saved-edges");
  
    if (savedNodesJSON) {
      const savedNodes = JSON.parse(savedNodesJSON).map((node) => ({
        ...node,
        data: {
          ...node.data,
          start: new Date(node.data.start),
          end: new Date(node.data.end),
        },
      }));
      setNodes(savedNodes);
  
      if (savedEdgesJSON) {
        const savedEdges = JSON.parse(savedEdgesJSON);
        setEdges(savedEdges);
      }
  
      return; // Don't parse ICS if saved data exists
    }

    if (!uploadedData) return;

    const parsedJson = JSON.parse(uploadedData);
    if (!Array.isArray(parsedJson) || !parsedJson[0]?.data?.events) return;

    const allEvents = parsedJson
    .flatMap((entry, fileIndex) =>
      entry.data?.events?.map((event, eventIndex) => {
        const parsedEvent = {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        };
        return generateBubbleNode(parsedEvent, `${fileIndex}-${eventIndex}`);
      }) || []
    )
    .sort((a, b) => a.data.start - b.data.start);

    const newEdges = [];

    for (let i = 0; i < allEvents.length; i++) {
      const current = allEvents[i];
      for (let j = i - 1; j >= 0; j--) {
        if (allEvents[j].data.end <= current.data.start) {
          newEdges.push({
            id: `e-${allEvents[j].id}-${current.id}`,
            source: allEvents[j].id,
            target: current.id,
          });
          break;
        }
      }
    }

    const laidOutNodes = layoutNodes(allEvents, newEdges);
    setNodes(laidOutNodes);
    setEdges(newEdges);
  }, [uploadedData]);

  return (
    <div className="relative min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      {uploadedData ? (
        <>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Select Date:</label>
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={setSelectedDate}
              disabled={(date) => {
                const formatted = format(date, 'MM-dd-yyyy');
                return !availableDates.includes(formatted);
              }}
              className="border rounded-md p-2 bg-white dark:bg-gray-800"
            />
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

export default advancedWorkspace;