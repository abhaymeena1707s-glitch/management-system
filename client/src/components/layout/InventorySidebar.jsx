import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Search, FileText, PieChart, User, Settings, LogOut, PackageOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InventorySidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/inventory/dashboard', icon: LayoutDashboard },
    { name: 'Items', path: '/inventory/items', icon: Package },
    { name: 'Add Item', path: '/inventory/add-item', icon: PlusCircle },
    { name: 'Search Item', path: '/inventory/search', icon: Search },
    { name: 'Billing', path: '/inventory/billing', icon: FileText },
    { name: 'Reports', path: '/inventory/reports', icon: PieChart },
  ];

  const bottomItems = [
    { name: 'Profile', path: '/inventory/profile', icon: User },
    { name: 'Settings', path: '/inventory/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1A1B23] text-slate-300 flex flex-col h-screen sticky top-0 left-0 overflow-y-auto">
      {/* Logo Area */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <PackageOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StockManage</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">Smart Inventory & Billing Solution</p>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 flex flex-col gap-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 hover:text-white transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
