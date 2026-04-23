import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_USER = {
  role: 'RESIDENT',
  name: 'Demo Resident',
  phone: '',
  societyId: 'SOC001',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  flat: 'A-101, SafeNest Society',
};

const SYSTEM_ACCOUNTS = {
  '9876543210': {
    role: 'RESIDENT',
    name: 'Priya Sharma',
    societyId: 'SOC001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    flat: 'B-204, Prestige Residency',
  },
  '8765432109': {
    role: 'GUARD',
    name: 'Rajan Kumar',
    societyId: 'SOC001',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
    post: 'Gate 1',
  },
  '7654321098': {
    role: 'ADMIN',
    name: 'Lakshmi Narayanan',
    societyId: 'SOC001',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    title: 'RWA President',
  }
};

export default function OTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const phone = location.state?.phone || '';

  useEffect(() => {
    inputsRef.current[0]?.focus();
    const interval = setInterval(() => {
      setResendTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInput = (idx, val) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = cleaned;
    setOtp(next);
    setError('');
    if (cleaned && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }

    setSuccess(true);
    setTimeout(() => {
      const matchedUser = SYSTEM_ACCOUNTS[phone] || { ...DEMO_USER };
      const user = { ...matchedUser, phone };
      login(user);
      
      if (user.role === 'GUARD') navigate('/guard');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/resident');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-primary pt-12 pb-10 px-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />

        <button
          onClick={() => navigate(-1)}
          className="relative z-10 mb-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="relative z-10">
          {success ? (
            <div className="flex flex-col items-center animate-badge-pop">
              <CheckCircle className="w-16 h-16 text-white mb-3" />
              <h2 className="text-white text-2xl font-black">Verified!</h2>
              <p className="text-white/80 text-sm">Redirecting you in...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-white text-2xl font-extrabold">Verify OTP</h2>
              <p className="text-white/80 text-sm mt-1">
                Sent to <span className="font-bold">+91 {phone}</span>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-t-4xl -mt-6 p-6 flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">Enter 6-digit OTP</p>
          <div className="flex gap-2 justify-between">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputsRef.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 rounded-2xl text-center text-xl font-black outline-none border-2 transition-all bg-background ${
                  digit
                    ? 'border-primary text-primary bg-primary/5 scale-105'
                    : 'border-border text-textPrimary'
                } focus:border-primary focus:scale-105`}
              />
            ))}
          </div>
          {error && <p className="text-primary text-xs font-semibold mt-3 animate-fade-in">{error}</p>}
        </div>

        <button onClick={handleVerify} className="btn-primary text-base">
          Verify & Login
        </button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-textMuted font-medium">
              Resend OTP in <span className="text-primary font-bold">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={() => setResendTimer(30)}
              className="text-sm text-primary font-bold"
            >
              Resend OTP
            </button>
          )}
        </div>

        <div className="bg-warningDark/10 border border-warningDark/20 rounded-2xl p-4">
          <p className="text-xs text-warningDark font-semibold">
            💡 Demo mode: Enter any 6 digits to proceed as Resident.
          </p>
        </div>
      </div>
    </div>
  );
}
