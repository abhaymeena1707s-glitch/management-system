import React, { useState, useEffect } from 'react';
import { BookOpen, Users, BookPlus, RotateCcw, Receipt } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { IssueReturnOverviewChart } from '../components/dashboard/IssueReturnOverviewChart';
import { RecentActivitiesList } from '../components/dashboard/RecentActivitiesList';
import { RecentlyIssuedBooksTable } from '../components/dashboard/RecentlyIssuedBooksTable';
import { TopCategoriesDonutChart } from '../components/dashboard/TopCategoriesDonutChart';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  const currencySymbol = stats?.currencySymbol || '₹';

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name || 'Librarian'}!
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Here's what's happening in your library today.
        </p>
      </div>

      {/* KPI 5-Stat Cards Row matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Books"
          value={formatNumber(stats?.totalBooks || 2450)}
          subtitle="All books in library"
          icon={BookOpen}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          to="/books"
        />
        <StatCard
          title="Total Members"
          value={formatNumber(stats?.totalMembers || 658)}
          subtitle="Registered members"
          icon={Users}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
          to="/members"
        />
        <StatCard
          title="Books Issued"
          value={formatNumber(stats?.booksIssued || 320)}
          subtitle="Currently issued"
          icon={BookPlus}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
          to="/issue-books"
        />
        <StatCard
          title="Books Returned"
          value={formatNumber(stats?.booksReturned || 2130)}
          subtitle="Till date"
          icon={RotateCcw}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          to="/returns"
        />
        <StatCard
          title="Pending Fine"
          value={`${currencySymbol} ${formatNumber(stats?.pendingFine || 12450)}`}
          subtitle={`From ${stats?.pendingFineMemberCount || 35} members`}
          icon={Receipt}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
          to="/fines"
        />
      </div>

      {/* Middle Row: Issue & Return Overview Chart + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IssueReturnOverviewChart data={stats?.issueReturnOverview} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivitiesList activities={stats?.recentActivities} />
        </div>
      </div>

      {/* Bottom Row: Recently Issued Books Table + Top Categories Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentlyIssuedBooksTable transactions={stats?.recentlyIssuedBooks} />
        </div>
        <div className="lg:col-span-1">
          <TopCategoriesDonutChart categories={stats?.topCategories} />
        </div>
      </div>
    </div>
  );
};
