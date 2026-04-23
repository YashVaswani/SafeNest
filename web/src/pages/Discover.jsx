import React, { useState, useEffect } from 'react';
import { Search, Star, Verified, CheckCircle, ChevronRight, SearchX } from 'lucide-react';
import { getHelpers } from '../api';
import clsx from 'clsx';

const CATEGORIES = ['All', 'Cook', 'Maid', 'Driver', 'Nanny'];

export default function Discover() {
  const [helpers, setHelpers] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHelpers();
  }, []);

  const loadHelpers = async () => {
    setLoading(true);
    try {
      const res = await getHelpers();
      if (res.data.success) {
        setHelpers(res.data.helpers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = helpers.filter(h => {
    const matchesSearch = h.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          (h.type && h.type.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || h.type === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface sticky top-0 z-10 shadow-sm">
        <div className="p-4 safe-top">
          <h1 className="text-xl font-bold text-textPrimary">Discover Services</h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for cook, maid, nanny..."
              className="w-full bg-background rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 ring-primary/20 transition-all text-textPrimary"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                category === cat 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "bg-background text-textSecondary hover:bg-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <SearchX className="w-16 h-16 text-textMuted/50 mb-4" />
            <p className="text-textSecondary font-medium">No services found matching your criteria</p>
          </div>
        ) : (
          filtered.map(helper => (
            <div key={helper.id} className="bg-surface rounded-2xl shadow-sm border border-black/5 overflow-hidden active:scale-[0.98] transition-transform">
              <div className="p-4 flex items-start gap-4">
                <img 
                  src={helper.profilePhotoUrl || 'https://via.placeholder.com/150'} 
                  alt={helper.fullName} 
                  className="w-16 h-16 rounded-full object-cover bg-background"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-textPrimary truncate">{helper.fullName}</h3>
                    <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-lg shrink-0">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      <span className="text-xs font-bold text-textPrimary">{helper.rating || 'New'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-primary">{helper.type || 'Support Staff'}</span>
                    <span className="text-textMuted text-xs">•</span>
                    <span className="text-sm font-medium text-textSecondary">{helper.hourlyRate || 'Rates vary'}</span>
                  </div>

                  {helper.specialties && helper.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {helper.specialties.map(s => (
                        <span key={s} className="px-2 py-1 bg-background text-textSecondary text-xs font-semibold rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-black/[0.02]">
                <div className="flex items-center gap-1.5 text-success">
                  <Verified className="w-4 h-4" />
                  <span className="text-xs font-bold">Trusted in {helper.societies || 1} societies</span>
                </div>
                <div className="flex items-center gap-1 text-primary text-xs font-bold">
                  View Profile <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
