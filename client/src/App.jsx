import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import { MainLayout } from './components/layout/MainLayout';
import { InventoryLayout } from './components/layout/InventoryLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Members } from './pages/Members';
import { IssueBooks } from './pages/IssueBooks';
import { Returns } from './pages/Returns';
import { Reservations } from './pages/Reservations';
import { FineManagement } from './pages/FineManagement';
import { Categories } from './pages/Categories';
import { Authors } from './pages/Authors';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { HelpSupport } from './pages/HelpSupport';

import Items from './pages/inventory/Items';
import Billing from './pages/inventory/Billing';
import InventoryDashboard from './pages/inventory/Dashboard';
import AddItem from './pages/inventory/AddItem';
import SearchItem from './pages/inventory/ItemSearch';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1739] flex items-center justify-center text-white font-semibold text-sm">
        Initializing Library Management System...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user's role is not included, block access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are HOD, they shouldn't see library stuff, redirect to inventory
    if (user.role === 'HOD') return <Navigate to="/inventory/items" replace />;
    // If they are Librarian, they shouldn't see inventory, redirect to library
    if (user.role === 'Librarian') return <Navigate to="/" replace />;
    // Fallback
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard & Module Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Librarian']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="members" element={<Members />} />
          <Route path="issue-books" element={<IssueBooks />} />
          <Route path="returns" element={<Returns />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="fines" element={<FineManagement />} />
          <Route path="categories" element={<Categories />} />
          <Route path="authors" element={<Authors />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HOD']}>
              <InventoryLayout />
            </ProtectedRoute>
          }
        >
          <Route path="items" element={<Items />} />
          <Route path="billing" element={<Billing />} />
          <Route path="add-item" element={<AddItem />} />
          <Route path="search" element={<SearchItem />} />
          <Route path="reports" element={<InventoryDashboard />} />
          <Route path="dashboard" element={<InventoryDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
