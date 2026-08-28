import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookPlus,
  RotateCcw,
  CalendarCheck,
  Receipt,
  Grid,
  UserCheck,
  BarChart3,
  Settings,
  HelpCircle,
  BookMarked,
  LogOut,
  ChevronDown,
  Package,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Books', path: '/books', icon: BookOpen },
  { name: 'Members', path: '/members', icon: Users, adminOnly: true },
  { name: 'Issue Books', path: '/issue-books', icon: BookPlus, adminOnly: true },
  { name: 'Returns', path: '/returns', icon: RotateCcw },
  { name: 'Reservations', path: '/reservations', icon: CalendarCheck },
  { name: 'Fine Management', path: '/fines', icon: Receipt },
  { name: 'Categories', path: '/categories', icon: Grid, adminOnly: true },
  { name: 'Authors', path: '/authors', icon: UserCheck, adminOnly: true },
  { name: 'Reports', path: '/reports', icon: BarChart3, adminOnly: true },
  { name: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
  { name: 'Help & Support', path: '/help', icon: HelpCircle },
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b1739] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Top Logo Section */}
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
          <div className="bg-[#FF6B00] text-white p-2 rounded-xl shadow-lg shadow-orange-900/40">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight leading-none">
              Library
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">
              Management System
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.filter(item => !(item.adminOnly && user?.role === 'Member')).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
              }
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/50"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Librarian'}
              </p>
              <p className="text-xs text-slate-400 capitalize truncate">
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
