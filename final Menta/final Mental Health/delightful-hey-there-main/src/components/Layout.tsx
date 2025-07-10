import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation will stay fixed at the top */}
      <header className="sticky top-0 z-50 w-full">
        <Navigation />
      </header>
      
      {/* Main content area that will change with routes */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Add footer here if needed */}
    </div>
  );
};

export default Layout;
