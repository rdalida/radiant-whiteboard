
import React from 'react';
import Toolbar from './Toolbar';
import ClerkAuthButtons from './ClerkAuthButtons';
import UserInfo from './UserInfo';
import { useUser } from '@clerk/clerk-react';

interface HeaderProps {
  activeTool: 'text' | 'rectangle' | 'circle' | 'diamond' | 'pen';
  setActiveTool: React.Dispatch<React.SetStateAction<'text' | 'rectangle' | 'circle' | 'diamond' | 'pen'>>;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTool, 
  setActiveTool
}) => {
  const { isSignedIn } = useUser();

  return (
    <div className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center">
            <span className="text-white text-3xl font-bold select-none">R</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Radiant Notes
          </h1>
        </div>
        <div className="flex-1 flex justify-center">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
        </div>
        <div className="flex items-center justify-end min-w-[120px] space-x-3">
          {isSignedIn && <UserInfo />}
          <ClerkAuthButtons />
        </div>
      </div>
    </div>
  );
};

export default Header;
