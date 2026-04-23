import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="bg-surface px-5 pt-14 pb-6 border-b border-border shadow-sm">
        <h1 className="text-2xl font-black text-textPrimary tracking-tight mb-6">Profile Settings</h1>
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-textPrimary">{user?.name || 'User'}</h2>
            <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Details List */}
      <div className="px-4 mt-8 space-y-4 flex-1">
        <div className="bg-surface border border-border/60 rounded-3xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Mobile Number</p>
              <p className="text-sm font-semibold text-textPrimary mt-0.5">{user?.phone || 'Not set'}</p>
            </div>
          </div>

          <div className="h-px bg-border/60 w-full" />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Society</p>
              <p className="text-sm font-semibold text-textPrimary mt-0.5">{user?.societyId || 'SafeNest Society'}</p>
            </div>
          </div>

          {user?.flat && (
            <>
              <div className="h-px bg-border/60 w-full" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Unit / Post</p>
                  <p className="text-sm font-semibold text-textPrimary mt-0.5">{user.flat || user.post}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-8">
        <button 
          onClick={handleLogout}
          className="w-full bg-surface border border-primary/20 text-primary font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
