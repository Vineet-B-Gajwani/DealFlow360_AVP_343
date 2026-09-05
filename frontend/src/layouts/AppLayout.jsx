import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuth from '../features/auth/hooks/useAuth';

function AppLayout() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center">
            {/* Mobile menu button could go here */}
            <h2 className="text-lg font-semibold text-slate-200 lg:hidden">
              DealFlow360
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400 hidden sm:inline-block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
