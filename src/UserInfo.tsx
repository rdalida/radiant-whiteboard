import React from 'react';
import { useUser } from '@clerk/clerk-react';

const UserInfo: React.FC = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="text-sm text-gray-600">
      Welcome back, {user.firstName || user.username || 'User'}!
    </div>
  );
};

export default UserInfo;
