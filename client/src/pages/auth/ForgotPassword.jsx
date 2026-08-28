import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Password reset instructions sent to email');
  };

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B00] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-sm">Reset Link Sent</h4>
            <p className="text-xs text-emerald-700">Check your inbox ({email}) for instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700">Email Address</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="joedoe75@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FA5A00] hover:from-[#E56000] hover:to-[#F55000] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
