import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Clock, Phone, ChevronRight, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_HELPERS } from '../../data/mockData';

const MY_HELPERS = MOCK_HELPERS.slice(0, 2).map(h => ({
  ...h,
  startDate: '15 Jan 2025',
  workDays: 'Mon–Sat',
  workHours: '8:00 AM – 10:00 AM',
}));

export default function MyHousehold() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-surface px-5 pt-14 pb-5 border-b border-border/60">
        <h1 className="text-xl font-black text-textPrimary">My Household</h1>
        <p className="text-sm text-textMuted mt-0.5">{user?.flat || 'B-204, Prestige Residency'}</p>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {MY_HELPERS.map(h => (
          <div key={h.id} className="bg-card rounded-3xl border border-border/60 shadow-card overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="relative shrink-0">
                <img src={h.profilePhotoUrl} alt={h.fullName} className="w-14 h-14 rounded-2xl object-cover bg-background" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-textPrimary">{h.fullName}</p>
                <p className="text-xs font-bold text-primary">{h.type}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-textMuted" />
                  <span className="text-xs text-textMuted">{h.workHours} · {h.workDays}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/resident/helpers/${h.id}`)}
                className="w-8 h-8 bg-background rounded-full flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-textSecondary" />
              </button>
            </div>
            <div className="mx-4 h-px bg-border" />
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-textMuted font-medium">Since {h.startDate}</div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-xl">
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold text-danger bg-danger/10 px-3 py-1.5 rounded-xl">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => navigate('/resident/helpers')}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-3xl text-primary font-bold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Add a Helper
        </button>
      </div>
    </div>
  );
}
