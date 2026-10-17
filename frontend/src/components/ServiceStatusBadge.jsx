import React from 'react';
import { Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function ServiceStatusBadge({ status, isOverdue = false }) {
  if (isOverdue && status === 'Scheduled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
        <AlertCircle className="w-3.5 h-3.5" />
        Overdue
      </span>
    );
  }

  switch (status) {
    case 'Scheduled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Calendar className="w-3.5 h-3.5" />
          Scheduled
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {status}
        </span>
      );
  }
}
