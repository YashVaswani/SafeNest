import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, QrCode, Users, Package, UserCheck, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RESIDENT_NOTIFICATIONS } from '../../data/mockData';

const QUICK_ACTIONS = [
  { icon: QrCode,     label: 'Pre-approve Guest', color: 'bg-primary/10 text-primary',   desc: 'Share QR code' },
  { icon: Users,      label: 'Find Helpers',       color: 'bg-accent/10 text-accent',     desc: 'Browse directory' },
  { icon: Shield,     label: 'My Household',       color: 'bg-success/10 text-success',   desc: 'Manage helpers' },
  { icon: AlertTriangle, label: 'Report Issue',   color: 'bg-warning/10 text-warningDark', desc: 'Report to RWA' },
];

const notifIconMap = {
  delivery: <Package className="w-5 h-5 text-primary" />,
  guest: <UserCheck className="w-5 h-5 text-accent" />,
  helper: <Users className="w-5 h-5 text-success" />,
  alert: <Bell className="w-5 h-5 text-warningDark" />,
};

const notifBgMap = {
  delivery: 'bg-primary/10',
  guest: 'bg-accent/10',
  helper: 'bg-success/10',
  alert: 'bg-warning/10',
};

export default function ResidentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const unread = RESIDENT_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Non-Sticky Header */}
      <div className="bg-surface px-5 pt-14 pb-5 border-b border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-textMuted font-semibold uppercase tracking-wider">Good morning 👋</p>
            <h1 className="text-2xl font-black text-textPrimary tracking-tight">{user?.name || 'Resident'}</h1>
            <p className="text-sm text-textSecondary font-medium mt-0.5">{user?.flat || 'Prestige Residency'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-11 h-11 bg-background rounded-2xl flex items-center justify-center border border-border shadow-sm">
              <Bell className="w-5 h-5 text-textSecondary" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-badge-pop">
                  {unread}
                </span>
              )}
            </button>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'}
              alt="Avatar"
              className="w-11 h-11 rounded-2xl bg-background border-2 border-primary/20 object-cover shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Safety Status Banner */}
      <div className="mx-4 mt-6 bg-gradient-success rounded-3xl p-5 shadow-glow-success relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield className="w-24 h-24 text-white" strokeWidth={1} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Society Safety</p>
            <p className="text-white text-xl font-black mt-1 tracking-tight">Status: Secured ✓</p>
            <p className="text-white/70 text-sm mt-1 font-medium">12 active visitors inside</p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Shield className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-8">
        <h2 className="text-xs font-black text-textMuted uppercase tracking-widest mb-4">Priority Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, color, desc }) => (
            <button
              key={label}
              onClick={() => label === 'Find Helpers' && navigate('/resident/helpers')}
              className="bg-card rounded-3xl p-5 border border-border/60 text-left transition-all hover:border-primary/20 hover:shadow-lg active:scale-95 shadow-sm group"
            >
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-textPrimary leading-tight">{label}</p>
              <p className="text-xs text-textMuted mt-1 font-medium">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="px-4 mt-8 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-textMuted uppercase tracking-widest">Recent Activity</h2>
          {unread > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse">
              {unread} New Alerts
            </span>
          )}
        </div>
        <div className="space-y-4">
          {RESIDENT_NOTIFICATIONS.map(notif => (
            <div
              key={notif.id}
              className={`bg-card rounded-3xl p-5 border flex items-start gap-4 transition-all hover:shadow-md ${
                notif.unread ? 'border-primary/20 bg-primary/[0.02]' : 'border-border/60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${notifBgMap[notif.type]} flex items-center justify-center shrink-0 shadow-inner`}>
                {notifIconMap[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-textPrimary leading-tight">{notif.title}</p>
                  {notif.unread && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1 shadow-glow-primary" />}
                </div>
                <p className="text-sm text-textSecondary mt-1 line-clamp-2 leading-snug">{notif.body}</p>
                <p className="text-[10px] text-textMuted mt-2 font-bold uppercase tracking-tighter">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
