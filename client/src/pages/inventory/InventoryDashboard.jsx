import React, { useState, useEffect } from 'react';
import { Package, Layers, AlertCircle, IndianRupee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 150,
    totalStock: 2450,
    lowStock: 12,
    todaySales: 15230
  });

  const transactions = [
    { id: '#INV-1001', item: 'Laptop Stand', amount: 45000, date: 'Today, 10:30 AM' },
    { id: '#INV-1002', item: 'Mouse', amount: 500, date: 'Today, 11:15 AM' },
    { id: '#INV-1003', item: 'Keyboard', amount: 1000, date: 'Today, 01:20 PM' },
    { id: '#INV-1004', item: 'Headphone', amount: 1500, date: 'Today, 02:45 PM' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Items</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalItems}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <Link to="/inventory/items" className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Stock</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalStock}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <Link to="/inventory/items" className="text-xs text-purple-600 font-medium flex items-center gap-1 hover:underline">
            View Stock <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Low Stock Items</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.lowStock}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <Link to="/inventory/items" className="text-xs text-red-500 font-medium flex items-center gap-1 hover:underline">
            View Items <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today's Sales</p>
              <h3 className="text-3xl font-bold text-gray-800">₹{stats.todaySales.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <Link to="/inventory/billing" className="text-xs text-emerald-600 font-medium flex items-center gap-1 hover:underline">
            View Sales <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart (Placeholder) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Sales Overview</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-gray-600">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between relative px-2">
            {/* Dummy Line Chart SVG */}
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-indigo-500 stroke-current opacity-70">
              <path fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M0 40 L10 35 L20 45 L30 25 L40 30 L50 15 L60 20 L70 5 L80 15 L90 10 L100 2" />
            </svg>
            <div className="w-full flex justify-between absolute bottom-0 left-0 right-0 text-[10px] text-gray-400 border-t border-gray-100 pt-2 px-2">
              <span>01 May</span>
              <span>06 May</span>
              <span>11 May</span>
              <span>16 May</span>
              <span>21 May</span>
              <span>26 May</span>
              <span>31 May</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
            <Link to="/inventory/billing" className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-5">
            {transactions.map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{tx.id}</p>
                    <p className="text-xs text-gray-500">{tx.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">₹{tx.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
