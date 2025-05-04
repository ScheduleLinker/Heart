// src/lib/Workspace.tsx
import  { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  MiniMap,
  Position,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { parseISO, format } from "date-fns";
import RootNode from "@/components/RootNode";
import ClassNode from "@/components/ClassNode";
import SidebarComponent from "../Sidebar/SidebarComponent";

const nodeWidth = 180;
const nodeHeight = 80;

// Helper: returns 0–6 for Sunday–Saturday
const getDayOfWeek = (dateStr: string): number => new Date(dateStr).getDay();

// Automatic Dagre layout
const layoutNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) =>
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((node) => {
    const { x, y } = g.node(node.id)!;
    return { ...node, position: { x, y } };
  });
};

const nodeTypes = { root: RootNode, class: ClassNode };

// Colors for Sunday→Saturday
const weekdayColors = [
  "#FF3B30", // Sunday
  "#FF9500", // Monday
  "#FFCC00", // Tuesday
  "#4CD964", // Wednesday
  "#7FFF00", // Thursday
  "#5856D6", // Friday
  "#FF2D55", // Saturday
];

export default function Workspace() {
  const [icsRaw, setIcsRaw] = useState<string | null>(
    () => localStorage.getItem('parsed-ics')
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const history = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // Central date picker (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Save for undo + persistence
  const saveSnapshot = (n: Node[], e: Edge[]) => {
    history.current.push({ nodes: n, edges: e });
    localStorage.setItem(
      "schedule-state",
      JSON.stringify({ nodes: n, edges: e })
    );
  };

  // 1) Build & layout graph once on load (or when ICS data changes)
  useEffect(() => {
    if (!icsRaw) return;
    let parsed: any;
    try {
      parsed = JSON.parse(icsRaw);
    } catch {
      console.error("Invalid parsed-ics JSON");
      return;
    }

    const list = Array.isArray(parsed) ? parsed : [parsed];
    const genNodes: Node[] = [];
    const genEdges: Edge[] = [];

    list.forEach((icsObj, idx) => {
      const rootId = `root-${idx}`;
      const letter = String.fromCharCode(65 + idx); // A, B, C…
      // create root node
      genNodes.push({
        id: rootId,
        type: "root",
        data: { label: `Schedule ${letter}`, setLabel: () => {} },
        position: { x: 0, y: 0 },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      const events = icsObj.data?.events;
      if (!Array.isArray(events)) return;

      // initial selected date-of-week
      const selDow = getDayOfWeek(selectedDate);

      events.forEach((e: any, i: number) => {
        const evtId = `${rootId}-evt-${i}`;
        const startIso = e.start;
        const dow = getDayOfWeek(startIso);

        genNodes.push({
          id: evtId,
          type: "class",
          data: {
            label: e.summary,
            start: startIso,
            isSelected: dow === selDow, // compare day-of-week
            highlightColor: weekdayColors[dow],
            time: format(parseISO(startIso), "h:mm a"),
          },
          position: { x: 0, y: 0 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        genEdges.push({
          id: `e-${rootId}-${evtId}`,
          source: rootId,
          target: evtId,
          type: "default",
        });
      });
    });

    const laid = layoutNodes(genNodes, genEdges);
    setNodes(laid);
    setEdges(genEdges);
    saveSnapshot(laid, genEdges);
  }, [icsRaw]);

  // 2) Re‑highlight only by central date change
  useEffect(() => {
    const selDow = getDayOfWeek(selectedDate);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== "class") return n;
        const nodeDow = getDayOfWeek(n.data.start);
        return {
          ...n,
          data: {
            ...n.data,
            isSelected: nodeDow === selDow,
          },
        };
      })
    );
  }, [selectedDate, setNodes]);

  // 3) Undo with Ctrl+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        history.current.pop();
        const prev = history.current.pop();
        if (prev) {
          setNodes(prev.nodes);
          setEdges(prev.edges);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // reset layout
  const resetLayout = () => {
    // localStorage.removeItem("schedule-state");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white p-4">
      <div className="flex justify-between mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-2 py-1 rounded bg-gray-700 text-white"
        />
        <button
          onClick={resetLayout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Reset
        </button>
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
            setEdges(addEdge({ ...p, type: "default" }, edges));
          }}
          onNodeDragStart={() => saveSnapshot(nodes, edges)}
          onEdgeUpdate={(oldE, newC) => {
            saveSnapshot(nodes, edges);
            const updated = edges
              .filter((e) => e.id !== oldE.id)
              .concat({
                ...newC,
                id: `e-${newC.source}-${newC.target}`,
                type: "default",
              });
            const relaid = layoutNodes(nodes, updated);
            setNodes(relaid);
            setEdges(updated);
          }}
          onEdgeUpdateEnd={(_, edge) =>
            setEdges((eds) => eds.filter((e) => e.id !== edge.id))
          }
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineStyle={{ stroke: "cyan", strokeWidth: 2 }}
          fitView
          className="bg-gray-900"
        >
          <Background color="#444" gap={16} />
          <Controls />
          <MiniMap/>
        </ReactFlow>
      </div>
      <SidebarComponent
        onCreateNode={(label, role) => {
          if (role === "root") {
            // add a new root node:
            const id = `root-${nodes.length}`;
            const newRoot: Node = {
              id,
              type: "root",
              data: { label, setLabel: () => {} },
              position: { x: 0, y: 0 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
            };
            setNodes((nds) => layoutNodes([...nds, newRoot], edges));
          } else {
            // add a child node
            const id = `child-${nodes.length}`;
            const newChild: Node = {
              id,
              type: "class",
              data: {
                label,
                start: new Date().toISOString(),
                isSelected: false,
                highlightColor: weekdayColors[new Date().getDay()],
                time: format(new Date(), "h:mm a"),
              },
              position: { x: 0, y: 0 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
            };
            setNodes((nds) => layoutNodes([...nds, newChild], edges));
          }
        }}
        onUpload={(parsedJson: any) => {
          localStorage.setItem("parsed-ics", JSON.stringify(parsedJson));
          setIcsRaw(JSON.stringify(parsedJson));
        }}
      />


    </div>
  );
}
