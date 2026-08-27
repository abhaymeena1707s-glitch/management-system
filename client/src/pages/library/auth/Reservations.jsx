import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    bookId: '',
    memberId: '',
  });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      let query = '/reservations';
      if (statusFilter) query += `?status=${statusFilter}`;
      const res = await api.get(query);
      if (res.data.success) {
        setReservations(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        api.get('/books?limit=100'),
        api.get('/members?limit=100'),
      ]);
      setBooks(bRes.data.data || []);
      setMembers(mRes.data.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchDropdowns();
  }, [statusFilter]);

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/reservations', formData);
      if (res.data.success) {
        toast.success('Reservation created successfully');
        setShowModal(false);
        setFormData({ bookId: '', memberId: '' });
        fetchReservations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create reservation');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/reservations/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Reservation status updated to ${status}`);
        fetchReservations();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Reservations</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage reservation queues, notify members when books become available, and track expirations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Reservation
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Ready">Ready for Pickup</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No reservations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Reserved Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.bookId?.title}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{r.memberId?.name}</p>
                      <p className="text-[10px] text-slate-400">{r.memberId?.membershipId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(r.reservationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 font-bold text-[10px] rounded-full ${
                          r.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : r.status === 'Ready'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.status === 'Completed'
                            ? 'bg-orange-100 text-[#D94400]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'Ready')}
                            className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg"
                          >
                            Mark Ready
                          </button>
                        )}
                        {r.status === 'Ready' && (
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'Completed')}
                            className="px-2.5 py-1 bg-[#FF6B00] text-white text-[11px] font-bold rounded-lg hover:bg-[#E56000]"
                          >
                            Complete
                          </button>
                        )}
                        {['Pending', 'Ready'].includes(r.status) && (
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'Cancelled')}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">New Book Reservation</h3>
            <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Book *</label>
                <select
                  required
                  value={formData.bookId}
                  onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-[#FF6B00]/20"
                >
                  <option value="">Choose Book</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} (Available: {b.availableCopies})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Member *</label>
                <select
                  required
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-[#FF6B00]/20"
                >
                  <option value="">Choose Member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.membershipId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl font-semibold hover:bg-[#E56000]"
                >
                  Reserve Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
