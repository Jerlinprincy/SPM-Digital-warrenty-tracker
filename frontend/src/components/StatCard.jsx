import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  subtitle,
  linkTo,
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-200',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'hover:border-red-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-200',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  const content = (
    <div className={`p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border} relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${scheme.bg} ${scheme.text} transition-transform group-hover:scale-110`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {linkTo && (
          <span className="text-xs text-slate-400 group-hover:text-indigo-600 flex items-center transition-colors">
            View <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}
