import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookMarked, Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck, KeyRound, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login, sendOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('password');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoOtpCode, setDemoOtpCode] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error('Please enter your Email Address or Member ID first');
      return;
    }

    setOtpSending(true);
    const res = await sendOtp(email);
    setOtpSending(false);

    if (res?.success) {
      setOtpSent(true);
      setCountdown(60);
      if (res.devOtp) {
        setDemoOtpCode(res.devOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (loginType === 'password') {
      const success = await login(email, password);
      setLoading(false);
      if (success) navigate('/');
    } else {
      // OTP mode
      if (!otpSent) {
        setLoading(false);
        await handleSendOtp();
      } else {
        if (!otp) {
          toast.error('Please enter the 6-digit OTP code sent to your email');
          setLoading(false);
          return;
        }
        const success = await loginWithOtp(email, otp);
        setLoading(false);
        if (success) navigate('/');
      }
    }
  };

  const handleQuickLogin = async (type) => {
    setLoading(true);
    if (type === 'admin') {
      setEmail('admin@library.com');
      setPassword('Admin@123');
      const success = await login('admin@library.com', 'Admin@123');
      if (success) navigate('/');
    } else if (type === 'librarian') {
      setEmail('librarian@library.com');
      setPassword('Librarian@123');
      const success = await login('librarian@library.com', 'Librarian@123');
      if (success) navigate('/');
    } else {
      setEmail('LIB-00001');
      setPassword('LIB-00001');
      const success = await login('LIB-00001', 'LIB-00001');
      if (success) navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex flex-col items-center justify-center p-4">
      {/* Top Portal Title matching screenshot */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#FF6B00] text-center tracking-tight mb-6">
        Library Management Portal
      </h1>

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        {/* Header Greeting */}
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">
            Welcome to Library<br />login now!
          </h2>
        </div>

        {/* Tab Toggle Switch matching screenshot */}
        <div className="bg-[#F0F3F8] p-1.5 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setLoginType('password');
              setOtpSent(false);
              setOtp('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
              loginType === 'password'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setLoginType('otp')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
              loginType === 'otp'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Email OTP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Email / Member ID</label>
              {loginType === 'otp' && otpSent && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OTP Sent
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                placeholder="joedoe75@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (otpSent) setOtpSent(false);
                }}
                className="w-full pl-10 pr-24 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />

              {loginType === 'otp' && (
                <button
                  type="button"
                  disabled={otpSending || countdown > 0 || !email}
                  onClick={handleSendOtp}
                  className="absolute right-2 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-[11px] rounded-xl transition disabled:opacity-50 flex items-center gap-1 shadow-sm"
                >
                  {otpSending ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : otpSent ? (
                    'Resend'
                  ) : (
                    'Send OTP'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Password Mode Field */}
          {loginType === 'password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[#FF6B00] font-bold text-xs hover:underline">
                  Forget password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={loginType === 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Email OTP Mode Fields */}
          {loginType === 'otp' && (
            <div>
              <label className="block mb-1.5 font-bold text-slate-700">Enter 6-Digit OTP Code</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={6}
                  required={loginType === 'otp'}
                  placeholder="e.g. 584920"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-base font-mono font-bold tracking-widest text-slate-800 placeholder:text-slate-400 placeholder:font-sans placeholder:text-xs placeholder:tracking-normal"
                />
                <KeyRound className="w-4 h-4 text-[#FF6B00] absolute left-3.5" />
              </div>

              {/* Status Banner */}
              {otpSent ? (
                <div className="mt-2.5 p-3 bg-orange-50/80 border border-orange-100 rounded-2xl text-[11px] text-[#B33600] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    📩 OTP Sent to Email
                  </p>
                  <p className="text-slate-600">
                    Check your email inbox or spam folder for the 6-digit code. Valid for 10 minutes.
                  </p>
                  {demoOtpCode && (
                    <p className="pt-1 font-mono font-bold text-[#FF6B00] border-t border-orange-200/60 mt-1">
                      Demo OTP Code: <span className="bg-white px-2 py-0.5 rounded-lg border border-orange-300">{demoOtpCode}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Click <span className="font-bold text-[#FF6B00]">"Send OTP"</span> above to receive a 6-digit verification code on your email.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otpSending}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FA5A00] hover:from-[#E56000] hover:to-[#F55000] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading
              ? 'Authenticating...'
              : loginType === 'otp'
              ? otpSent
                ? 'Verify OTP & Login'
                : 'Send OTP to Email'
              : 'Login'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Divider & Quick Demo Login */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            OR SIGN IN WITH QUICK DEMO
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#F3F5F9] hover:bg-orange-50 hover:text-[#FF6B00] text-slate-700 font-bold text-xs rounded-2xl transition shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('librarian')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#F3F5F9] hover:bg-orange-50 hover:text-[#FF6B00] text-slate-700 font-bold text-xs rounded-2xl transition shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-[#FF6B00]" />
              Librarian
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('member')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#F3F5F9] hover:bg-orange-50 hover:text-[#FF6B00] text-slate-700 font-bold text-xs rounded-2xl transition shadow-sm"
            >
              <BookMarked className="w-4 h-4 text-[#FF6B00]" />
              Member
            </button>
          </div>
        </div>

        {/* Footer Signup Link */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#FF6B00] font-extrabold hover:underline">
              Sign Up / Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};


