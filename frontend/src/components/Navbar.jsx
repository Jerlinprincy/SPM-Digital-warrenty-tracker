import React from 'react';
import { Menu, Shield } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600 hidden sm:block" />
          <span className="text-sm font-semibold text-slate-800">
            Digital Warranty & Service Hub
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-400 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden md:block">
            {user?.name?.split(' ')[0]}
          </span>
        </Link>
      </div>
    </header>
  );
}
