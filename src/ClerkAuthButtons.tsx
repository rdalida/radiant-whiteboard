import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const ClerkAuthButtons: React.FC = () => (
  <div className="flex items-center space-x-2">
    <SignedIn>
      <UserButton afterSignOutUrl="/" />
    </SignedIn>
    <SignedOut>
      <SignInButton mode="modal">
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium">
          Sign In
        </button>
      </SignInButton>
    </SignedOut>
  </div>
);

export default ClerkAuthButtons;
