import React from 'react';
import { Link } from 'react-router-dom';

export const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, to, onClick }) => {
  const content = (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200 flex items-center gap-4 cursor-pointer group hover:-translate-y-1 active:scale-[0.98]">
      <div className={`w-14 h-14 rounded-full ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 tracking-wide group-hover:text-[#FF6B00] transition-colors">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">{value}</h3>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block no-underline focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 rounded-2xl">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 rounded-2xl">
        {content}
      </button>
    );
  }

  return content;
};

