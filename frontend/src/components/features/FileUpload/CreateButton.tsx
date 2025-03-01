import { useState } from 'react';
import { Plus } from 'lucide-react';

const CreateButton = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Simulated creation process
      const result = await new Promise((resolve) => 
        setTimeout(() => resolve({ id: Date.now() }), 800)
      );
      
      console.log('Creation successful:', result);
    } catch (error) {
      console.error('Creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
  <button 
  onClick={handleCreate}
  disabled={isCreating}
  className="w-64 h-64 flex flex-col items-center justify-center 
           backdrop-blur-xl border-2 border-purple-500/30
           rounded-3xl hover:border-transparent
           transition-all duration-300 group relative
           bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-slate-800/50
           hover:from-purple-900/30 hover:via-slate-900/60 hover:to-yellow-900/30
           overflow-hidden"
>
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 via-transparent to-yellow-400/20 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

  {/* Loading state - changed to opacity pulse */}
  <div className={`absolute inset-0 bg-purple-500/10 rounded-3xl 
                 ${isCreating ? 'animate-pulse' : 'hidden'}`} />

  {/* Content container */}
  <div className="relative z-10 flex flex-col items-center space-y-4">
    <Plus className={`flex w-20 h-20 justify-center ${
      isCreating 
        ? 'text-yellow-400' // Changed color during loading
        : 'text-purple-400 group-hover:rotate-90 group-hover:text-purple-300'
    } transition-all duration-300`} />
    
    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
      {isCreating ? 'INITIALIZING...' : 'CREATE'}
    </span>
  </div>
</button>
  );
};

export default CreateButton;