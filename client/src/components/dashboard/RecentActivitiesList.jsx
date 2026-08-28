import React from 'react';
import { BookOpen, RotateCcw, UserPlus, Receipt, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getActionIcon = (action) => {
  switch (action) {
    case 'BOOK_ISSUED':
      return { icon: BookOpen, bg: 'bg-emerald-100', color: 'text-emerald-600' };
    case 'BOOK_RETURNED':
      return { icon: RotateCcw, bg: 'bg-amber-100', color: 'text-amber-600' };
    case 'MEMBER_CREATED':
      return { icon: UserPlus, bg: 'bg-purple-100', color: 'text-purple-600' };
    case 'FINE_PAID':
    case 'FINE_CREATED':
      return { icon: Receipt, bg: 'bg-pink-100', color: 'text-pink-600' };
    default:
      return { icon: Bell, bg: 'bg-orange-100', color: 'text-[#FF6B00]' };
  }
};

const formatActionTitle = (action) => {
  switch (action) {
    case 'BOOK_ISSUED':
      return 'Book Issued';
    case 'BOOK_RETURNED':
      return 'Book Returned';
    case 'MEMBER_CREATED':
      return 'New Member';
    case 'FINE_PAID':
      return 'Fine Collected';
    case 'FINE_WAIVED':
      return 'Fine Waived';
    default:
      return 'Activity';
  }
};

export const RecentActivitiesList = ({ activities = [] }) => {
  const navigate = useNavigate();

  // Fallback demo activities matching screenshot
  const displayActivities = activities.length > 0 ? activities : [
    {
      _id: '1',
      action: 'BOOK_ISSUED',
      description: '"The Alchemist" issued to Rahul Sharma',
      createdAt: '2024-05-20T10:30:00Z',
    },
    {
      _id: '2',
      action: 'BOOK_RETURNED',
      description: '"Atomic Habits" returned by Priya Verma',
      createdAt: '2024-05-20T09:45:00Z',
    },
    {
      _id: '3',
      action: 'MEMBER_CREATED',
      description: 'Amit Kumar registered as new member',
      createdAt: '2024-05-19T16:20:00Z',
    },
    {
      _id: '4',
      action: 'FINE_PAID',
      description: '₹150 collected from Neha Singh',
      createdAt: '2024-05-19T14:15:00Z',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-800 text-lg">Recent Activities</h3>
        <button
          onClick={() => navigate('/reports')}
          className="text-xs font-bold text-[#FF6B00] hover:text-[#E56000] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {displayActivities.map((act) => {
          const { icon: Icon, bg, color } = getActionIcon(act.action);
          const dateObj = new Date(act.createdAt);
          const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={act._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{formatActionTitle(act.action)}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{act.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <p className="text-[11px] font-semibold text-slate-600">{dateStr}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{timeStr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
