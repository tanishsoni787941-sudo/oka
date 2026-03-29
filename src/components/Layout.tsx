import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, MessageSquare, Users, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

const Layout = () => {
  const { appUser, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = appUser?.role === 'admin';

  const navItems = isAdmin ? [
    { name: 'User Management', path: '/admin', icon: Users },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  ] : [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Contact Us', path: '/contact', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <ShieldAlert className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-bold text-gray-900">
            {isAdmin ? 'Admin Panel' : 'User Portal'}
          </span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-indigo-700" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {appUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{appUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{appUser?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
