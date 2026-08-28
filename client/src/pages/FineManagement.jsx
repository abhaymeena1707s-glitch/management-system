import React, { useState, useEffect } from 'react';
import { Receipt, CheckCircle, ShieldOff, DollarSign, Filter } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [summary, setSummary] = useState({ pendingAmount: 0, paidAmount: 0, waivedAmount: 0, currencySymbol: '₹' });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('Pending');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Modal Action States
  const [payingFine, setPayingFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [waivingFine, setWaivingFine] = useState(null);
  const [waiveReason, setWaiveReason] = useState('');

  const fetchFines = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/fines?status=${statusTab}&page=${page}&limit=${pagination.limit}`);
      if (res.data.success) {
        setFines(res.data.data || []);
        setSummary(res.data.summary);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load fine records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines(1);
  }, [statusTab]);

  const handlePay = async () => {
    if (!payingFine) return;
    try {
      const res = await api.put(`/fines/${payingFine._id}/pay`, { paymentMethod });
      if (res.data.success) {
        toast.success('Fine collected successfully!');
        setPayingFine(null);
        fetchFines(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to collect fine');
    }
  };

  const handleWaive = async () => {
    if (!waivingFine || !waiveReason) return;
    try {
      const res = await api.put(`/fines/${waivingFine._id}/waive`, { reason: waiveReason });
      if (res.data.success) {
        toast.success('Fine waived successfully!');
        setWaivingFine(null);
        setWaiveReason('');
        fetchFines(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to waive fine');
    }
  };

  const symbol = summary.currencySymbol || '₹';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fine & Payment Management</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Track overdue penalties, collect fine payments, and manage authorized fine waivers.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Pending Fines</p>
            <h3 className="text-2xl font-bold text-slate-900">{symbol} {summary.pendingAmount?.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Fines Collected</p>
            <h3 className="text-2xl font-bold text-slate-900">{symbol} {summary.paidAmount?.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <ShieldOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Fines Waived</p>
            <h3 className="text-2xl font-bold text-slate-900">{symbol} {summary.waivedAmount?.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Status Tabs & Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 px-6 pt-4 gap-6">
          {['Pending', 'Paid', 'Waived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`pb-3 text-xs font-bold transition border-b-2 ${
                statusTab === tab
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab} Fines
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading fines data...</div>
        ) : fines.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No {statusTab.toLowerCase()} fines found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4 text-center">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {fines.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{f.memberId?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{f.memberId?.membershipId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{f.issueTransactionId?.bookId?.title || 'Book Return'}</td>
                    <td className="py-3 px-4 text-slate-500">{f.reason}</td>
                    <td className="py-3 px-4 text-center font-bold text-pink-600 text-sm">
                      {symbol}{f.amount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 font-bold text-[10px] rounded-full ${
                          f.status === 'Pending'
                            ? 'bg-pink-100 text-pink-700'
                            : f.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {f.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPayingFine(f)}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700"
                          >
                            Collect
                          </button>
                          <button
                            onClick={() => setWaivingFine(f)}
                            className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                          >
                            Waive
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No actions needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect Fine Modal */}
      {payingFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Collect Fine Payment</h3>
            <p className="text-xs text-slate-500">
              Collecting <span className="font-bold text-slate-800">{symbol}{payingFine.amount}</span> fine from{' '}
              <span className="font-bold text-slate-800">{payingFine.memberId?.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs font-medium bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / Online">UPI / Online Transfer</option>
                <option value="Card">Credit / Debit Card</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPayingFine(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handlePay} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Fine Modal */}
      {waivingFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Waive Fine Authorization</h3>
            <p className="text-xs text-slate-500">
              Waiving fine of <span className="font-bold text-slate-800">{symbol}{waivingFine.amount}</span> for{' '}
              <span className="font-bold text-slate-800">{waivingFine.memberId?.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Waiving *</label>
              <input
                type="text"
                required
                placeholder="e.g. Authorized medical exception"
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setWaivingFine(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleWaive} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold">
                Confirm Waiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
