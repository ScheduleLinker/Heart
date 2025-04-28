import { useMemo, useState } from 'react';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { format } from 'date-fns';

function BubbleColor ({ data }) {
  const startHour = Number(String(data.start).substring(16,18))
  const endHour = Number(String(data.end).substring(16,18))
  var startColor = ""
  var endColor = ""
  switch (startHour) {
    case (0): startColor = "from-violet-950 "; break;
    case (1): startColor = "from-purple-950 "; break;
    case (2): startColor = "from-violet-900 "; break;
    case (3): startColor = "from-purple-900 "; break;
    case (4): startColor = "from-fuschia-900 "; break;
    case (5): startColor = "from-fuschia-800 "; break;
    case (6): startColor = "from-pink-900 "; break;
    case (7): startColor = "from-rose-900 "; break;
    case (8): startColor = "from-pink-800 "; break;
    case (9): startColor = "from-yellow-400 "; break;
    case (10): startColor = "from-amber-300 "; break;
    case (11): startColor = "from-yellow-300 "; break;
    case (12): startColor = "from-cyan-300 "; break;
    case (13): startColor = "from-cyan-400 "; break;
    case (14): startColor = "from-cyan-500 "; break;
    case (15): startColor = "from-sky-400 "; break;
    case (16): startColor = "from-sky-500 "; break;
    case (17): startColor = "from-sky-600 "; break;
    case (18): startColor = "from-blue-600 "; break;
    case (19): startColor = "from-blue-900 "; break;
    case (20): startColor = "from-orange-600 "; break;
    case (21): startColor = "from-red-600 "; break;
    case (22): startColor = "from-purple-600 "; break;
    case (23): startColor = "from-purple-700 "; break;
  }
  switch (endHour) {
    case (0): endColor = "to-violet-950"; break;
    case (1): endColor = "to-purple-950"; break;
    case (2): endColor = "to-violet-900"; break;
    case (3): endColor = "to-purple-900"; break;
    case (4): endColor = "to-fuschia-900"; break;
    case (5): endColor = "to-fuschia-800"; break;
    case (6): endColor = "to-pink-900"; break;
    case (7): endColor = "to-rose-900"; break;
    case (8): endColor = "to-pink-800"; break;
    case (9): endColor = "to-yellow-400"; break;
    case (10): endColor = "to-amber-300"; break;
    case (11): endColor = "to-yellow-300"; break;
    case (12): endColor = "to-cyan-300"; break;
    case (13): endColor = "to-cyan-400"; break;
    case (14): endColor = "to-cyan-500"; break;
    case (15): endColor = "to-sky-400"; break;
    case (16): endColor = "to-sky-500"; break;
    case (17): endColor = "to-sky-600"; break;
    case (18): endColor = "to-blue-600"; break;
    case (19): endColor = "to-blue-900"; break;
    case (20): endColor = "to-orange-600"; break;
    case (21): endColor = "to-red-600"; break;
    case (22): endColor = "to-purple-600"; break;
    case (23): endColor = "to-purple-700"; break;
  }
  return (startColor + endColor)
}

// 🌐 Bubble node component
const BubbleNode = ({ data }) => (
  <div className={"bg-gradient-to-b " + BubbleColor({data}) + " w-25 h-25 rounded-full text-black flex items-center justify-center shadow-lg text-sm text-center"}>
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
import React, { useRef, useState } from 'react';
import { UploadIcon, PlusIcon, MenuIcon, ArrowLeftIcon } from 'lucide-react';
import WorkspaceFlow from './WorkspaceFlow';
import { FileUploadHandler, localStorageDataValidation } from '@/lib/utils';

const Workspace = () => {
  const uploadedData = localStorage.getItem('parsed-ics');
  const [selectedDate, setSelectedDate] = useState(null);

  const { grouped, availableDates } = useMemo(() => {
    if (!uploadedData) return { grouped: {}, availableDates: [] };

    const parsedJson = JSON.parse(uploadedData);

    //extract array of objects
    if (!Array.isArray(parsedJson) || !parsedJson[0]?.data?.events) {
      return { grouped: {}, availableDates: [] };
    }
    const grouped = groupEventsByDate(parsedJson[0].data.events);
    
    const availableDates = Object.keys(grouped).sort();
    return { grouped, availableDates };
  }, [uploadedData]);
  const [collapsed, setCollapsed] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const flowRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState('default');

  const handleFileUploadClick = () => fileInputRef.current?.click();

    const dayEvents = grouped[selectedDate].sort((a, b) => a.start - b.start);
    const nodes = [];
    const edges = [];

    for (let i = 0; i < dayEvents.length; i++) {
      const e = dayEvents[i];
      nodes.push({
        id: e.id,
        type: 'bubble',
        data: { label: e.summary, start: e.start, end: e.end },
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
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.ics')) {
      alert('Please select a valid .ics file.');
      return;
    }

    setIsUploading(true);
    await FileUploadHandler(file);
    const data = localStorage.getItem('parsed-ics');
    localStorageDataValidation(data);
    setIsUploading(false);
  };

  const handleCreateClick = () => {
    setShowModal(true);
  };

  const handleCreateSubmit = () => {
    if (newNodeLabel.trim()) {
      flowRef.current?.addNode({ label: newNodeLabel.trim(), type: newNodeType });
      setNewNodeLabel('');
      setNewNodeType('default');
      setShowModal(false);
    }
  };

  return (
    <div className="flex h-[90vh] bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className={`transition-all duration-500 ${collapsed ? 'w-16' : 'w-64'} bg-gray-800 p-4 shadow-lg flex flex-col overflow-hidden`}>
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} mb-6`}>
          <button className="text-yellow-400 hover:text-white" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuIcon size={24} /> : <ArrowLeftIcon size={24} />}
          </button>
        </div>

        <ul className="space-y-2">
          <li className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-all hover:bg-yellow-500 hover:text-black ${isUploading ? 'opacity-50 pointer-events-none' : ''} ${collapsed ? 'justify-center' : ''}`} onClick={handleFileUploadClick}>
            <div className="w-10 h-10 flex items-center justify-center shrink-0"><UploadIcon size={24} /></div>
            {!collapsed && <span className="ml-2">{isUploading ? 'Uploading...' : 'Upload'}</span>}
          </li>

          <li className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-all hover:bg-yellow-500 hover:text-black ${collapsed ? 'justify-center' : ''}`} onClick={handleCreateClick}>
            <div className="w-10 h-10 flex items-center justify-center shrink-0"><PlusIcon size={24} /></div>
            {!collapsed && <span className="ml-2">Create</span>}
          </li>
        </ul>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 h-full relative">
        <WorkspaceFlow ref={flowRef} />
        <input type="file" accept=".ics" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {/* Modal */}
        {showModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded-lg shadow-xl w-96">
              <h2 className="text-xl font-bold mb-4">Create a New Node</h2>
              <input
                type="text"
                placeholder="Enter node label"
                className="w-full border p-2 rounded mb-4"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
              />
              <label className="block mb-2 font-semibold">Type:</label>
              <select
                value={newNodeType}
                onChange={(e) => setNewNodeType(e.target.value)}
                className="w-full border p-2 rounded mb-4"
              >
                <option value="default">Default</option>
                <option value="important">Important</option>
                <option value="optional">Optional</option>
              </select>

              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleCreateSubmit}>Create</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Workspace;