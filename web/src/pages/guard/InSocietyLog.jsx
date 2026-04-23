import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IN_SOCIETY_LOG } from '../../data/mockData';
import clsx from 'clsx';

const TABS = ['All', 'Delivery', 'Helpers', 'Guests'];

const typeMap = { delivery: 'Delivery', helper: 'Helpers', guest: 'Guests' };

const typeColor = {
  delivery: 'bg-primary/10 text-primary',
  helper: 'bg-success/10 text-success',
  guest: 'bg-accent/10 text-accent',
};

export default function InSocietyLog() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');

  const filtered = IN_SOCIETY_LOG.filter(v =>
    tab === 'All' || typeMap[v.type] === tab
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-guard px-5 pt-14 pb-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">In-Society Log</h1>
            <p className="text-white/70 text-xs">{IN_SOCIETY_LOG.length} people inside</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 relative z-10">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                t === tab ? 'bg-white text-guardBlue' : 'bg-white/20 text-white/80'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {filtered.map(v => (
          <div key={v.id} className="bg-card rounded-2xl border border-border/60 shadow-card p-4 flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={v.avatar} alt={v.name} className="w-12 h-12 rounded-2xl bg-background object-cover" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success rounded-full border-2 border-card animate-pulse-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-textPrimary truncate">{v.name}</p>
              <p className="text-xs text-textMuted">{v.flat} · Entered {v.enteredAt}</p>
              {v.partner && <p className="text-xs font-bold text-primary">{v.partner}</p>}
            </div>
            <span className={clsx('text-[10px] font-black px-2 py-1 rounded-full shrink-0', typeColor[v.type])}>
              {typeMap[v.type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
