import React, { useState } from 'react';
import { ArrowLeft, QrCode, PlusCircle, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_HELPERS } from '../../data/mockData';
import clsx from 'clsx';

export default function CardManagement() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(
    MOCK_HELPERS.map(h => ({ ...h, cardStatus: h.verified ? 'active' : 'pending' }))
  );

  const toggleSuspend = (id) => {
    setCards(c => c.map(card =>
      card.id === id
        ? { ...card, cardStatus: card.cardStatus === 'suspended' ? 'active' : 'suspended' }
        : card
    ));
  };

  const statusConfig = {
    active:    { label: 'Active',    color: 'bg-successLight text-success', dot: 'bg-success' },
    suspended: { label: 'Suspended', color: 'bg-primary/10 text-primary',   dot: 'bg-primary' },
    pending:   { label: 'Pending',   color: 'bg-warning/20 text-warningDark', dot: 'bg-warning' },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-admin px-5 pt-14 pb-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-black text-white">Card Management</h1>
        </div>
        <p className="text-white/70 text-xs relative z-10">Issue, activate or revoke helper access cards</p>
      </div>

      {/* Issue New Card CTA */}
      <div className="px-4 mt-4">
        <button className="w-full bg-gradient-admin text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg">
          <PlusCircle className="w-5 h-5" /> Issue New Card
        </button>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {cards.map(card => {
          const sc = statusConfig[card.cardStatus];
          return (
            <div key={card.id} className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={card.profilePhotoUrl} alt={card.fullName} className="w-12 h-12 rounded-2xl bg-background object-cover" />
                  <div className={clsx('absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card', sc.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-textPrimary">{card.fullName}</p>
                  <p className="text-xs text-textMuted">{card.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={clsx('text-[10px] font-black px-2 py-1 rounded-full', sc.color)}>
                    {sc.label}
                  </span>
                  <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-textSecondary" />
                  </div>
                </div>
              </div>

              {card.cardStatus !== 'pending' && (
                <>
                  <div className="mx-4 h-px bg-border" />
                  <div className="px-4 py-3">
                    <button
                      onClick={() => toggleSuspend(card.id)}
                      className={clsx(
                        'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all',
                        card.cardStatus === 'suspended'
                          ? 'bg-successLight text-success border border-success/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      )}
                    >
                      {card.cardStatus === 'suspended' ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Reactivate Card</>
                      ) : (
                        <><Ban className="w-3.5 h-3.5" /> Suspend Card</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
