import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from 'lucide-react';

export default function WarrantyBadge({ status, daysRemaining, showDays = true }) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = ShieldOff;
  let text = status || 'No Warranty';

  switch (status) {
    case 'Active':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10';
      Icon = ShieldCheck;
      break;
    case 'Expiring Soon':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10 animate-pulse';
      Icon = ShieldAlert;
      break;
    case 'Expired':
      badgeStyle = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/10';
      Icon = ShieldX;
      break;
    default:
      badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
      Icon = ShieldOff;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
      {showDays && daysRemaining !== null && daysRemaining !== undefined && status !== 'No Warranty' && (
        <span className="opacity-80 font-normal">
          ({daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired'})
        </span>
      )}
    </span>
  );
}
