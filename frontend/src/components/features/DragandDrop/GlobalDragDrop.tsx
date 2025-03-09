import { FileUploadHandler } from '@/lib/utils';
import { ReactNode, useState, useCallback, useEffect } from 'react';
interface GlobalDragDropProps {
  children: ReactNode;
  showFileList?: boolean;
  overlayClassName?: string;
  dropPromptText?: string;
}

export default function GlobalDragDrop({
  children,
  showFileList = false,
  overlayClassName = "bg-void-900 bg-opacity-70 border-2 border-dashed border-blue-400",
  dropPromptText = "Drop file(s) here"
}: GlobalDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle drag events
  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Filter for .ics only
      const validFiles = droppedFiles.filter(file => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        return fileType === 'text/calendar' || fileName.endsWith('.ics');
      });
      
      if (validFiles.length === 0) {
        setError('Only .ics files are allowed');
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
        return;
      }
      
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      
      // Call the onFilesDropped callback if provided
      FileUploadHandler(validFiles);
      
      e.dataTransfer.clearData();
    }
  },[]);

  // Set up event listeners
  useEffect(() => {
    const div = document.body;
    
    div.addEventListener('dragenter', handleDragIn);
    div.addEventListener('dragleave', handleDragOut);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);
    
    return () => {
      div.removeEventListener('dragenter', handleDragIn);
      div.removeEventListener('dragleave', handleDragOut);
      div.removeEventListener('dragover', handleDragOver);
      div.removeEventListener('drop', handleDrop);
    };
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  return (
    <>
      {isDragging && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${overlayClassName}`}>
          <div className="text-white text-xl font-medium">{dropPromptText} (.ics only)</div>
        </div>
      )}
      
      {children}
      
      {/* Error message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 p-3 rounded-lg text-white z-50 shadow-lg" data-testid="error-message">
          {error}
        </div>
      )}
      
      {/* Optional file list display */}
      {showFileList && files.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-void-800 p-4 rounded-lg text-white z-40 max-w-md" data-testid="files-list">
          <h3 className="font-medium mb-2">Files:</h3>
          <ul className="text-sm">
            {files.map((file, index) => (
              <li key={index} className="mb-1">
                {file.name}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setFiles([])}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
            data-testid="delete-button"
          >
            Delete
          </button>
          <button
            onClick={() => null}
            className="mt-2 px-9 py-1 bg-red-500 text-white rounded text-xs"
            data-testid="delete-button"
          >
            Upload
          </button>
        </div>
      )}
    </>
  );
}