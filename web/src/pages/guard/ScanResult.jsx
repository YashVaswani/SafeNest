import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, Flag, ArrowLeft, Verified, Shield } from 'lucide-react';

export default function ScanResult() {
  const navigate = useNavigate();

  // Simulated result from scan
  const result = {
    name: 'Ramu Krishnan',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ramu&backgroundColor=ffd5dc',
    type: 'Cook',
    badge: 'Verified Helper',
    badgeColor: 'text-success',
    badgeBg: 'bg-successLight',
    societies: 4,
    flat: 'A-1101, Brigade Metropolis',
    phone: '+91 99887 00123',
    status: 'AUTHORIZED',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Hero */}
      <div className={`bg-gradient-success px-5 pt-14 pb-12 relative overflow-hidden`}>
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <button
          onClick={() => navigate(-1)}
          className="relative z-10 mb-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <CheckCircle className="w-14 h-14 text-white fill-success" />
          </div>
          <h2 className="text-white text-2xl font-black">VERIFIED ENTRY</h2>
          <p className="text-white/80 text-sm mt-1">Authorized to enter the society</p>
        </div>
      </div>

      {/* Person Card */}
      <div className="mx-4 -mt-6 bg-card rounded-3xl shadow-card border border-border/60 overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <img
            src={result.photo}
            alt={result.name}
            className="w-20 h-20 rounded-2xl object-cover bg-background"
          />
          <div>
            <h3 className="text-xl font-black text-textPrimary">{result.name}</h3>
            <p className="text-sm font-bold text-textSecondary">{result.type}</p>
            <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-xl ${result.badgeBg}`}>
              <Shield className={`w-3.5 h-3.5 ${result.badgeColor}`} />
              <span className={`text-xs font-black ${result.badgeColor}`}>{result.badge}</span>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px bg-border" />

        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3 bg-background rounded-xl p-3">
            <Verified className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-textMuted font-medium">Trusted in</p>
              <p className="text-sm font-bold text-textPrimary">{result.societies} Societies</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-background rounded-xl p-3">
            <Shield className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-textMuted font-medium">Registered Flat</p>
              <p className="text-sm font-bold text-textPrimary">{result.flat}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-4 space-y-3">
        <button className="btn-primary text-base">
          <CheckCircle className="w-5 h-5" /> Approve Entry
        </button>
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-accent/10 text-accent font-bold rounded-2xl text-sm border border-accent/20">
            <Phone className="w-4 h-4" /> Call Resident
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary/10 text-primary font-bold rounded-2xl text-sm border border-primary/20">
            <Flag className="w-4 h-4" /> Flag Issue
          </button>
        </div>
      </div>
    </div>
  );
}
