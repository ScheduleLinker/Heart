import React, { useRef, useState } from 'react';
import { UploadIcon, PlusIcon, MenuIcon, ArrowLeftIcon } from 'lucide-react';
import WorkspaceFlow from './WorkspaceFlow';
import { FileUploadHandler, localStorageDataValidation } from '@/lib/utils';

const Workspace = () => {
  const [collapsed, setCollapsed] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const flowRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState('default');

  const handleFileUploadClick = () => fileInputRef.current?.click();

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
