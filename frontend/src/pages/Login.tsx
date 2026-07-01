import React, { useState } from 'react';
import { Lock, Mail, User, Phone, MapPin, Eye, EyeOff, AlertTriangle, UserPlus, LogIn } from 'lucide-react';
import { API_BASE_URL } from '../utils';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigate: (page: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [residence, setResidence] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name || !phoneNumber || !residence) {
        setError('Please enter your name, phone number, and place of residence.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = activeTab === 'signin' ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/signup`;
      const payload = activeTab === 'signin' 
        ? { email, password }
        : { name, email, password, phoneNumber, residence };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(activeTab === 'signin' ? 'Sign in successful!' : 'Account registered successfully!');
        
        // Wait a short moment to show success state, then call handler
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
          // Redirection will be handled by App.tsx handleLoginSuccess
        }, 800);

      } else {
        setError(data.error || 'Authentication failed. Please verify your inputs.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed. Please ensure the backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.05),transparent_45%)] pointer-events-none" />
        
        <div className="text-center relative space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            {activeTab === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            {activeTab === 'signin' 
              ? 'Sign in to access your orders, track purchases, or access the admin console.'
              : 'Register to start ordering premium cakes and snacks from Jinja & Bugembe locations.'
            }
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            id="tab-signin-btn"
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-signup-btn"
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'signup'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2.5 font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 font-semibold">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span>{success}</span>
          </div>
        )}

        {/* Credentials helper banner (only for signin to assist testing) */}
        {activeTab === 'signin' && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center text-[11px] text-slate-400">
            <span className="font-bold text-amber-500">Quick Testing Accounts:</span> <br />
            <div className="mt-1">
              Admin: <code className="font-mono text-white bg-slate-900 px-1 py-0.5 rounded">admin@skcakes.com</code> / <code className="font-mono text-white bg-slate-900 px-1 py-0.5 rounded">admin123</code>
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              * Or create a fresh Customer user account under the <strong className="text-slate-400 font-bold">Sign Up</strong> tab!
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {activeTab === 'signup' && (
            <>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white text-xs outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Phone Number With Country Code</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white text-xs outline-none transition"
                    placeholder="+256 700 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Place of Residence</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-residence-input"
                    type="text"
                    required
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white text-xs outline-none transition"
                    placeholder="Jinja, Uganda"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white text-xs outline-none transition"
                placeholder="customer@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-11 py-2.5 text-white text-xs outline-none transition"
                placeholder="••••••••"
              />
              <button
                id="login-toggle-password-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {activeTab === 'signup' && (
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="signup-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-11 py-2.5 text-white text-xs outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                {activeTab === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
