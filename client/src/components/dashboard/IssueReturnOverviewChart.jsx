import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const IssueReturnOverviewChart = ({ data = [] }) => {
  const [filter, setFilter] = useState('This Month');

  // Fallback visual data matching screenshot if API data array is loading
  const chartData = data.length > 0 ? data : [
    { date: '1 May', issued: 28, returned: 15 },
    { date: '5 May', issued: 42, returned: 26 },
    { date: '10 May', issued: 55, returned: 28 },
    { date: '15 May', issued: 78, returned: 36 },
    { date: '20 May', issued: 65, returned: 42 },
    { date: '25 May', issued: 48, returned: 88 },
    { date: '30 May', issued: 75, returned: 45 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Issue & Return Overview</h3>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#FF6B00] rounded-full"></span>
              <span className="text-xs font-semibold text-slate-600">Books Issued</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
              <span className="text-xs font-semibold text-slate-600">Books Returned</span>
            </div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs font-semibold text-slate-600 bg-[#F3F5F9] border border-slate-200/80 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="issued"
              stroke="#FF6B00"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIssued)"
              dot={{ r: 4, fill: '#FF6B00', strokeWidth: 2, stroke: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="returned"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReturned)"
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
