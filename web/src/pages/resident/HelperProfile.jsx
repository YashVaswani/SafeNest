import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, CheckCircle, Award, Phone, Flag, MessageCircle,
  Clock, MapPin, Briefcase, Globe, ChevronDown, ChevronUp, Share2
} from 'lucide-react';
import clsx from 'clsx';
import { MOCK_HELPERS } from '../../data/mockData';

function StarFill({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={clsx('w-4 h-4', i <= Math.floor(rating) ? 'text-warning fill-warning' : 'text-border')} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-background rounded-2xl p-4 border border-border/60">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-bold text-sm text-textPrimary">{review.author}</p>
          <p className="text-xs text-textMuted">{review.flat} · {review.date}</p>
        </div>
        <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-xl">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span className="text-xs font-black text-textPrimary">{review.rating}.0</span>
        </div>
      </div>
      <p className="text-sm text-textSecondary leading-relaxed">"{review.text}"</p>
    </div>
  );
}

function WorkHistoryRow({ job, isLast }) {
  return (
    <div className={clsx('flex gap-3 pb-4', !isLast && 'border-b border-border')}>
      <div className="flex flex-col items-center pt-1">
        <div className={clsx('w-2.5 h-2.5 rounded-full border-2', job.status === 'current' ? 'border-success bg-success' : 'border-textMuted bg-surface')} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm text-textPrimary">{job.society}</p>
            <p className="text-xs text-textMuted">{job.flat} · {job.role}</p>
          </div>
          <div className="flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded-lg shrink-0">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span className="text-xs font-black text-textPrimary">{job.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full',
            job.status === 'current' ? 'bg-successLight text-success' : 'bg-background text-textMuted border border-border'
          )}>
            {job.status === 'current' ? '● Current' : 'Past'}
          </span>
          <span className="text-xs text-textMuted font-medium">{job.duration}</span>
        </div>
      </div>
    </div>
  );
}

export default function HelperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const helper = MOCK_HELPERS.find(h => h.id === id);
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!helper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="font-bold text-textSecondary">Helper not found</p>
          <button onClick={() => navigate(-1)} className="text-primary font-bold mt-3 text-sm">Go back</button>
        </div>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? helper.reviews : helper.reviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-primary pt-14 pb-20 px-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/20 to-transparent" />

        <div className="relative z-10 flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="relative z-10 flex items-end gap-4">
          <div className="relative">
            <img
              src={helper.profilePhotoUrl}
              alt={helper.fullName}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white/30 shadow-lg"
            />
            {helper.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center border-3 border-white shadow">
                <CheckCircle className="w-5 h-5 text-white fill-success" />
              </div>
            )}
          </div>
          <div className="text-white pb-1">
            <h1 className="text-xl font-black">{helper.fullName}</h1>
            <p className="text-white/80 text-sm font-medium">{helper.type} · {helper.experience} exp.</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-black text-sm">{helper.rating}</span>
              </div>
              <span className="text-white/60 text-xs">({helper.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content scrolls over hero */}
      <div className="relative -mt-8 rounded-t-4xl bg-surface px-5 pt-6 pb-28 space-y-6 shadow-card">
        {/* Badge strip */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {helper.verified && (
            <div className="flex items-center gap-1.5 bg-successLight px-3 py-1.5 rounded-xl border border-success/20 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              <span className="text-xs font-black text-success">Verified</span>
            </div>
          )}
          {helper.trustedBadge && (
            <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20 shrink-0">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-black text-accent">Trusted in {helper.societies} Societies</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-black text-primary">{helper.availability}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-success text-white font-bold rounded-2xl py-3.5 shadow-glow-success">
            <Phone className="w-4 h-4" /> Call
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-primary text-white font-bold rounded-2xl py-3.5 shadow-glow-primary">
            <MessageCircle className="w-4 h-4" /> Request
          </button>
          <button className="w-12 flex items-center justify-center bg-primary/10 text-primary rounded-2xl border border-primary/20">
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* Bio */}
        <div>
          <h2 className="text-sm font-black text-textPrimary uppercase tracking-widest mb-2">About</h2>
          <p className="text-sm text-textSecondary leading-relaxed">{helper.bio}</p>
        </div>

        {/* Pricing */}
        <div className="bg-background rounded-2xl p-4 border border-border/60">
          <h2 className="text-xs font-black text-textMuted uppercase tracking-widest mb-3">Pricing</h2>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-textMuted">Hourly</p>
              <p className="text-lg font-black text-textPrimary">{helper.hourlyRate}</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-xs text-textMuted">Monthly</p>
              <p className="text-lg font-black text-textPrimary">{helper.monthlyRate}</p>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div>
          <h2 className="text-sm font-black text-textPrimary uppercase tracking-widest mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {helper.specialties.map(s => (
              <span key={s} className="flex items-center gap-1.5 text-xs font-bold bg-primary/8 text-primary px-3 py-1.5 rounded-xl border border-primary/15">
                ✦ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        {helper.languages && (
          <div>
            <h2 className="text-sm font-black text-textPrimary uppercase tracking-widest mb-3">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {helper.languages.map(l => (
                <span key={l} className="flex items-center gap-1 text-xs font-semibold bg-background text-textSecondary px-3 py-1.5 rounded-xl border border-border">
                  <Globe className="w-3 h-3" /> {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {helper.workHistory?.length > 0 && (
          <div>
            <h2 className="text-sm font-black text-textPrimary uppercase tracking-widest mb-4">Work History</h2>
            <div className="space-y-4">
              {helper.workHistory.map((job, i) => (
                <WorkHistoryRow key={i} job={job} isLast={i === helper.workHistory.length - 1} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {helper.reviews?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-textPrimary uppercase tracking-widest">Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-black text-base">{helper.rating}</span>
                  </div>
                  <span className="text-textMuted text-xs">from {helper.reviewCount} residents</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {displayedReviews.map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>
            {helper.reviews.length > 2 && (
              <button
                onClick={() => setShowAllReviews(v => !v)}
                className="flex items-center gap-1 text-primary font-bold text-sm mt-3"
              >
                {showAllReviews ? (
                  <><ChevronUp className="w-4 h-4" /> Show less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> View all {helper.reviews.length} reviews</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
