import React from 'react';
import { useAuth } from '@clerk/clerk-react';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded } = useAuth();

  // Show loading spinner while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show the app regardless of sign-in status
  // Authentication is handled by the header component
  return <>{children}</>;
};

export default AuthWrapper;
