import { ChangeEvent, useState } from 'react';
import { Upload } from 'lucide-react';

const FileUploadButton = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ics')) {
      alert('Please select an .ics file.');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulated API call
      const response = await new Promise((resolve) => 
        setTimeout(() => resolve({ 
          success: true, 
          filename: file.name 
        }), 1000)
      );

      console.log('Upload successful:', response);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
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
  <div className={`absolute inset-0 bg-cyan-500/10 rounded-3xl ${isUploading ? 'animate-pulse' : 'hidden'}`} />
  
  {/* Content container */}
  <div className="relative z-10 flex flex-col items-center space-y-4">
    <Upload className={`w-20 h-20 text-yellow-400 ${
      isUploading ? 'animate-bounce' : 'group-hover:scale-110 group-hover:text-cyan-300'
    } transition-transform duration-300`} />
    
    <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
      {isUploading ? 'PROCESSING...' : 'UPLOAD'}
    </span>
  </div>

  <input 
    id="file-upload" 
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