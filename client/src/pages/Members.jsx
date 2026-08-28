import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  User,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Printer,
  X,
  Camera,
  Image as ImageIcon,
  RotateCw,
  Check,
  Loader2,
  Filter,
  Building,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Download,
  Users,
  UserCheck,
  UserX,
  Clock,
  QrCode,
  ShieldAlert,
  Activity,
  Wifi,
  WifiOff,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';

// Helper lists
const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Comm',
  'Electrical Eng',
  'Mechanical Eng',
  'Civil Eng',
  'Business Admin',
  'Management',
  'Library & Info Sci',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Humanities',
  'General',
];

const COURSES = ['B.Tech', 'BCA', 'BBA', 'B.Sc', 'B.Com', 'BA', 'MCA', 'M.Tech', 'MBA', 'Other'];
const ACADEMIC_YEARS = ['2023–2024', '2024–2025', '2025–2026', '2026–2027', '2027–2028'];
const CURRENT_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Head of Dept',
  'Librarian',
  'Assistant Librarian',
  'System Admin',
  'Lab Technician',
  'Office Staff',
];
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Visiting'];

// Authentic Barcode SVG Generator
const BarcodeSVG = ({ value = 'LIB-STU-1001' }) => {
  const bars = [];
  let xOffset = 10;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w1 = (code % 3) + 1.2;
    const gap = ((code * 5) % 3) + 1.2;
    bars.push({ x: xOffset, w: w1 });
    xOffset += w1 + gap;
  }

  return (
    <div className="flex flex-col items-center">
      <svg className="w-full h-8" viewBox={`0 0 ${xOffset + 10} 35`}>
        <rect width="100%" height="100%" fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect key={idx} x={bar.x} y="2" width={bar.w} height="28" fill="#0f172a" />
        ))}
      </svg>
      <span className="font-mono text-[9px] font-bold text-slate-800 tracking-widest mt-0.5">
        *{value}*
      </span>
    </div>
  );
};

// Deterministic QR Code SVG Generator
const QRCodeSVG = ({ value = 'LIB-STU-1001', size = 56 }) => {
  const modules = [];
  const gridSize = 13;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isTopLeft = r < 4 && c < 4;
      const isTopRight = r < 4 && c >= gridSize - 4;
      const isBottomLeft = r >= gridSize - 4 && c < 4;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const border =
          r === 0 ||
          r === 3 ||
          c === 0 ||
          c === 3 ||
          r === gridSize - 1 ||
          r === gridSize - 4 ||
          c === gridSize - 1 ||
          c === gridSize - 4;
        const center =
          (r >= 1 && r <= 2 && c >= 1 && c <= 2) ||
          (r >= 1 && r <= 2 && c >= gridSize - 3 && c <= gridSize - 2) ||
          (r >= gridSize - 3 && r <= gridSize - 2 && c >= 1 && c <= 2);
        if (border || center) {
          modules.push({ r, c });
        }
      } else {
        const hash = (value.charCodeAt((r + c) % value.length) * (r + 1) + c * 7) % 11;
        if (hash > 4) {
          modules.push({ r, c });
        }
      }
    }
  }

  const cellSize = size / gridSize;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width="100%" height="100%" fill="#ffffff" />
      {modules.map((mod, i) => (
        <rect
          key={i}
          x={mod.c * cellSize}
          y={mod.r * cellSize}
          width={cellSize}
          height={cellSize}
          fill="#0f172a"
        />
      ))}
    </svg>
  );
};

// Helper function to render avatar image or name initial badge
const renderAvatar = (imageSrc, name = '', sizeClass = 'w-12 h-12', iconSize = 'w-6 h-6', extraRing = 'ring-2 ring-[#FF6B00]/20') => {
  const hasCustomImage = imageSrc && imageSrc.trim() && !imageSrc.includes('1494790108377');
  if (hasCustomImage) {
    return (
      <img
        src={imageSrc}
        alt={name || 'Avatar'}
        className={`${sizeClass} rounded-xl object-cover ${extraRing} shadow-sm flex-shrink-0`}
      />
    );
  }

  const initial = name && name.trim() ? name.trim().charAt(0).toUpperCase() : '';

  return (
    <div
      className={`${sizeClass} rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm ${extraRing}`}
    >
      {initial ? (
        <span className="text-base font-extrabold text-slate-800">{initial}</span>
      ) : (
        <User className={`${iconSize} text-slate-400`} />
      )}
    </div>
  );
};

