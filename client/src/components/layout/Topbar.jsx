import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Calendar, ChevronDown, LogOut, BookOpen, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export const Topbar = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ books: [], members: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Debounced search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ books: [], members: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [booksRes, membersRes] = await Promise.all([
          api.get(`/books?search=${encodeURIComponent(searchQuery)}&limit=4`),
          api.get(`/members?search=${encodeURIComponent(searchQuery)}&limit=4`),
        ]);

        setSearchResults({
          books: booksRes.data.data || [],
          members: membersRes.data.data || [],
        });
      } catch (err) {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Date String Formatting matching screenshot "20 May 2024 Monday"
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'long',
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Left side: Hamburger & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobile}
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for books, members..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchModal(true);
              }}
              onFocus={() => setShowSearchModal(true)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F3F5F9] border border-slate-200/80 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchModal(false);
                }}
                className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown Modal */}
          {showSearchModal && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="py-6 text-center text-sm text-slate-500">Searching...</div>
              ) : (
                <div className="space-y-4">
                  {/* Books Results */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Books
                    </p>
                    {searchResults.books.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No books found</p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.books.map((b) => (
                          <div
                            key={b._id}
                            onClick={() => {
                              navigate('/books');
                              setShowSearchModal(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/60 cursor-pointer transition"
                          >
                            <BookOpen className="w-4 h-4 text-[#FF6B00]" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{b.title}</p>
                              <p className="text-xs text-slate-400">ISBN: {b.isbn}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Members Results */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Members
                    </p>
                    {searchResults.members.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No members found</p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.members.map((m) => (
                          <div
                            key={m._id}
                            onClick={() => {
                              navigate('/members');
                              setShowSearchModal(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition"
                          >
                            <User className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{m.name}</p>
                              <p className="text-xs text-slate-400">ID: {m.membershipId}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Notifications, Date Widget, User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h4 className="font-semibold text-sm text-slate-800">Notifications</h4>
                <span className="text-xs text-[#FF6B00] font-medium cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 text-xs">
                  <p className="font-semibold text-slate-800">Book Overdue Warning</p>
                  <p className="text-slate-600 mt-0.5">3 member transactions are overdue today.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <p className="font-semibold text-slate-800">New Registration</p>
                  <p className="text-slate-600 mt-0.5">Amit Kumar registered as new student member.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                  <p className="font-semibold text-slate-800">Reservation Ready</p>
                  <p className="text-slate-600 mt-0.5">"The Alchemist" ready for collection.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date Display Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">{formattedDate}</span>
        </div>

        {/* User Profile Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition"
          >
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
              }
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FF6B00]/30"
            />
            <span className="text-sm font-semibold text-slate-700 hidden md:block">
              {user?.name || 'Librarian'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                Settings & Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium transition flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
