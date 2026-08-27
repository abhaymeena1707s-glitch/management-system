import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoverImageUrl } from '../../utils/googleDriveUtils';

export const RecentlyIssuedBooksTable = ({ transactions = [], onReturnBook }) => {
  const navigate = useNavigate();

  // Fallback demo items matching screenshot if loading
  const displayItems = transactions.length > 0 ? transactions : [
    {
      _id: '1',
      bookId: {
        title: 'The Alchemist',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      },
      memberId: { name: 'Rahul Sharma' },
      issueDate: '2024-05-20',
      dueDate: '2024-05-27',
      status: 'Issued',
    },
    {
      _id: '2',
      bookId: {
        title: 'Rich Dad Poor Dad',
        coverImage: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=400',
      },
      memberId: { name: 'Sneha Patil' },
      issueDate: '2024-05-20',
      dueDate: '2024-05-27',
      status: 'Issued',
    },
    {
      _id: '3',
      bookId: {
        title: 'Atomic Habits',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      },
      memberId: { name: 'Vikram Singh' },
      issueDate: '2024-05-18',
      dueDate: '2024-05-25',
      status: 'Issued',
    },
    {
      _id: '4',
      bookId: {
        title: 'The 5 AM Club',
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
      },
      memberId: { name: 'Pooja Mehta' },
      issueDate: '2024-05-17',
      dueDate: '2024-05-24',
      status: 'Issued',
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-800 text-lg">Recently Issued Books</h3>
        <button
          onClick={() => navigate('/issue-books')}
          className="text-xs font-bold text-[#FF6B00] hover:text-[#E56000] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Book</th>
              <th className="pb-3 px-4">Member</th>
              <th className="pb-3 px-4">Issue Date</th>
              <th className="pb-3 px-4">Due Date</th>
              <th className="pb-3 pl-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {displayItems.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCoverImageUrl(item.bookId?.coverImage)}
                      alt="Book Cover"
                      referrerPolicy="no-referrer"
                      className="w-8 h-11 object-cover rounded-md shadow-sm border border-slate-200"
                    />
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {item.bookId?.title || 'Unknown Book'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600 font-semibold">{item.memberId?.name || 'Unknown Member'}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(item.issueDate)}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(item.dueDate)}</td>
                <td className="py-3 pl-4 text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-100/80 text-emerald-700 font-bold text-[11px] rounded-full">
                    {item.status || 'Issued'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
