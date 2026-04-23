import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, CheckCircle, ChevronRight, SlidersHorizontal,
  X, Sparkles, TrendingUp, Award, Clock, MapPin, Filter
} from 'lucide-react';
import clsx from 'clsx';
import { MOCK_HELPERS } from '../../data/mockData';

const CATEGORIES = [
  { id: 'All',         label: 'All',          emoji: '✨' },
  { id: 'Maid',        label: 'Maid',         emoji: '🧹' },
  { id: 'Cook',        label: 'Cook',         emoji: '🍳' },
  { id: 'Driver',      label: 'Driver',       emoji: '🚗' },
  { id: 'Nanny',       label: 'Nanny',        emoji: '🍼' },
  { id: 'Elderly Care',label: 'Elderly Care', emoji: '🤍' },
  { id: 'Gardener',    label: 'Gardener',     emoji: '🌱' },
  { id: 'Security',    label: 'Security',     emoji: '🛡️' },
];

const SORT_OPTIONS = [
  { id: 'rating',      label: 'Top Rated' },
  { id: 'reviews',     label: 'Most Reviewed' },
  { id: 'experience',  label: 'Most Experienced' },
  { id: 'price_low',   label: 'Price: Low to High' },
  { id: 'price_high',  label: 'Price: High to Low' },
];

const AVAILABILITY_OPTIONS = ['All', 'Full-time', 'Part-time'];

const FEATURED_COLLECTIONS = [
  { id: 'top', label: '🏆 Top Rated', desc: 'Rating 4.8+', filter: h => h.rating >= 4.8 },
  { id: 'new',  label: '✨ Rising Stars', desc: 'New & promising', filter: h => h.reviewCount < 20 },
  { id: 'trusted', label: '🛡️ Most Trusted', desc: 'In 3+ societies', filter: h => h.societies >= 3 },
];

function StarRow({ rating, small }) {
  return (
    <div className={clsx('flex items-center gap-0.5', small ? 'gap-[2px]' : 'gap-1')}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={clsx(small ? 'w-3 h-3' : 'w-4 h-4',
            i <= Math.floor(rating) ? 'text-warning fill-warning' : 'text-border'
          )}
        />
      ))}
    </div>
  );
}

