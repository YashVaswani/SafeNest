import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Demo mode: pick a role to simulate JWT login
const DEMO_ACCOUNTS = [
  {
    role: 'RESIDENT',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    societyId: 'SOC001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    flat: 'B-204, Prestige Residency',
  },
  {
    role: 'GUARD',
    name: 'Rajan Kumar',
    phone: '+91 99887 76655',
    societyId: 'SOC001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajan',
    post: 'Gate 1',
  },
  {
    role: 'ADMIN',
    name: 'Mrs. Lakshmi Narayanan',
    phone: '+91 91234 56789',
    societyId: 'SOC001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lakshmi',
    title: 'RWA President',
  },
];

export default function Login() {
  const [phone, setPhone] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (phone.replace(/\D/g, '').length >= 10) {
      navigate('/otp', { state: { phone } });
    }
  };

  const handleDemoLogin = (account) => {
    login(account);
    if (account.role === 'GUARD') navigate('/guard');
    else if (account.role === 'ADMIN') navigate('/admin');
    else navigate('/resident');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-primary pt-16 pb-12 px-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute top-20 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight">SafeNest</h1>
              <p className="text-white/70 text-xs font-medium">Your society, secured</p>
            </div>
          </div>

          <h2 className="text-white text-3xl font-extrabold leading-snug mb-2">
            Welcome back 👋
          </h2>
          <p className="text-white/80 text-sm font-medium">
            Sign in with your registered mobile number
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-surface rounded-t-4xl -mt-6 p-6 flex flex-col gap-6 shadow-card">
        <div>
          <label className="text-xs font-bold text-textMuted uppercase tracking-widest mb-3 block">
            Mobile Number
          </label>
          <div className="flex items-center gap-3 bg-background rounded-2xl border border-border p-1 pl-4">
            <span className="text-sm font-bold text-textSecondary whitespace-nowrap flex items-center gap-1">
              🇮🇳 +91
            </span>
            <div className="w-px h-6 bg-border" />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit number"
              className="flex-1 bg-transparent py-3.5 pr-4 text-base font-semibold text-textPrimary outline-none placeholder:text-textMuted"
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="btn-primary text-base"
        >
          Get OTP <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-textMuted font-medium">
          By continuing, you agree to our{' '}
          <span className="text-primary font-semibold">Terms of Service</span> and{' '}
          <span className="text-primary font-semibold">Privacy Policy</span>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-textMuted font-semibold">OR DEMO</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Demo Role Selector */}
        <div>
          <button
            onClick={() => setShowDemo(v => !v)}
            className="btn-secondary text-sm"
          >
            Try without login
            <ChevronDown className={`w-4 h-4 transition-transform ${showDemo ? 'rotate-180' : ''}`} />
          </button>

          {showDemo && (
            <div className="mt-3 space-y-3 animate-slide-up">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoLogin(acc)}
                  className="w-full flex items-center gap-4 p-4 bg-background rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left card-hover"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-11 h-11 rounded-full bg-border object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-textPrimary">{acc.name}</p>
                    <p className="text-xs text-textMuted">{acc.phone}</p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    acc.role === 'RESIDENT' ? 'bg-residentLight text-residentGreen' :
                    acc.role === 'GUARD'    ? 'bg-guardLight text-guardBlue' :
                                              'bg-adminLight text-adminPurple'
                  }`}>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
