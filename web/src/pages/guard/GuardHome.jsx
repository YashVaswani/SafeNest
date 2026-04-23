import React, { useState } from 'react';
import { Search, Zap, Phone, CheckCircle, ShieldAlert, ScanLine, UserCheck, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const QUICK_SEARCHES = ['Swiggy', 'Zomato', 'Amazon', 'Blinkit'];

export default function GuardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      navigate('/guard/result');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Premium Header */}
      <div className="bg-surface px-5 pt-14 pb-5 border-b border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-guardBlue font-black uppercase tracking-widest">{user?.post || 'Gate 1'} · On Duty</p>
            <h1 className="text-2xl font-black text-textPrimary tracking-tight mt-1">{user?.name || 'Guard'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-11 h-11 bg-background rounded-2xl flex items-center justify-center border border-border shadow-sm">
              <Bell className="w-5 h-5 text-textSecondary" />
            </button>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop'}
              alt="Avatar"
              className="w-11 h-11 rounded-2xl bg-background border-2 border-guardBlue/20 object-cover shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Duty Status Banner */}
      <div className="mx-4 mt-6 bg-gradient-guard rounded-3xl p-5 shadow-glow-guard relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldAlert className="w-24 h-24 text-white" strokeWidth={1} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Gate Security</p>
            <p className="text-white text-xl font-black mt-1 tracking-tight">Active & Secure</p>
            <p className="text-white/70 text-sm mt-1 font-medium">12 active visitors inside</p>
          </div>
          <button 
            onClick={() => navigate('/guard/log')}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 active:scale-95 transition-transform"
          >
            <UserCheck className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Scanner Panel */}
      <div className="mx-4 mt-8 bg-card rounded-3xl shadow-sm border border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h2 className="text-xs font-black text-textMuted uppercase tracking-widest flex items-center gap-2">
            <ScanLine className="w-4 h-4" /> ID Scanner
          </h2>
        </div>
        
        {/* Camera Placeholder */}
        <div
          className={clsx(
            'relative mx-4 mt-4 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer transition-all',
            scanning ? 'h-52 bg-guardBlue/5 border-2 border-guardBlue' : 'h-52 bg-background border-2 border-dashed border-border hover:border-guardBlue/50 hover:bg-guardBlue/5'
          )}
          onClick={handleScan}
        >
          {scanning ? (
            <>
              {/* Scan animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ScanLine className="w-12 h-12 text-guardBlue animate-pulse-soft" />
                <p className="text-guardBlue font-bold text-sm mt-3">Scanning ID...</p>
                <div className="absolute top-0 left-0 right-0 h-1 bg-guardBlue/60 animate-scan-line" />
              </div>
              {/* Corner brackets */}
              {['tl', 'tr', 'bl', 'br'].map(pos => (
                <div key={pos} className={clsx(
                  'absolute w-8 h-8 border-guardBlue border-3 rounded-sm',
                  pos === 'tl' && 'top-4 left-4 border-t-2 border-l-2',
                  pos === 'tr' && 'top-4 right-4 border-t-2 border-r-2',
                  pos === 'bl' && 'bottom-4 left-4 border-b-2 border-l-2',
                  pos === 'br' && 'bottom-4 right-4 border-b-2 border-r-2',
                )} />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 bg-surface shadow-sm rounded-2xl flex items-center justify-center border border-border">
                <ScanLine className="w-8 h-8 text-guardBlue" />
              </div>
              <p className="text-sm font-bold text-textPrimary">Tap to Scan QR / RFID</p>
              <p className="text-xs text-textMuted">Point camera at visitor badge or phone</p>
            </div>
          )}
        </div>

        {/* Quick Searches */}
        <div className="p-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {QUICK_SEARCHES.map(q => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="shrink-0 px-4 py-2 bg-guardLight text-guardBlue text-xs font-bold rounded-xl border border-guardBlue/20 hover:bg-guardBlue hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search phone or partner ID..."
              className="input-base pl-11 py-4 bg-background border-border/60 focus:border-guardBlue/30 focus:ring-guardBlue/10"
            />
          </div>

          <button
            onClick={() => navigate('/guard/result')}
            className="mt-3 w-full flex items-center justify-center gap-2 py-4 bg-guardBlue hover:bg-guardBlue/90 text-white font-bold rounded-2xl text-sm transition-colors shadow-sm active:scale-95"
          >
            <Search className="w-4 h-4" /> Search Directory
          </button>
        </div>
      </div>

      {/* SOS Button */}
      <div className="px-4 mt-8">
        <h2 className="text-xs font-black text-textMuted uppercase tracking-widest mb-4">Emergency</h2>
        <button className="w-full bg-gradient-primary text-white font-black rounded-3xl py-5 flex items-center justify-center gap-3 shadow-glow-primary text-base active:scale-95 transition-transform border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
          <Zap className="w-6 h-6 fill-white relative z-10" />
          <span className="relative z-10 tracking-wide">TRIGGER SOS ALERT</span>
        </button>
        <p className="text-center text-xs text-textMuted mt-3 font-medium flex items-center justify-center gap-1">
          <ShieldAlert className="w-3 h-3" /> Instantly notifies residents & RWA
        </p>
      </div>
    </div>
  );
}