function HelperCard({ helper, index }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/resident/helpers/${helper.id}`)}
      className="bg-card rounded-3xl shadow-card border border-border/60 overflow-hidden card-hover cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Card Top */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={helper.profilePhotoUrl}
              alt={helper.fullName}
              className="w-16 h-16 rounded-2xl object-cover bg-background"
            />
            {helper.verified && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-card">
                <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-base text-textPrimary truncate">{helper.fullName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={clsx(
                    'text-xs font-black px-2 py-0.5 rounded-full',
                    helper.type === 'Cook'        ? 'bg-warningDark/15 text-warningDark' :
                    helper.type === 'Maid'        ? 'bg-accent/15 text-accent' :
                    helper.type === 'Nanny'       ? 'bg-adminPurple/15 text-adminPurple' :
                    helper.type === 'Driver'      ? 'bg-guardBlue/15 text-guardBlue' :
                    helper.type === 'Elderly Care'? 'bg-primary/15 text-primary' :
                                                    'bg-success/15 text-success'
                  )}>
                    {helper.type}
                  </span>
                  <span className="text-textMuted text-xs">·</span>
                  <span className="text-xs text-textSecondary font-medium">{helper.experience}</span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-xl">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-black text-textPrimary">{helper.rating}</span>
                </div>
                <span className="text-[10px] text-textMuted font-medium">{helper.reviewCount} reviews</span>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {helper.specialties.slice(0, 3).map(s => (
                <span key={s} className="text-[10px] font-semibold bg-background text-textSecondary px-2 py-0.5 rounded-lg border border-border">
                  {s}
                </span>
              ))}
              {helper.specialties.length > 3 && (
                <span className="text-[10px] font-bold text-primary px-2 py-0.5">
                  +{helper.specialties.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* Card Bottom */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-textMuted font-medium">Monthly Rate</p>
            <p className="text-sm font-black text-textPrimary">{helper.monthlyRate}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-xs text-textMuted font-medium">Availability</p>
            <p className={clsx('text-xs font-bold',
              helper.availability === 'Full-time' ? 'text-success' : 'text-accent'
            )}>
              {helper.availability}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {helper.trustedBadge && (
            <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-xl">
              <Award className="w-3 h-3 text-success" />
              <span className="text-[10px] font-black text-success">{helper.societies} soc.</span>
            </div>
          )}
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-2xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-xl skeleton" />
          <div className="h-3 w-1/2 rounded-xl skeleton" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-lg skeleton" />
            <div className="h-5 w-16 rounded-lg skeleton" />
          </div>
        </div>
      </div>
      <div className="h-px bg-border" />
      <div className="flex gap-6">
        <div className="h-8 w-20 rounded-xl skeleton" />
        <div className="h-8 w-20 rounded-xl skeleton" />
      </div>
    </div>
  );
}

function FilterSheet({ onClose, filters, setFilters }) {
  const [local, setLocal] = useState(filters);

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-surface rounded-t-4xl w-full max-w-md mx-auto p-6 pb-10 animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-textPrimary">Filters</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
            <X className="w-4 h-4 text-textSecondary" />
          </button>
        </div>

        {/* Sort */}
        <div className="mb-5">
          <p className="text-xs font-black text-textMuted uppercase tracking-widest mb-3">Sort By</p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setLocal(l => ({ ...l, sort: opt.id }))}
                className={clsx(
                  'text-xs font-bold px-3 py-2 rounded-xl transition-all border',
                  local.sort === opt.id
                    ? 'bg-primary text-white border-primary shadow-glow-primary'
                    : 'bg-background text-textSecondary border-border'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-5">
          <p className="text-xs font-black text-textMuted uppercase tracking-widest mb-3">Availability</p>
          <div className="flex gap-2">
            {AVAILABILITY_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setLocal(l => ({ ...l, availability: opt }))}
                className={clsx(
                  'text-xs font-bold px-4 py-2 rounded-xl transition-all border',
                  local.availability === opt
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-textSecondary border-border'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-5">
          <p className="text-xs font-black text-textMuted uppercase tracking-widest mb-3">Minimum Rating</p>
          <div className="flex gap-2">
            {[0, 4, 4.5, 4.8].map(r => (
              <button
                key={r}
                onClick={() => setLocal(l => ({ ...l, minRating: r }))}
                className={clsx(
                  'flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all border',
                  local.minRating === r
                    ? 'bg-warning text-white border-warning'
                    : 'bg-background text-textSecondary border-border'
                )}
              >
                {r === 0 ? 'Any' : <><Star className="w-3 h-3 fill-current" />{r}+</>}
              </button>
            ))}
          </div>
        </div>

        {/* Verified only */}
        <div className="flex items-center justify-between mb-6 bg-background rounded-2xl px-4 py-3">
          <div>
            <p className="text-sm font-bold text-textPrimary">Verified Only</p>
            <p className="text-xs text-textMuted">Show society-verified helpers</p>
          </div>
          <button
            onClick={() => setLocal(l => ({ ...l, verifiedOnly: !l.verifiedOnly }))}
            className={clsx(
              'w-12 h-6 rounded-full transition-all relative',
              local.verifiedOnly ? 'bg-success' : 'bg-border'
            )}
          >
            <div className={clsx(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
              local.verifiedOnly ? 'left-7' : 'left-1'
            )} />
          </button>
        </div>

        <button
          onClick={() => { setFilters(local); onClose(); }}
          className="btn-primary"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default function Helpers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'rating',
    availability: 'All',
    minRating: 0,
    verifiedOnly: false,
  });
  const [loading] = useState(false); // Set true to see skeletons

  const filtered = useMemo(() => {
    let result = [...MOCK_HELPERS];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(h =>
        h.fullName.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q) ||
        h.specialties.some(s => s.toLowerCase().includes(q)) ||
        h.languages?.some(l => l.toLowerCase().includes(q))
      );
    }

    // Category
    if (category !== 'All') result = result.filter(h => h.type === category);

    // Filters
    if (filters.availability !== 'All') result = result.filter(h => h.availability === filters.availability);
    if (filters.minRating > 0)         result = result.filter(h => h.rating >= filters.minRating);
    if (filters.verifiedOnly)          result = result.filter(h => h.verified);

    // Sort
    switch (filters.sort) {
      case 'rating':     result.sort((a, b) => b.rating - a.rating);      break;
      case 'reviews':    result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'experience': result.sort((a, b) => parseInt(b.experience) - parseInt(a.experience)); break;
      case 'price_low':  result.sort((a, b) => parseInt(a.monthlyRate.replace(/\D/g,'')) - parseInt(b.monthlyRate.replace(/\D/g,''))); break;
      case 'price_high': result.sort((a, b) => parseInt(b.monthlyRate.replace(/\D/g,'')) - parseInt(a.monthlyRate.replace(/\D/g,''))); break;
    }

    return result;
  }, [search, category, filters]);

  const activeFilterCount = [
    filters.sort !== 'rating',
    filters.availability !== 'All',
    filters.minRating > 0,
    filters.verifiedOnly,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface px-5 pt-14 pb-5 border-b border-border">
        {/* Title Row */}
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-textPrimary">Discover Helpers</h1>
            <p className="text-xs text-textMuted font-medium mt-0.5">
              {filtered.length} available in your society
            </p>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className={clsx(
              'relative flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-sm transition-all',
              activeFilterCount > 0
                ? 'bg-primary text-white border-primary shadow-glow-primary'
                : 'bg-background text-textSecondary border-border'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-primary text-[10px] font-black rounded-full flex items-center justify-center border border-primary animate-badge-pop">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, cook, maid, laundry..."
              className="input-base pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-textMuted/20 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-textSecondary" />
              </button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border',
                category === cat.id
                  ? 'bg-primary text-white border-primary shadow-glow-primary'
                  : 'bg-surface text-textSecondary border-border hover:border-primary/30'
              )}
            >
              <span className="text-sm">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="pb-24">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Featured Collections (shown when no search/filter) */}
            {!search && category === 'All' && activeFilterCount === 0 && (
              <div className="mt-4 mb-2">
                <div className="px-4 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-black text-textPrimary uppercase tracking-wide">Collections</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar pb-2">
                  {FEATURED_COLLECTIONS.map(col => {
                    const count = MOCK_HELPERS.filter(col.filter).length;
                    return (
                      <div
                        key={col.id}
                        className="shrink-0 bg-gradient-primary rounded-2xl px-4 py-3 min-w-[140px] cursor-pointer card-hover shadow-glow-primary"
                        onClick={() => {/* future: deep link */}}
                      >
                        <p className="text-sm font-black text-white">{col.label}</p>
                        <p className="text-xs text-white/80 mt-0.5">{col.desc}</p>
                        <p className="text-lg font-black text-white mt-1">{count} helpers</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active sort indicator */}
            {filtered.length > 0 && (
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-textMuted" />
                <span className="text-xs text-textMuted font-semibold">
                  Sorted by: {SORT_OPTIONS.find(s => s.id === filters.sort)?.label}
                </span>
              </div>
            )}

            {/* Results */}
            <div className="px-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-black text-textPrimary text-lg">No helpers found</h3>
                  <p className="text-textMuted text-sm mt-1">Try adjusting your search or filters</p>
                  <button
                    onClick={() => { setSearch(''); setCategory('All'); setFilters({ sort: 'rating', availability: 'All', minRating: 0, verifiedOnly: false }); }}
                    className="mt-4 text-primary font-bold text-sm underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                filtered.map((helper, i) => (
                  <HelperCard key={helper.id} helper={helper} index={i} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Filter Sheet */}
      {showFilter && (
        <FilterSheet
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}
