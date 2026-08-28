import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully! Please sign in.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B00] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 font-medium">Set a new strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block mb-1.5 font-bold text-slate-700">New Password</label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-slate-700">Confirm New Password</label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FA5A00] hover:from-[#E56000] hover:to-[#F55000] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
