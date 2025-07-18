import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { SaveStatus } from '../hooks/useAutoSave';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  isSignedIn: boolean;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, isSignedIn }) => {
  // Don't show anything if user is not signed in
  if (!isSignedIn) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 size={16} className="animate-spin" />,
          color: 'text-blue-600',
          title: 'Saving...'
        };
      case 'saved':
        return {
          icon: <CheckCircle size={16} className="animate-pulse" />,
          color: 'text-green-600',
          title: 'Saved'
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} className="animate-bounce" />,
          color: 'text-red-600',
          title: 'Save failed'
        };
      case 'idle':
      default:
        return {
          icon: <Clock size={16} />,
          color: 'text-gray-400',
          title: 'Auto-save enabled'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${config.color} hover:bg-gray-50`}
      title={config.title}
    >
      {config.icon}
    </div>
  );
};

export default SaveStatusIndicator;
