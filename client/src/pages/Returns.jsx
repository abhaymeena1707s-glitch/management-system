import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getCoverImageUrl } from '../utils/googleDriveUtils';

export const Returns = () => {
  const [activeIssues, setActiveIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchActiveIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues?status=Issued&limit=50');
      if (res.data.success) {
        setActiveIssues(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load active transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveIssues();
  }, []);

  const handleReturn = async (transactionId) => {
    setProcessingId(transactionId);
    try {
      const res = await api.post('/returns', { issueTransactionId: transactionId });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchActiveIssues();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredIssues = activeIssues.filter(
    (i) =>
      i.bookId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.memberId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.memberId?.membershipId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Return Management</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Process book returns, calculate overdue days and fine amounts, and update library stock inventory.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search active issues by book title, member name, or Membership ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
          />
        </div>
      </div>

      {/* Active Issued Books Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading active issue transactions...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No active unreturned books found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-center">Overdue Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredIssues.map((item) => {
                  const now = new Date();
                  const due = new Date(item.dueDate);
                  const isOverdue = now > due;
                  const overdueDays = isOverdue
                    ? Math.ceil(Math.abs(now - due) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getCoverImageUrl(item.bookId?.coverImage)}
                            alt="Cover"
                            referrerPolicy="no-referrer"
                            className="w-8 h-11 object-cover rounded-md shadow-sm border border-slate-200"
                          />
                          <span className="font-semibold text-slate-800">{item.bookId?.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{item.memberId?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.memberId?.membershipId}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOverdue ? (
                          <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 font-bold text-[10px] rounded-full">
                            Overdue ({overdueDays} days)
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-full">
                            On Time
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          disabled={processingId === item._id}
                          onClick={() => handleReturn(item._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Process Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
