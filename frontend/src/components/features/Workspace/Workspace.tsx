import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { parseISO, format } from 'date-fns';
import RootNode from '@/components/RootNode';
import ClassNode from '@/components/ClassNode';

const nodeWidth = 180;
const nodeHeight = 80;

// Helper function to get day of week (0-6 for Sunday-Saturday)
const getDayOfWeek = (date) => {
  const d = new Date(date);
  return d.getDay();
};

// Helper function to check if two dates fall on the same day of the week
const isSameDayOfWeek = (date1, date2) => {
  const day1 = getDayOfWeek(date1);
  const day2 = getDayOfWeek(date2);
  return day1 === day2;
};

// Debug function to log date comparisons
const debugDates = (date1, date2, isMatch) => {
  console.log(`Comparing days of week: 
    Date1: ${new Date(date1).toISOString()} (${new Date(date1).toLocaleDateString('en-US', { weekday: 'long' })})
    Date2: ${new Date(date2).toISOString()} (${new Date(date2).toLocaleDateString('en-US', { weekday: 'long' })})
    Same day of week: ${isMatch}
  `);
};

// Lay out nodes with Dagre
const layoutNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((node) => {
    const { x, y } = g.node(node.id)!;
    return { ...node, position: { x, y } };
  });
};

const nodeTypes = { root: RootNode, class: ClassNode };

// Colors for Sunday (0) → Saturday (6)
const weekdayColors = [
  '#e53e3e', // Sunday – red
  '#dd6b20', // Monday – orange
  '#d69e2e', // Tuesday – yellow
  '#38a169', // Wednesday – green
  '#319795', // Thursday – teal
  '#3182ce', // Friday – blue
  '#805ad5', // Saturday – purple
];

