
import React, { useState } from 'react';
import { useFirebaseAuth } from './hooks/useAuth';
import { Edit2, Check, X, User, LogOut } from 'lucide-react';
import AuthModal from './components/AuthModal';

interface HeaderProps {
  currentWhiteboardTitle: string;
  onTitleChange: (newTitle: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentWhiteboardTitle, onTitleChange }) => {
  const { user, logout } = useFirebaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentWhiteboardTitle);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
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
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-md hover:bg-gray-100"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Header;
