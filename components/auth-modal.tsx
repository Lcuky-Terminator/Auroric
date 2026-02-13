'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, signup, loginWithGoogle } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
  });

  // Sync mode when initialMode prop changes (e.g. user clicks Log In vs Sign Up)
  React.useEffect(() => {
    setMode(initialMode);
    setError('');
    setFormData({ username: '', displayName: '', email: '', password: '' });
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(formData.username, formData.password);
        if (success) {
          onClose();
          setFormData({ username: '', displayName: '', email: '', password: '' });
        } else {
          setError('Invalid credentials. Try "alexdesigner" with password "password123".');
        }
      } else {
        if (!formData.username || !formData.displayName || !formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const success = await signup(formData.username, formData.displayName, formData.email, formData.password);
        if (success) {
          onClose();
          setFormData({ username: '', displayName: '', email: '', password: '' });
        } else {
          setError('Username or email already exists');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-md mx-4 animate-slideUp relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-foreground/60 hover:text-foreground smooth-transition">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mx-auto mb-3">
            <span className="text-accent-foreground font-bold text-xl">A</span>
          </div>
          <h2 className="text-2xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Join Auroric'}</h2>
          <p className="text-foreground/60 text-sm mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/20 text-destructive border border-destructive/30 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={async () => {
            setGoogleLoading(true);
            setError('');
            try {
              // Trigger Google OAuth — redirects to Google login page
              await signIn('google', { callbackUrl: window.location.origin });
            } catch {
              setError('Google sign-in failed. Please try again.');
              setGoogleLoading(false);
            }
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border/30 rounded-lg bg-background/50 hover:bg-background/80 smooth-transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-medium">
            {googleLoading ? 'Connecting...' : `${mode === 'login' ? 'Sign in' : 'Sign up'} with Google`}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-xs text-foreground/40 font-medium">OR</span>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your full name"
                className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              {mode === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              placeholder={mode === 'login' ? 'alexdesigner' : 'Choose a username'}
              className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>

          <button type="submit" className="luxury-button w-full py-3" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-foreground/60">
              Don&apos;t have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); }} className="text-accent hover:text-accent/80 font-semibold">
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-foreground/60">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-accent hover:text-accent/80 font-semibold">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
