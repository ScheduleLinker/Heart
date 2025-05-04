/**
 * A file upload button component.
 * This component handles file selection, ensures it's an .ics file, and uploads it.
 *
 * @returns {JSX.Element}
 */
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import { Upload } from "lucide-react";
import { FileUploadHandler, localStorageDataValidation } from "@/lib/utils";


// File Upload Button Component
const FileUploadButton = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".ics")) {
      alert("Please select a valid .ics file.");
      return;
    }

    setIsUploading(true);
    await FileUploadHandler(file);
    const data = localStorage.getItem('parsed-ics');

    localStorageDataValidation(data);

    setIsUploading(false);
    navigate("/workspace");
  };

  return (
    <label
      htmlFor="file-upload"
      className="w-64 h-64 flex flex-col items-center justify-center 
               backdrop-blur-xl border-2 border-cyan-500/30
               rounded-3xl cursor-pointer hover:border-transparent
               transition-all duration-300 group relative 
               bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-slate-800/50
               hover:from-yellow-900/30 hover:via-slate-900/60 hover:to-cyan-900/30
               overflow-hidden"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-cyan-400/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

      {/* Upload state overlay */}
      <div className={`absolute inset-0 bg-cyan-500/10 rounded-3xl ${isUploading ? "animate-pulse" : "hidden"}`} />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <Upload
          className={`w-20 h-20 text-yellow-400 ${
            isUploading ? "animate-bounce" : "group-hover:scale-110 group-hover:text-cyan-300"
          } transition-transform duration-300`}
        />
        <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
          {isUploading ? "PROCESSING..." : "UPLOAD"}
        </span>
      </div>

      <input
        id="file-upload"
        data-testid="file-upload-button" 
        type="file"
        className="hidden"
        accept=".ics"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </label>
  );
};

export default FileUploadButton;
