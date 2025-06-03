import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ListSidebar } from './ListSidebar';

export function Layout() {
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600">Tasky</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Meine Aufgaben heute
          </Link>
        </nav>
        
        <div className="flex-1 overflow-y-auto">
          <ListSidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
