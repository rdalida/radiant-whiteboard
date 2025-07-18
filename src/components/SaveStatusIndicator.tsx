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
          icon: <Loader2 size={14} className="animate-spin" />,
          text: 'Saving...',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'saved':
        return {
          icon: <CheckCircle size={14} />,
          text: 'Saved',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle size={14} />,
          text: 'Save failed',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'idle':
      default:
        return {
          icon: <Clock size={14} />,
          text: 'Auto-save enabled',
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border ${config.bgColor} ${config.borderColor} transition-all duration-200`}>
      <div className={config.textColor}>
        {config.icon}
      </div>
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};

export default SaveStatusIndicator;
