import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = ['#FF6B00', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const TopCategoriesDonutChart = ({ categories = [] }) => {
  const navigate = useNavigate();

  // Fallback demo categories matching screenshot
  const displayData = categories.length > 0 ? categories : [
    { name: 'Fiction', count: 858, percentage: 35 },
    { name: 'Non-Fiction', count: 612, percentage: 25 },
    { name: 'Science', count: 367, percentage: 15 },
    { name: 'Technology', count: 245, percentage: 10 },
    { name: 'Others', count: 368, percentage: 15 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-lg">Top Categories</h3>
        <button
          onClick={() => navigate('/categories')}
          className="text-xs font-bold text-[#FF6B00] hover:text-[#E56000] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        {/* Recharts Pie Donut */}
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={4}
                dataKey="count"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} books`, name]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Legend List */}
        <div className="space-y-3">
          {displayData.map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                ></span>
                <span className="font-semibold text-slate-700">{cat.name}</span>
              </div>
              <span className="font-bold text-slate-800">
                {cat.percentage}% <span className="text-slate-400 font-normal">({cat.count})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
