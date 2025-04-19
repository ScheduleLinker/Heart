import { FileUploadHandler, localStorageDataValidation } from '@/lib/utils';
import { ReactNode, useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
  dropPromptText = "Release to Upload"
}: GlobalDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  //navigate to the next screen
  const navigate = useNavigate();

  // When a drag enters, increment the counter and set dragging true
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  // When a drag leaves, decrement the counter. Only remove overlay when counter reaches 0.
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Do nothing else; the overlay is already shown from dragEnter.
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  
    setDragCounter(0);
    setIsDragging(false);
    setError(null);
  
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(file => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        return fileType === 'text/calendar' || fileName.endsWith('.ics');
      });
  
      if (validFiles.length === 0) {
        setError('Only .ics files are allowed');
        setTimeout(() => setError(null), 3000);
        return;
      }
  
      //use `validFiles` directly
      try {
        await FileUploadHandler(validFiles);
  
        const data = localStorage.getItem('parsed-ics');
        localStorageDataValidation(data);
  
        navigate("/workspace");
      } catch (error) {
        console.error("Upload Failed:", error);
        setError("Upload failed. Please try again.");
      }
  
      try {
        e.dataTransfer.clearData();
      } catch (error) {
        console.error("Error clearing drag data:", error);
      }
  
      // Optionally track files in UI
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, []);
  

  // Setup global event listeners on the document body
  useEffect(() => {
    const div = document.body;
    div.addEventListener('dragenter', handleDragEnter);
    div.addEventListener('dragleave', handleDragLeave);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);

    return () => {
      div.removeEventListener('dragenter', handleDragEnter);
      div.removeEventListener('dragleave', handleDragLeave);
      div.removeEventListener('dragover', handleDragOver);
      div.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <>
      {isDragging && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${overlayClassName}`}
        >
          <div className="text-white text-xl font-medium pointer-events-auto">
            {dropPromptText} (.ics only!)
          </div>
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
              <li key={index} className="mb-1">{file.name}</li>
            ))}
          </ul>
          <button
            onClick={() => setFiles([])}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
            data-testid="delete-button"
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}
