import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, UserCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const PENDING_USERS = [
  { id: 'u1', name: 'Arjun Mehta',    flat: 'A-202', phone: '+91 98760 00001', submitted: '2 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun' },
  { id: 'u2', name: 'Deepika Nair',   flat: 'C-504', phone: '+91 98760 00002', submitted: '5 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=deepika' },
  { id: 'u3', name: 'Rohit Jaiswal',  flat: 'D-101', phone: '+91 98760 00003', submitted: '1 day ago',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohit' },
];

const APPROVED_USERS = [
  { id: 'u4', name: 'Priya Sharma',    flat: 'B-204', role: 'Resident', status: 'active' },
  { id: 'u5', name: 'Vijay Anand',     flat: 'G-901', role: 'Resident', status: 'active' },
  { id: 'u6', name: 'Rajan Kumar',     flat: 'Gate 1', role: 'Guard', status: 'active' },
];

export default function UserManagement() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(PENDING_USERS);
  const [tab, setTab] = useState('pending');

  const approve = (id) => setPending(p => p.filter(u => u.id !== id));
  const reject  = (id) => setPending(p => p.filter(u => u.id !== id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-admin px-5 pt-14 pb-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-black text-white">User Management</h1>
        </div>
        <div className="flex gap-2 relative z-10">
          {['pending', 'approved'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-4 py-1.5 rounded-full text-xs font-bold capitalize',
                t === tab ? 'bg-white text-adminPurple' : 'bg-white/20 text-white/80'
              )}>
              {t} {t === 'pending' && pending.length > 0 && `(${pending.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {tab === 'pending' ? (
          pending.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckCircle className="w-14 h-14 text-success mb-3" />
              <p className="font-black text-textPrimary">All caught up!</p>
              <p className="text-xs text-textMuted mt-1">No pending approvals</p>
            </div>
          ) : (
            pending.map(u => (
              <div key={u.id} className="bg-card rounded-2xl border border-border/60 shadow-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-2xl bg-background" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-textPrimary">{u.name}</p>
                    <p className="text-xs text-textMuted">{u.flat} · {u.phone}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-textMuted" />
                      <span className="text-[10px] text-textMuted">{u.submitted}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(u.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-success text-white font-bold rounded-xl text-sm">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => reject(u.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm border border-primary/20">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          APPROVED_USERS.map(u => (
            <div key={u.id} className="bg-card rounded-2xl border border-border/60 shadow-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-adminLight rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-adminPurple" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-textPrimary">{u.name}</p>
                <p className="text-xs text-textMuted">{u.flat}</p>
              </div>
              <span className={clsx('text-[10px] font-black px-2 py-1 rounded-full',
                u.role === 'Guard' ? 'bg-guardLight text-guardBlue' : 'bg-residentLight text-residentGreen'
              )}>
                {u.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
