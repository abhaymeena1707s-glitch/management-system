import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    libraryName: 'Library Management System',
    maxBorrowLimit: 5,
    defaultBorrowDays: 7,
    fineRatePerDay: 5,
    currencySymbol: '₹',
    fineBlockingThreshold: 500,
    contactEmail: 'admin@library.com',
    contactPhone: '+91 98765 43210',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        toast.success('System configuration saved successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Configure default borrowing limits, daily fine rates, currency formatting, and organization details.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading settings...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#FF6B00]" />
              General Library Rules
            </h2>
            {user?.role !== 'Admin' && (
              <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Read-only mode (Admin required to edit)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
            <div>
              <label className="block mb-1 font-semibold text-slate-800">Library System Name</label>
              <input
                type="text"
                disabled={user?.role !== 'Admin'}
                value={settings.libraryName}
                onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-800">Currency Symbol</label>
              <input
                type="text"
                disabled={user?.role !== 'Admin'}
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-800">Max Borrow Limit Per Member</label>
              <input
                type="number"
                min="1"
                disabled={user?.role !== 'Admin'}
                value={settings.maxBorrowLimit}
                onChange={(e) => setSettings({ ...settings, maxBorrowLimit: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-800">Default Borrow Duration (Days)</label>
              <input
                type="number"
                min="1"
                disabled={user?.role !== 'Admin'}
                value={settings.defaultBorrowDays}
                onChange={(e) => setSettings({ ...settings, defaultBorrowDays: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-800">Overdue Fine Rate (Per Day)</label>
              <input
                type="number"
                min="0"
                disabled={user?.role !== 'Admin'}
                value={settings.fineRatePerDay}
                onChange={(e) => setSettings({ ...settings, fineRatePerDay: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-800">Fine Blocking Threshold</label>
              <input
                type="number"
                min="0"
                disabled={user?.role !== 'Admin'}
                value={settings.fineBlockingThreshold}
                onChange={(e) => setSettings({ ...settings, fineBlockingThreshold: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
            <div>
              <label className="block mb-1 font-semibold text-slate-800">Support Contact Email</label>
              <input
                type="email"
                disabled={user?.role !== 'Admin'}
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-800">Support Phone Number</label>
              <input
                type="text"
                disabled={user?.role !== 'Admin'}
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          {user?.role === 'Admin' && (
            <div className="flex justify-end pt-2 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
