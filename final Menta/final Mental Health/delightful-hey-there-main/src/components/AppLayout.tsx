import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { GeminiChat } from './chat/GeminiChat';

export const AppLayout = () => {
  const location = useLocation();
  
  // Skip layout for auth page
  if (location.pathname === '/auth') {
    return <Outlet />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Persistent Navigation */}
      <Navigation />
      
      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Floating Chat Widget - outside of layout to persist across routes */}
      <div className="fixed bottom-6 right-6 z-50">
        <GeminiChat />
      </div>
    </div>
  );
};

export default AppLayout;
