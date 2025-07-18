
import React, { useState } from 'react';
import ClerkAuthButtons from './ClerkAuthButtons';
import UserInfo from './UserInfo';
import { useUser } from '@clerk/clerk-react';
import { Edit2, Check, X } from 'lucide-react';

interface HeaderProps {
  currentWhiteboardTitle: string;
  onTitleChange: (newTitle: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentWhiteboardTitle, onTitleChange }) => {
  const { isSignedIn } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentWhiteboardTitle);

  const handleStartEdit = () => {
    setEditTitle(currentWhiteboardTitle);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onTitleChange(editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(currentWhiteboardTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3 pl-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center">
            <span className="text-white text-3xl font-bold select-none">R</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Radiant Whiteboard
          </h1>
        </div>
        
        {/* Centered Title Section */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 text-gray-800 px-1"
                  autoFocus
                  onBlur={handleSaveEdit}
                />
                <button
                  onClick={handleSaveEdit}
                  className="text-green-600 hover:text-green-700 p-1"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 group">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentWhiteboardTitle}
                </h2>
                <button
                  onClick={handleStartEdit}
                  className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Edit title"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end min-w-[120px] space-x-3 pr-4">
          {isSignedIn && <UserInfo />}
          <ClerkAuthButtons />
        </div>
      </div>
    </div>
  );
};

export default Header;