export default function Workspace() {
  const icsRaw = localStorage.getItem('parsed-ics');
  const [rootLabel, setRootLabel] = useState('My Schedule');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const history = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [debugInfo, setDebugInfo] = useState("");

  // Date picker state (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Snapshot helper
  const saveSnapshot = (n: Node[], e: Edge[]) => {
    history.current.push({ nodes: n, edges: e });
    localStorage.setItem('schedule-state', JSON.stringify({ nodes: n, edges: e }));
  };

  // Initial build or restore
  useEffect(() => {
    console.log("Building/restoring with selectedDate:", selectedDate);
    
    // Try restore from storage
    const saved = localStorage.getItem('schedule-state');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p.nodes) && p.nodes.length > 1) {
          setNodes(p.nodes);
          setEdges(p.edges);
          
          // Even when restoring, update node selection based on current date
          setTimeout(() => updateNodeSelection(selectedDate), 100);
          return;
        }
      } catch (err) {
        console.error("Failed to restore state:", err);
      }
    }

    if (!icsRaw) {
      console.log("No ICS data found");
      return;
    }
    
    let parsedIcs: any;
    try {
      parsedIcs = JSON.parse(icsRaw);
    } catch (err) {
      console.error('Invalid parsed-ics JSON:', err);
      return;
    }

    const rawEvents = Array.isArray(parsedIcs)
      ? parsedIcs[0]?.data?.events
      : parsedIcs?.data?.events;
    
    if (!Array.isArray(rawEvents)) {
      console.error("No events found in ICS data");
      return;
    }

    console.log(`Processing ${rawEvents.length} events`);
    
    // Get the day of week for selected date
    const selectedDayOfWeek = getDayOfWeek(selectedDate);
    const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`Selected day of week: ${selectedDayOfWeek} (${selectedDayName})`);

    const genNodes: Node[] = [
      {
        id: 'root',
        type: 'root',
        data: { label: rootLabel, setLabel: setRootLabel },
        position: { x: 0, y: 0 },
        sourcePosition: 'bottom',
        targetPosition: 'top',
      },
    ];
    const genEdges: Edge[] = [];
    const seen: Record<string, string> = {};

    rawEvents.forEach((e: any, idx: number) => {
      const id = `event-${idx}`;
      const startIso = e.start;
      const startDate = parseISO(startIso);
      const eventDayOfWeek = getDayOfWeek(startDate);
      const eventDayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Compare days of week instead of actual dates
      const isMatch = eventDayOfWeek === selectedDayOfWeek;
      
      // Debug
      debugDates(startDate, selectedDate, isMatch);
      
      const label = e.summary;
      let parentId = 'root';

      // detect sub‑class
      Object.entries(seen).forEach(([sid, slog]) => {
        const mainNorm = slog.toLowerCase().replace(/\W/g, '');
        const curNorm = label.toLowerCase().replace(/\W/g, '');
        const isSub = /recitation|lab/.test(label.toLowerCase());
        if (isSub && curNorm.includes(mainNorm) && curNorm !== mainNorm) {
          parentId = sid;
        }
      });

      genNodes.push({
        id,
        type: 'class',
        data: {
          label,
          start: startIso,
          isSelected: isMatch,
          highlightColor: weekdayColors[eventDayOfWeek],
          // Add debug info to see days in the nodes
          debugDate: eventDayName,
          time: format(startDate, 'h:mm a')
        },
        position: { x: 0, y: 0 },
        sourcePosition: 'bottom',
        targetPosition: 'top',
      });

      genEdges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'default',
      });

      seen[id] = label;
    });

    const laid = layoutNodes(genNodes, genEdges);
    setNodes(laid);
    setEdges(genEdges);
    saveSnapshot(laid, genEdges);
    
    // Update debug info
    setDebugInfo(`Selected day: ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}, Events: ${rawEvents.length}`);
    
  }, [icsRaw, rootLabel]);

  // Function to update node selection based on day of week
  const updateNodeSelection = (date) => {
    console.log("Updating node selection for date:", date);
    const selectedDayOfWeek = getDayOfWeek(date);
    const selectedDayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== 'class') return n;
        
        const eventDate = parseISO(n.data.start);
        const eventDayOfWeek = getDayOfWeek(eventDate);
        const isMatch = eventDayOfWeek === selectedDayOfWeek;
        
        // Debug
        if (n.data.label) {
          debugDates(eventDate, date, isMatch);
        }
        
        return {
          ...n,
          data: {
            ...n.data,
            isSelected: isMatch,
            highlightColor: weekdayColors[eventDayOfWeek],
            debugDate: eventDate.toLocaleDateString('en-US', { weekday: 'long' }),
            time: format(eventDate, 'h:mm a')
          },
        };
      })
    );
    
    // Update debug info
    setDebugInfo(`Selected day: ${selectedDayName}`);
  };

  // Handle date changes
  useEffect(() => {
    updateNodeSelection(selectedDate);
  }, [selectedDate]);

  // Ctrl+Z undo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        history.current.pop(); // drop current
        const prev = history.current.pop(); // get last snapshot
        if (prev) {
          setNodes(prev.nodes);
          setEdges(prev.edges);
          // After restoring, update selection based on current date
          setTimeout(() => updateNodeSelection(selectedDate), 100);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedDate]);

  // Reset layout
  const resetLayout = () => {
    localStorage.removeItem('schedule-state');
    window.location.reload();
  };

  // Force update - helper button for debugging
  const forceUpdateSelection = () => {
    updateNodeSelection(selectedDate);
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Schedule Viewer</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="date-picker">Highlight Day:</label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700"
          />
          <div className="bg-gray-700 px-2 py-1 rounded">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <button
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            onClick={forceUpdateSelection}
          >
            Update
          </button>
          <button
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            onClick={resetLayout}
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Debug info display */}
      <div className="bg-gray-800 p-2 mb-2 rounded text-xs">
        {debugInfo}
      </div>

      <div className="h-[85%] border border-gray-700 rounded bg-gray-800">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(p) => {
            saveSnapshot(nodes, edges);
            const ups = addEdge({ ...p, type: 'default' }, edges);
            setEdges(ups);
          }}
          onNodeDragStart={() => saveSnapshot(nodes, edges)}
          onEdgeUpdate={(oldE, newC) => {
            saveSnapshot(nodes, edges);
            const ups = edges
              .filter((e) => e.id !== oldE.id)
              .concat({ ...newC, id: `e-${newC.source}-${newC.target}`, type: 'default' });
            const rel = layoutNodes(nodes, ups);
            setNodes(rel);
            setEdges(ups);
          }}
          onEdgeUpdateEnd={(_, edge) =>
            setEdges((eds) => eds.filter((e) => e.id !== edge.id))
          }
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineStyle={{ stroke: 'cyan', strokeWidth: 2 }}
          fitView
          className="bg-gray-900"
        >
          <Background color="#444" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}