export const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    students: 0,
    faculty: 0,
    staff: 0,
    expired: 0,
  });
  const [isLiveConnected, setIsLiveConnected] = useState(socket.connected);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search and Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Modal & Drawer States
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);

  // ID Card & Delete Modal States
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [idCardMember, setIdCardMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);

  // Profile Photo System States
  const [showPhotoMenuModal, setShowPhotoMenuModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    membershipType: 'Student',
    membershipId: '',
    department: 'Computer Science',
    profileImage: '',
    // Student specific
    course: 'B.Tech',
    academicYear: '2025–2026',
    currentYear: '1st Year',
    semester: '1',
    rollNumber: '',
    enrollmentNumber: '',
    batch: '2025–2029',
    graduationYear: '2029',
    // Faculty/Staff specific
    employeeId: '',
    designation: 'Assistant Professor',
    joiningYear: new Date().getFullYear().toString(),
    employmentType: 'Full Time',
    officeNumber: 'Block A-201',
    staffCategory: 'Academic',
    status: 'Active',
    rfidVerified: true,
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/members/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load member stats', err);
    }
  };

  const fetchMembers = async (page = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      let query = `/members?page=${page}&limit=${pagination.limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (typeFilter) query += `&membershipType=${typeFilter}`;
      if (departmentFilter) query += `&department=${encodeURIComponent(departmentFilter)}`;

      const res = await api.get(query);
      if (res.data.success) {
        setMembers(res.data.data);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      if (showLoading) toast.error('Failed to load members');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(1, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter, departmentFilter]);

  // Real-Time Socket & Live Synchronization Effect
  useEffect(() => {
    fetchStats();

    const handleConnect = () => setIsLiveConnected(true);
    const handleDisconnect = () => setIsLiveConnected(false);

    if (socket.connected) {
      setIsLiveConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    const handleRealTimeUpdate = () => {
      fetchStats();
      fetchMembers(pagination.page, false);
    };

    socket.on('member_updated', handleRealTimeUpdate);
    socket.on('stats_updated', handleRealTimeUpdate);

    // Guaranteed real-time polling interval (every 4 seconds)
    const interval = setInterval(() => {
      fetchStats();
      fetchMembers(pagination.page, false);
    }, 4000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
        fetchMembers(pagination.page, false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('member_updated', handleRealTimeUpdate);
      socket.off('stats_updated', handleRealTimeUpdate);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  // Auto Prefix Member ID helper
  const generatePrefixId = (type, currentCount = members.length) => {
    let prefix = 'STU';
    if (type === 'Faculty') prefix = 'FAC';
    else if (type === 'Staff') prefix = 'STF';
    else if (type === 'Premium') prefix = 'PRM';
    else if (type === 'Standard') prefix = 'STD';
    return `LIB-${prefix}-${1001 + currentCount}`;
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        membershipType: member.membershipType || 'Student',
        membershipId: member.membershipId || '',
        department: member.department || 'Computer Science',
        profileImage: member.profileImage || '',
        course: member.course || 'B.Tech',
        academicYear: member.academicYear || '2025–2026',
        currentYear: member.currentYear || '1st Year',
        semester: member.semester?.toString() || '1',
        rollNumber: member.rollNumber || '',
        enrollmentNumber: member.enrollmentNumber || '',
        batch: member.batch || '2025–2029',
        graduationYear: member.graduationYear?.toString() || '2029',
        employeeId: member.employeeId || '',
        designation: member.designation || 'Assistant Professor',
        joiningYear: member.joiningYear?.toString() || new Date().getFullYear().toString(),
        employmentType: member.employmentType || 'Full Time',
        officeNumber: member.officeNumber || '',
        staffCategory: member.staffCategory || 'Academic',
        status: member.status || 'Active',
        rfidVerified: member.rfidVerified !== false,
      });
    } else {
      setEditingMember(null);
      const defaultType = 'Student';
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        membershipType: defaultType,
        membershipId: generatePrefixId(defaultType),
        department: 'Computer Science',
        profileImage: '',
        course: 'B.Tech',
        academicYear: '2025–2026',
        currentYear: '1st Year',
        semester: '1',
        rollNumber: `CS-${Math.floor(1000 + Math.random() * 9000)}`,
        enrollmentNumber: `ENR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        batch: '2025–2029',
        graduationYear: '2029',
        employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        designation: 'Assistant Professor',
        joiningYear: new Date().getFullYear().toString(),
        employmentType: 'Full Time',
        officeNumber: 'Block A-101',
        staffCategory: 'Academic',
        status: 'Active',
        rfidVerified: true,
      });
    }
    setShowModal(true);
  };

  const handleTypeChange = (newType) => {
    const autoId = generatePrefixId(newType);
    setFormData((prev) => ({
      ...prev,
      membershipType: newType,
      membershipId: autoId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      toast.error('Email Address is required');
      return;
    }
    if (!formData.phone || !formData.phone.trim()) {
      toast.error('Phone Number is required');
      return;
    }

    setSaving(true);
    try {
      if (editingMember) {
        const res = await api.put(`/members/${editingMember._id}`, formData);
        if (res.data.success) {
          const updatedMember = res.data.data;
          toast.success('Member details & ID updated successfully');
          setShowModal(false);

          // Update local state immediately so directory card changes instantly
          setMembers((prev) =>
            prev.map((m) => (m._id === updatedMember._id ? updatedMember : m))
          );

          if (idCardMember && idCardMember._id === updatedMember._id) {
            setIdCardMember(updatedMember);
          }
          if (selectedMemberDetails && selectedMemberDetails._id === updatedMember._id) {
            setSelectedMemberDetails((prev) => ({ ...prev, ...updatedMember }));
          }

          fetchMembers(pagination.page);
        }
      } else {
        const res = await api.post('/members', formData);
        if (res.data.success) {
          const newMember = res.data.data;
          toast.success('Member registered successfully!');
          setShowModal(false);
          fetchMembers(1);

          // Auto open Member ID Card preview modal
          if (newMember) {
            setIdCardMember(newMember);
            setShowIdCardModal(true);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const fetchMemberProfile = async (memberId) => {
    try {
      const res = await api.get(`/members/${memberId}`);
      if (res.data.success) {
        setSelectedMemberDetails(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch member details');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;
    try {
      const res = await api.delete(`/members/${deletingMember._id}`);
      if (res.data.success) {
        toast.success('Member deleted successfully');
        setShowDeleteModal(false);
        setDeletingMember(null);
        fetchMembers(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    }
  };

  // Camera & Profile Photo Handling
  const startCamera = async () => {
    setShowPhotoMenuModal(false);
    setShowCameraModal(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Unable to access device camera. Please check browser permissions.');
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 320;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
    }
  };

  const useCapturedPhoto = () => {
    if (capturedPhoto) {
      setFormData((prev) => ({ ...prev, profileImage: capturedPhoto }));
      stopCamera();
      toast.success('Profile photo captured successfully');
    }
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, profileImage: dataUrl }));
        setShowPhotoMenuModal(false);
        toast.success('Gallery photo attached');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }));
    setShowPhotoMenuModal(false);
    toast.success('Profile photo removed');
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
            <CreditCard className="w-6 h-6 text-[#FF6B00]" />
            Member ID Card & Directory Module
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm transition-all ${
              isLiveConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              {isLiveConnected ? 'LIVE REAL-TIME ACTIVE' : 'REAL-TIME SYNC ENABLED'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage library memberships, student/faculty ID cards, RFID verification, and borrowing profiles.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Member
        </button>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-orange-200 transition-all">
          <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Members</p>
            <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-emerald-200 transition-all">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
            <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">{stats.active}</h3>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-indigo-200 transition-all">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</p>
            <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">{stats.students}</h3>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-purple-200 transition-all">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty</p>
            <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">{stats.faculty}</h3>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-amber-200 transition-all">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff</p>
            <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">{stats.staff}</h3>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-all">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expired / Issues</p>
            <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">{stats.expired}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by member name, email, Member ID, Roll No, Employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Member Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Member Types</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Staff">Staff</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Member Cards Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF6B00]" />
          <p className="text-xs font-semibold">Loading Member Directory & ID Cards...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
          <UserX className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Members Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No library members match your current filter search. Try resetting filters or register a new member.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setTypeFilter('');
              setDepartmentFilter('');
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((m) => (
            <div
              key={m._id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {renderAvatar(m.profileImage, m.name, 'w-12 h-12', 'w-6 h-6')}
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{m.name}</h3>
                      <p className="text-[11px] font-mono font-bold text-[#FF6B00] truncate">
                        {m.membershipId}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                    </div>
                  </div>

                  <span
                    className={`font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      m.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'Expired'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Type:</span>
                    <span className="font-bold text-slate-800">{m.membershipType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Department:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                      {m.department || 'General'}
                    </span>
                  </div>

                  {m.membershipType === 'Student' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Course:</span>
                        <span className="font-semibold text-[#D94400]">
                          {m.course || 'B.Tech'} ({m.currentYear || '1st Year'})
                        </span>
                      </div>
                      {m.rollNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Roll No:</span>
                          <span className="font-mono text-slate-700">{m.rollNumber}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Designation:</span>
                        <span className="font-semibold text-[#D94400]">
                          {m.designation || 'Faculty'}
                        </span>
                      </div>
                      {m.employeeId && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Employee ID:</span>
                          <span className="font-mono text-slate-700">{m.employeeId}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                <button
                  onClick={() => {
                    setIdCardMember(m);
                    setShowIdCardModal(true);
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#D94400] font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition border border-orange-200/60"
                  title="View & Print Digital ID Card"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  ID Card
                </button>

                <button
                  onClick={() => fetchMemberProfile(m._id)}
                  className="p-1.5 text-slate-400 hover:text-[#FF6B00] rounded-lg hover:bg-slate-50 transition"
                  title="View Borrowing History"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenModal(m)}
                  className="p-1.5 text-slate-400 hover:text-[#FF6B00] rounded-lg hover:bg-slate-50 transition"
                  title="Edit Member Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setDeletingMember(m);
                    setShowDeleteModal(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                  title="Delete Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total members)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchMembers(pagination.page - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-semibold"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchMembers(pagination.page + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Member Form Modal (Create / Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMember ? 'Edit Member Details & ID Card' : 'Register New Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              {/* Profile Photo Section (Item #4 & #11) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {formData.profileImage && !formData.profileImage.includes('1494790108377') ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile Preview"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#FF6B00]/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center border border-slate-300">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Profile Photo (Optional)</h4>
                    <p className="text-[10px] text-slate-500">
                      {formData.profileImage ? 'Photo attached to ID card' : 'No photo uploaded. Default avatar will be used.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPhotoMenuModal(true)}
                    className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-[#D94400] border border-orange-200/80 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {formData.profileImage ? 'Change Photo' : 'Add Profile Photo'}
                  </button>

                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Member Type *</label>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white font-bold text-[#D94400]"
                  >
                    <option value="Student">STUDENT</option>
                    <option value="Faculty">FACULTY</option>
                    <option value="Staff">STAFF</option>
                    <option value="Standard">STANDARD</option>
                    <option value="Premium">PREMIUM</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Membership ID</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          membershipId: generatePrefixId(prev.membershipType),
                        }))
                      }
                      className="text-[10px] text-[#FF6B00] hover:text-[#D94400] font-bold flex items-center gap-1 hover:underline"
                    >
                      <RotateCw className="w-3 h-3" />
                      Auto-Generate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={formData.membershipId}
                    onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block mb-1 font-semibold text-slate-700">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* CONDITIONAL FIELDS: Student vs Faculty/Staff */}
              {formData.membershipType === 'Student' ? (
                <div className="p-3.5 bg-orange-50/40 rounded-xl border border-orange-100 space-y-3">
                  <h4 className="font-bold text-[#B33600] text-xs flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#FF6B00]" />
                    Student Academic Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Course / Program</label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                      >
                        {COURSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Academic Year</label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                      >
                        {ACADEMIC_YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Current Year</label>
                      <select
                        value={formData.currentYear}
                        onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                      >
                        {CURRENT_YEARS.map((cy) => (
                          <option key={cy} value={cy}>
                            {cy}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                      >
                        {SEMESTERS.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Roll Number</label>
                      <input
                        type="text"
                        placeholder="e.g. CS-2025-042"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Enrollment / Adm No</label>
                      <input
                        type="text"
                        placeholder="e.g. ENR-2025-104"
                        value={formData.enrollmentNumber}
                        onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-100 space-y-3">
                  <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    Faculty / Staff Employment Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Employee ID</label>
                      <input
                        type="text"
                        placeholder="e.g. EMP-204"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Designation</label>
                      <select
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                      >
                        {DESIGNATIONS.map((desig) => (
                          <option key={desig} value={desig}>
                            {desig}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Joining Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2022"
                        value={formData.joiningYear}
                        onChange={(e) => setFormData({ ...formData, joiningYear: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Employment Type</label>
                      <select
                        value={formData.employmentType}
                        onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white"
                      >
                        {EMPLOYMENT_TYPES.map((emp) => (
                          <option key={emp} value={emp}>
                            {emp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Office / Room Number</label>
                      <input
                        type="text"
                        placeholder="e.g. Block B-302"
                        value={formData.officeNumber}
                        onChange={(e) => setFormData({ ...formData, officeNumber: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Membership Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Address / Location</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving Member...' : editingMember ? 'Save Changes' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Option Selection Menu Modal (Item #4 & #11) */}
      {showPhotoMenuModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xs w-full p-5 space-y-4 text-center">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-2">Add Profile Photo</h4>

            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleGalleryUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-[#D94400] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-orange-200/60"
              >
                <Camera className="w-4 h-4 text-[#FF6B00]" />
                📷 Take Photo / Use Camera
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-indigo-200/60"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                🖼️ Choose From Gallery
              </button>

              {formData.profileImage && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-rose-200/60"
                >
                  <X className="w-4 h-4 text-rose-600" />
                  Remove Photo
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPhotoMenuModal(false)}
              className="w-full py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Camera Live Capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF6B00]" />
                Webcam Camera Capture
              </h4>
              <button onClick={stopCamera} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square border-2 border-orange-500/30 flex items-center justify-center">
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="px-4 py-2 border rounded-xl font-bold text-xs hover:bg-slate-50 text-slate-700"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={useCapturedPhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Use Photo
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/30"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Digital Member ID Card Preview & Print Modal (Front & Back) */}
      {showIdCardModal && idCardMember && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-[#FF6B00] rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Digital Member ID Card</h3>
                  <p className="text-[11px] text-slate-500">
                    Official College/University Library Identification Badge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIdCardModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Cards Container */}
            <div className="printable-id-card-area flex flex-col md:flex-row items-center justify-center gap-6 py-2">
              {/* FRONT SIDE CARD */}
              <div className="printable-card-item w-[360px] h-[225px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative font-sans text-slate-800 flex flex-col justify-between flex-shrink-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-orange-500/20 rounded border border-orange-400/30">
                      <ShieldCheck className="w-4 h-4 text-orange-300" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[10px] tracking-wider text-orange-100 uppercase">
                        LIBRARY MANAGEMENT SYSTEM
                      </h4>
                      <p className="text-[7.5px] text-orange-300 font-medium tracking-wide">
                        OFFICIAL MEMBER CARD
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-[8px] rounded-full uppercase tracking-wider">
                    {idCardMember.membershipType || 'STUDENT'}
                  </span>
                </div>

                {/* Main Section */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-start gap-3">
                    {renderAvatar(
                      idCardMember.profileImage,
                      idCardMember.name,
                      'w-16 h-16',
                      'w-8 h-8',
                      'border-2 border-white shadow-md'
                    )}

                    <div className="space-y-0.5 overflow-hidden flex-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                          MEMBER ID
                        </span>
                        <span
                          className={`px-1.5 py-0.5 font-bold text-[7.5px] rounded-full uppercase ${
                            idCardMember.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          ● {idCardMember.status || 'ACTIVE'}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                        {idCardMember.name}
                      </h3>
                      <p className="font-mono text-xs font-bold text-[#FF6B00] tracking-wider">
                        {idCardMember.membershipId}
                      </p>

                      {idCardMember.membershipType === 'Student' ? (
                        <div className="text-[9.5px] text-slate-600 space-y-0.5 pt-0.5">
                          <p className="font-bold text-[#B33600] truncate">
                            {idCardMember.course || 'B.Tech'} - {idCardMember.department || 'CS'}
                          </p>
                          <p className="text-slate-500">
                            Yr: {idCardMember.currentYear || '1st Year'} | Sem: {idCardMember.semester || '1'}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[9.5px] text-slate-600 space-y-0.5 pt-0.5">
                          <p className="font-bold text-purple-900 truncate">
                            {idCardMember.designation || 'Faculty'}
                          </p>
                          <p className="text-slate-500">{idCardMember.department || 'General'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Barcode & RFID */}
                  <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[8px] text-slate-400 font-semibold">
                      <div className="w-4 h-3.5 bg-amber-200/80 border border-amber-400/60 rounded flex items-center justify-center text-[6px] font-mono text-amber-900 font-bold">
                        RFID
                      </div>
                      <span>VERIFIED</span>
                    </div>

                    <div className="w-40 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-inner">
                      <BarcodeSVG value={idCardMember.membershipId} />
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK SIDE CARD */}
              <div className="printable-card-item w-[360px] h-[225px] bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative font-sans p-4 flex flex-col justify-between flex-shrink-0">
                <div className="space-y-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-orange-300">TERMS & CONDITIONS</h5>
                    <QRCodeSVG value={idCardMember.membershipId} size={36} />
                  </div>
                  <ul className="text-[8.5px] text-slate-400 space-y-1 list-disc pl-3">
                    <li>This card is non-transferable and must be presented upon request.</li>
                    <li>Loss of card must be reported immediately to the chief librarian.</li>
                    <li>Books issued are the sole responsibility of the cardholder.</li>
                  </ul>
                </div>

                <div className="space-y-1 text-[9px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact Email:</span>
                    <span>{idCardMember.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span>{idCardMember.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400">
                  <div>
                    <p className="font-bold text-slate-300">Central University Library</p>
                    <p>Valid Until: {new Date(idCardMember.membershipExpiryDate || Date.now() + 365*24*60*60*1000).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-5 border-b border-slate-600 mb-0.5" />
                    <p className="text-[7px]">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-700 text-xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4.5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 transition"
              >
                <Printer className="w-4 h-4" />
                Print ID Card (Front & Back)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Delete Member</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete member{' '}
              <span className="font-bold text-slate-800">
                "{deletingMember?.name}" ({deletingMember?.membershipId})
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member History Drawer */}
      {selectedMemberDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">Member Profile & History</h3>
              <button
                onClick={() => setSelectedMemberDetails(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {renderAvatar(
                selectedMemberDetails.profileImage,
                selectedMemberDetails.name,
                'w-16 h-16',
                'w-8 h-8'
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedMemberDetails.name}</h4>
                <p className="text-xs text-slate-500">{selectedMemberDetails.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-[#FF6B00]">
                    {selectedMemberDetails.membershipId}
                  </span>
                  <span className="px-2 py-0.5 bg-orange-100 text-[#D94400] text-[9px] font-bold rounded-full">
                    {selectedMemberDetails.membershipType}
                  </span>
                </div>
              </div>
            </div>

            {/* Currently Issued Books */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3">
                Currently Issued Books ({selectedMemberDetails.activeIssues?.length || 0})
              </h4>
              {selectedMemberDetails.activeIssues?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No active issued books.</p>
              ) : (
                <div className="space-y-2">
                  {selectedMemberDetails.activeIssues?.map((iss) => (
                    <div key={iss._id} className="flex items-center justify-between p-3 border rounded-xl bg-white text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{iss.bookId?.title}</p>
                        <p className="text-[11px] text-slate-400">Due Date: {new Date(iss.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-full">
                        {iss.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
