import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { Download, Filter } from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalBills: 0,
    averageBillValue: 0,
    recentBills: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Using existing endpoints or we can assume a new report endpoint.
        // For simplicity we will fetch recent transactions and calculate basics here.
        const { data } = await api.get('/dashboard/recent-transactions');
        
        const totalSales = data.reduce((acc, curr) => acc + curr.grandTotal, 0);
        
        setReportData({
          totalSales,
          totalBills: data.length,
          averageBillValue: data.length > 0 ? totalSales / data.length : 0,
          recentBills: data,
        });
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Sales and inventory analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <h3 className="mt-2 text-3xl font-bold text-indigo-600">{formatCurrency(reportData.totalSales)}</h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Invoices</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">{reportData.totalBills}</h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Average Value</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(reportData.averageBillValue)}</h3>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <RecentTransactions transactions={reportData.recentBills} />
      </div>
    </div>
  );
};

export default Reports;
