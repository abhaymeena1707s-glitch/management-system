import React, { useState, useEffect } from 'react';
import { BookPlus, Search, User, BookOpen, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getCoverImageUrl } from '../utils/googleDriveUtils';

export const IssueBooks = () => {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [issuedList, setIssuedList] = useState([]);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [memberDetails, setMemberDetails] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [mRes, bRes, iRes] = await Promise.all([
        api.get('/members?limit=100'),
        api.get('/books?limit=100&availability=available'),
        api.get('/issues?limit=10'),
      ]);
      setMembers(mRes.data.data || []);
      setBooks(bRes.data.data || []);
      setIssuedList(iRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load initial issue form data');
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!selectedMemberId) {
      setMemberDetails(null);
      return;
    }
    const fetchMemberProfile = async () => {
      try {
        const res = await api.get(`/members/${selectedMemberId}`);
        if (res.data.success) {
          setMemberDetails(res.data.data);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchMemberProfile();
  }, [selectedMemberId]);

  useEffect(() => {
    if (!selectedBookId) {
      setBookDetails(null);
      return;
    }
    const b = books.find((x) => x._id === selectedBookId);
    setBookDetails(b || null);
  }, [selectedBookId, books]);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedBookId) {
      toast.error('Please select both Member and Book');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/issues', {
        memberId: selectedMemberId,
        bookId: selectedBookId,
        dueDate,
      });

      if (res.data.success) {
        toast.success(`Book "${res.data.data.bookId?.title}" issued successfully!`);
        setSelectedBookId('');
        setSelectedMemberId('');
        fetchDropdownData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Book System</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Verify member eligibility, check inventory availability, and process instant book issuance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issue Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b pb-3 flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-[#FF6B00]" />
            Issue Transaction Form
          </h2>

          <form onSubmit={handleIssue} className="space-y-5 text-xs font-medium text-slate-700">
            {/* Step 1: Select Member */}
            <div>
              <label className="block mb-1.5 font-bold text-slate-800">1. Select Member *</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full p-3 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
              >
                <option value="">-- Choose Registered Member --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.membershipId}) - {m.membershipType}
                  </option>
                ))}
              </select>
            </div>

            {/* Member Eligibility Banner */}
            {memberDetails && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{memberDetails.name}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      memberDetails.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {memberDetails.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p>Active Borrowings: <span className="font-bold text-slate-800">{memberDetails.activeBorrowCount}</span> / 5</p>
                  <p>Pending Fine: <span className="font-bold text-pink-600">₹{memberDetails.totalPendingFine}</span></p>
                </div>
              </div>
            )}

            {/* Step 2: Select Book */}
            <div>
              <label className="block mb-1.5 font-bold text-slate-800">2. Select Book *</label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-3 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
              >
                <option value="">-- Choose Available Book --</option>
                {books.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title} (ISBN: {b.isbn}) - Copies Available: {b.availableCopies}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Details Banner */}
            {bookDetails && (
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center gap-4 text-xs">
                <img
                  src={getCoverImageUrl(bookDetails.coverImage)}
                  alt="Book Cover"
                  referrerPolicy="no-referrer"
                  className="w-12 h-16 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{bookDetails.title}</h4>
                  <p className="text-slate-500">Shelf: {bookDetails.shelfNumber}</p>
                  <p className="text-emerald-700 font-bold mt-1">Available Copies: {bookDetails.availableCopies}</p>
                </div>
              </div>
            )}

            {/* Step 3: Due Date */}
            <div>
              <label className="block mb-1.5 font-bold text-slate-800">3. Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedMemberId || !selectedBookId}
              className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : 'Complete Issue Transaction'}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Recent Issued List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b pb-3">Recent Issue Activity</h3>

          <div className="space-y-3">
            {issuedList.slice(0, 5).map((item) => (
              <div key={item._id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 text-xs">
                <p className="font-bold text-slate-800 line-clamp-1">{item.bookId?.title}</p>
                <p className="text-slate-500 mt-0.5">To: <span className="font-semibold text-slate-700">{item.memberId?.name}</span></p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Issued: {new Date(item.issueDate).toLocaleDateString()}</span>
                  <span className="font-bold text-emerald-600">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
