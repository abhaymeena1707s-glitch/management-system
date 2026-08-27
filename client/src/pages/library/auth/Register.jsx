import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, BookOpen, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('Member'); // 'Member' or 'Librarian'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    membershipType: 'Student',
    department: 'Computer Science',
    course: 'BCA',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please check again.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: role === 'Librarian' ? 'Librarian' : 'Member',
      membershipType: formData.membershipType,
      department: formData.department,
      course: formData.course,
    });
    setLoading(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex flex-col items-center justify-center p-4 py-8">
      {/* Top Portal Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#FF6B00] text-center tracking-tight mb-4">
        Library Management Portal
      </h1>

      <div className="w-full max-w-lg bg-white rounded-[32px] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-5">
        {/* Header Greeting */}
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Join the library system to borrow books, view digital ID cards, & manage reservations.
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="bg-[#F0F3F8] p-1.5 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRole('Member')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              role === 'Member'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Member / Student
          </button>
          <button
            type="button"
            onClick={() => setRole('Librarian')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              role === 'Librarian'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Librarian / Staff
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          {/* Full Name */}
          <div>
            <label className="block mb-1.5 font-bold text-slate-700">Full Name *</label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
            </div>
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700">Email Address *</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-700">Mobile Phone *</label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>
          </div>

          {/* Conditional Member Fields */}
          {role === 'Member' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-2xl">
              <div>
                <label className="block mb-1 font-bold text-[#B33600]">Type</label>
                <select
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-orange-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-[#B33600]">Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-orange-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="BCA">BCA</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-[#B33600]">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-orange-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Computer Science">Comp Sci</option>
                  <option value="Information Tech">IT</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Management">Management</option>
                  <option value="General Science">General</option>
                </select>
              </div>
            </div>
          )}

          {/* Password & Confirm Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700">Password *</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            <div>
              <label className="block mb-1.5 font-bold text-slate-700">Confirm Password *</label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-[#F3F5F9] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FA5A00] hover:from-[#E56000] hover:to-[#F55000] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Create Account & Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6B00] font-extrabold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
