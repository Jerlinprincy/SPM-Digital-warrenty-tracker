import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Calendar, ShieldCheck, LogOut, CheckCircle, Server } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Profile & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials and system preferences
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 uppercase">
            {user?.name ? user.name.slice(0, 2) : 'US'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" /> Authenticated via Secure JWT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Full Name
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-1 block">
              {user?.name}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-1 block">
              {user?.email}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Member Since
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-1 block">
              {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Access Role
            </span>
            <span className="text-sm font-semibold text-indigo-600 mt-1 block">
              Household Asset Administrator
            </span>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-400">
            <Server className="w-4 h-4" />
            <span>Application Architecture Environment</span>
          </div>
          <p className="text-slate-300">
            Connected to <strong>Node.js / Express backend</strong> with <strong>MongoDB Mongoose ODM</strong>, and background cron scheduler configured for automated daily warranty milestone checks (30, 7, 1 days).
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
