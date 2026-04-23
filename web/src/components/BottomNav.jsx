import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Shield, LayoutGrid, Scan, ClipboardList, UserCheck, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navConfigs = {
  RESIDENT: [
    { to: '/resident',            icon: Home,      label: 'Home' },
    { to: '/resident/helpers',    icon: Users,     label: 'Discover' },
    { to: '/resident/household',  icon: Shield,    label: 'Household' },
  ],
  GUARD: [
    { to: '/guard',        icon: Scan,          label: 'Scanner' },
    { to: '/guard/log',    icon: ClipboardList, label: 'In-Society' },
  ],
  ADMIN: [
    { to: '/admin',         icon: LayoutGrid,   label: 'Overview' },
    { to: '/admin/users',   icon: UserCheck,    label: 'Members' },
    { to: '/admin/cards',   icon: CreditCard,   label: 'Cards' },
  ],
};

const roleAccentMap = {
  RESIDENT: 'text-primary',
  GUARD: 'text-guardBlue',
  ADMIN: 'text-adminPurple',
};

const roleBgMap = {
  RESIDENT: 'bg-primary/10',
  GUARD: 'bg-guardBlue/10',
  ADMIN: 'bg-adminPurple/10',
};

export default function BottomNav({ role }) {
  const { user } = useAuth();
  const tabs = navConfigs[role] || navConfigs.RESIDENT;
  const accent = roleAccentMap[role] || 'text-primary';
  const activeBg = roleBgMap[role] || 'bg-primary/10';

  return (
    <nav className="bg-surface border-t border-border shadow-bottom-nav px-2 py-3 mb-4 mx-4 rounded-3xl flex-shrink-0 z-50">
      <div className="flex items-center justify-around">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/resident' || to === '/guard' || to === '/admin'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-200',
                isActive ? [accent, activeBg, 'scale-105'] : 'text-textMuted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5 transition-all', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={clsx('text-[10px] font-bold tracking-wide', isActive ? 'opacity-100' : 'opacity-60')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* Profile Avatar in Bottom Nav */}
        <NavLink 
          to="/profile"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 px-4 py-1.5 transition-all duration-200 rounded-2xl',
              isActive ? [accent, activeBg, 'scale-105'] : 'text-textMuted'
            )
          }
        >
          {({ isActive }) => (
            <>
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50&auto=format&fit=crop'} 
                className={clsx(
                  "w-6 h-6 rounded-full object-cover transition-all",
                  isActive ? "border-2 border-current shadow-md scale-110" : "border border-border opacity-80"
                )}
                alt="Profile"
              />
              <span className={clsx('text-[10px] font-bold tracking-wide', isActive ? 'opacity-100' : 'opacity-60')}>
                Profile
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
