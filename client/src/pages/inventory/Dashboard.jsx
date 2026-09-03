import { useState, useEffect, useContext } from 'react';
import { Package, Archive, AlertCircle, DollarSign, Laptop } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import SalesChart from '../../components/dashboard/SalesChart';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user: admin } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    lowStockItems: 0,
    todaysSales: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, salesRes, transactionsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/sales'),
          api.get('/dashboard/recent-transactions'),
        ]);

        setStats(statsRes.data);
        setSalesData(salesRes.data.reverse()); // Reverse if needed to show chronological order
        setRecentTransactions(transactionsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {admin?.username || 'Admin'} 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          to="/inventory/items"
        />
        <StatCard
          title="Total Stock"
          value={stats.totalStock}
          icon={Archive}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          to="/inventory/items"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertCircle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          to="/inventory/reports"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todaysSales)}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          to="/inventory/billing"
        />
      </div>

      {/* Quick Categories Grid */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Category"
            value="Laptops"
            icon={Laptop}
            iconBg="bg-gray-100"
            iconColor="text-gray-900"
          />
          {/* We can add more categories here later */}
        </div>
      </div>

      {/* Charts & Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-8">
        {/* Sales Overview */}
        <div className="col-span-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Sales Overview</h2>
            <select className="rounded-md border border-gray-300 text-sm py-1.5 pl-3 pr-8 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>Last 7 Days</option>
              {/* <option>This Month</option> */}
              {/* <option>Last Month</option> */}
            </select>
          </div>
          <SalesChart data={salesData} />
        </div>

        {/* Recent Transactions */}
        <div className="col-span-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <a href="/billing" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View All
            </a>
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
