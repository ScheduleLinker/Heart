// WorkspaceSwitcher.tsx
import React, { useState } from 'react';
import Workspace from './Workspace';
import AdvancedWorkSpace from './AdvancedWorkSpace';
import { Button } from '@/components/ui/button';

const WorkspaceSwitcher = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={isAdvanced ? 'outline' : 'default'}
          onClick={() => setIsAdvanced(false)}
        >
          Default View
        </Button>
        <Button
          variant={isAdvanced ? 'default' : 'outline'}
          onClick={() => setIsAdvanced(true)}
        >
          Advanced View
        </Button>
      </div>

      {isAdvanced ? <AdvancedWorkSpace /> : <Workspace />}
    </div>
  );
};

export default WorkspaceSwitcher;
