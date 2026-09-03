import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { InventorySidebar } from './InventorySidebar';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InventoryLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/inventory/items':
        return 'Items';
      case '/inventory/add-item':
        return 'Add New Item';
      case '/inventory/search':
        return 'Search Item';
      case '/inventory/billing':
        return 'Billing';
      case '/inventory/reports':
        return 'Reports';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      <InventorySidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar matching StockManage screenshot */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search here..." 
                className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-700 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute 1 top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <img 
                src={user?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700 leading-tight">{user?.name || 'User'}</span>
                <span className="text-[10px] text-gray-500 font-medium">{user?.role || 'HOD'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Header */}
        <div className="px-8 pt-8 pb-4 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-800">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 font-medium">Dashboard &gt; {getPageTitle()}</p>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
