import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  RefreshCw,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate, fromNow } from '../utils/dateUtils';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerCheck,
    loading,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    if (type.includes('warranty')) {
      return <ShieldAlert className="w-5 h-5 text-amber-500" />;
    }
    if (type.includes('service')) {
      return <Calendar className="w-5 h-5 text-blue-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated alerts for expiring product warranties and service appointments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerCheck}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Scan Reminders</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-colors border border-indigo-200"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`py-1.5 px-3 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`py-1.5 px-3 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
          description="When your warranties approach their 30, 7, or 1-day milestones, or when maintenance is scheduled, automated reminders will show here."
          actionText={filter === 'unread' ? 'Show All Notifications' : null}
          onAction={filter === 'unread' ? () => setFilter('all') : null}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 transition-colors flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold ${
                        !n.isRead ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    {formatDate(n.createdAt, 'MMM D, YYYY [at] h:mm A')} ({fromNow(n.createdAt)})
                  </p>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
