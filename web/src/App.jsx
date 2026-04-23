import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Auth
import Login from './pages/Login';
import OTP from './pages/OTP';

// Shared
import BottomNav from './components/BottomNav';
import Profile from './pages/shared/Profile';

// Resident
import ResidentHome from './pages/resident/ResidentHome';
import Helpers from './pages/resident/Helpers';
import HelperProfile from './pages/resident/HelperProfile';
import MyHousehold from './pages/resident/MyHousehold';

// Guard
import GuardHome from './pages/guard/GuardHome';
import ScanResult from './pages/guard/ScanResult';
import InSocietyLog from './pages/guard/InSocietyLog';

// Admin
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import CardManagement from './pages/admin/CardManagement';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/otp'].includes(location.pathname);

  return (
    <div className="max-w-md mx-auto bg-surface h-[100dvh] shadow-2xl relative overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Navigate to={user ? getDefaultRoute(user.role) : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTP />} />
          
          {/* Shared */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Resident */}
          <Route path="/resident" element={<ProtectedRoute role="RESIDENT"><ResidentHome /></ProtectedRoute>} />
          <Route path="/resident/helpers" element={<ProtectedRoute role="RESIDENT"><Helpers /></ProtectedRoute>} />
          <Route path="/resident/helpers/:id" element={<ProtectedRoute role="RESIDENT"><HelperProfile /></ProtectedRoute>} />
          <Route path="/resident/household" element={<ProtectedRoute role="RESIDENT"><MyHousehold /></ProtectedRoute>} />

          {/* Guard */}
          <Route path="/guard" element={<ProtectedRoute role="GUARD"><GuardHome /></ProtectedRoute>} />
          <Route path="/guard/result" element={<ProtectedRoute role="GUARD"><ScanResult /></ProtectedRoute>} />
          <Route path="/guard/log" element={<ProtectedRoute role="GUARD"><InSocietyLog /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/cards" element={<ProtectedRoute role="ADMIN"><CardManagement /></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAuthPage && user && (
        <div className="flex-shrink-0 bg-transparent">
          <BottomNav role={user.role} />
        </div>
      )}
    </div>
  );
}

function getDefaultRoute(role) {
  if (role === 'GUARD') return '/guard';
  if (role === 'ADMIN') return '/admin';
  return '/resident';
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={getDefaultRoute(user.role)} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
