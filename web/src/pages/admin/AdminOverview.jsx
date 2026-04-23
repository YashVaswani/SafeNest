import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STAT_CARDS = [
  { label: 'Active Guards',     value: '4',  change: '+1 today',  icon: Shield,        color: 'bg-guardLight text-guardBlue',    glow: 'shadow-glow-guard' },
  { label: 'Total Residents',  value: '128', change: '12 pending', icon: Users,         color: 'bg-residentLight text-residentGreen', glow: '' },
  { label: 'Verified Helpers',  value: '47',  change: 'All cleared', icon: CheckCircle,  color: 'bg-successLight text-success',   glow: 'shadow-glow-success' },
  { label: 'Open Complaints',   value: '3',   change: '1 critical', icon: AlertTriangle, color: 'bg-primary/10 text-primary',     glow: 'shadow-glow-primary' },
];

const RECENT_ACTIVITIES = [
  { text: 'New resident approval pending: Flat A-202', time: '5m ago', dot: 'bg-warning' },
  { text: 'Helper card issued to Savitha Devi', time: '1h ago', dot: 'bg-success' },
  { text: 'Complaint flagged: Gate 2 light broken', time: '3h ago', dot: 'bg-primary' },
  { text: 'Monthly safety report generated', time: '1d ago', dot: 'bg-accent' },
];

export default function AdminOverview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-admin px-5 pt-14 pb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold">RWA ADMIN</p>
            <h1 className="text-xl font-black text-white">{user?.name || 'Admin'}</h1>
            <p className="text-white/70 text-xs">{user?.title || 'Society Manager'}</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-white/20 text-white text-xs font-bold rounded-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {STAT_CARDS.map(({ label, value, change, icon: Icon, color, glow }) => (
          <div key={label} className={`bg-card rounded-2xl border border-border/60 p-4 shadow-card ${glow}`}>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-textPrimary">{value}</p>
            <p className="text-xs font-bold text-textSecondary mt-0.5">{label}</p>
            <p className="text-[10px] text-textMuted mt-1">{change}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="px-4 mt-5 space-y-3">
        <h2 className="text-xs font-black text-textMuted uppercase tracking-widest">Management</h2>
        <button
          onClick={() => navigate('/admin/users')}
          className="w-full bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-card card-hover"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-adminLight rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-adminPurple" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-textPrimary">User Management</p>
              <p className="text-xs text-textMuted">12 pending approvals</p>
            </div>
          </div>
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-black">12</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/cards')}
          className="w-full bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-card card-hover"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-guardLight rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-guardBlue" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-textPrimary">Helper Card Management</p>
              <p className="text-xs text-textMuted">Issue / revoke QR cards</p>
            </div>
          </div>
        </button>
      </div>

      {/* Activity Feed */}
      <div className="px-4 mt-5">
        <h2 className="text-xs font-black text-textMuted uppercase tracking-widest mb-3">Recent Activity</h2>
        <div className="bg-card rounded-2xl border border-border/60 shadow-card divide-y divide-border/60">
          {RECENT_ACTIVITIES.map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-textPrimary">{a.text}</p>
                <p className="text-[10px] text-textMuted mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
