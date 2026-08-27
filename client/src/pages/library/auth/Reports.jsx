import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, BookOpen, Users, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/analytics');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load analytical reports');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!analytics?.overdueBooks) return;
    const headers = ['Book Title', 'ISBN', 'Member Name', 'Membership ID', 'Phone', 'Due Date'];
    const rows = analytics.overdueBooks.map((b) => [
      `"${b.bookId?.title || ''}"`,
      `"${b.bookId?.isbn || ''}"`,
      `"${b.memberId?.name || ''}"`,
      `"${b.memberId?.membershipId || ''}"`,
      `"${b.memberId?.phone || ''}"`,
      `"${new Date(b.dueDate).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Overdue_Books_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Reports & Analytics</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Analytical breakdown of most popular books, active borrowing members, and overdue reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Export Overdue CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Generating analytics reports...</div>
      ) : (
        <div className="space-y-6">
          {/* Top 2 Cards Row: Most Issued Books & Most Active Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Issued Books */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-[#FF6B00] border-b pb-3">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Top 5 Most Borrowed Books</h3>
              </div>
              <div className="space-y-3 text-xs">
                {analytics?.mostIssuedBooks?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-[#D94400] font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{item.book?.title}</p>
                        <p className="text-[10px] text-slate-400">ISBN: {item.book?.isbn}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#FF6B00] bg-orange-50 px-2.5 py-1 rounded-full text-[11px]">
                      {item.issueCount} Issues
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Members */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 border-b pb-3">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Top 5 Active Borrowing Members</h3>
              </div>
              <div className="space-y-3 text-xs">
                {analytics?.activeBorrowers?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{item.member?.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {item.member?.membershipId}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px]">
                      {item.count} Borrowed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overdue Books Detailed Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-red-600 border-b pb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Overdue Books Audit List</h3>
            </div>

            {analytics?.overdueBooks?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No overdue books at this moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Book Title</th>
                      <th className="py-2.5 px-3">Member Name</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {analytics?.overdueBooks?.map((b) => (
                      <tr key={b._id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{b.bookId?.title}</td>
                        <td className="py-2.5 px-3 text-slate-700">{b.memberId?.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{b.memberId?.phone}</td>
                        <td className="py-2.5 px-3 text-red-600 font-semibold">
                          {new Date(b.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
