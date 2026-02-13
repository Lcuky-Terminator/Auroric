'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Save, Bell, Lock, Palette, LogOut, Check } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const { currentUser, isLoggedIn, updateProfile, logout, openAuthModal } = useApp();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'account' | 'privacy' | 'notifications' | 'appearance'>('account');
  const [saved, setSaved] = useState(false);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [emailOnNewFollower, setEmailOnNewFollower] = useState(true);
  const [emailOnPinInteraction, setEmailOnPinInteraction] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setDisplayName(currentUser.displayName);
      setBio(currentUser.bio);
      setWebsite(currentUser.website);
      setPrivateProfile(currentUser.settings.privateProfile);
      setShowActivity(currentUser.settings.showActivity);
      setAllowMessages(currentUser.settings.allowMessages);
      setAllowNotifications(currentUser.settings.allowNotifications);
      setEmailOnNewFollower(currentUser.settings.emailOnNewFollower);
      setEmailOnPinInteraction(currentUser.settings.emailOnPinInteraction);
    }
  }, [currentUser]);

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">Sign in to access settings</h1>
            <p className="text-foreground/60 mb-6">You need to be logged in to manage your account settings.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => openAuthModal('login')} className="luxury-button-outline px-6 py-2.5">Log In</button>
              <button onClick={() => openAuthModal('signup')} className="luxury-button px-6 py-2.5">Sign Up</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveAccount = async () => {
    await updateProfile({ email, displayName, bio, website });
    showSaved();
  };

  const handleSavePrivacy = async () => {
    await updateProfile({ settings: { ...currentUser.settings, privateProfile, showActivity, allowMessages } });
    showSaved();
  };

  const handleSaveNotifications = async () => {
    await updateProfile({ settings: { ...currentUser.settings, allowNotifications, emailOnNewFollower, emailOnPinInteraction } });
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 w-full py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Settings & Preferences</h1>
            {saved && (
              <div className="flex items-center gap-2 text-green-400 animate-slideUp">
                <Check className="w-5 h-5" /> Saved!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="space-y-2 sticky top-20">
                {[
                  { id: 'account', label: 'Account', icon: '👤' },
                  { id: 'privacy', label: 'Privacy & Safety', icon: '🔒' },
                  { id: 'notifications', label: 'Notifications', icon: '🔔' },
                  { id: 'appearance', label: 'Appearance', icon: '🎨' },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium smooth-transition ${activeSection === item.id ? 'bg-accent/20 text-accent border border-accent/50' : 'text-foreground/70 hover:bg-card/50 hover:text-foreground'}`}>
                    <span className="mr-2">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="lg:col-span-3">
              {activeSection === 'account' && (
                <div className="pin-card p-8 animate-slideUp">
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  <div className="space-y-6 mb-8">
                    <div>
                      <label htmlFor="settings-email" className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                      <input type="email" id="settings-email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent/50" />
                    </div>
                    <div>
                      <label htmlFor="settings-displayname" className="block text-sm font-semibold text-foreground mb-2">Display Name</label>
                      <input type="text" id="settings-displayname" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent/50" />
                    </div>
                    <div>
                      <label htmlFor="settings-bio" className="block text-sm font-semibold text-foreground mb-2">Bio</label>
                      <textarea id="settings-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3}
                        className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent/50 resize-none" />
                    </div>
                    <div>
                      <label htmlFor="settings-website" className="block text-sm font-semibold text-foreground mb-2">Website URL</label>
                      <input type="url" id="settings-website" value={website} onChange={e => setWebsite(e.target.value)}
                        className="w-full bg-background/50 border border-border/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent/50" />
                    </div>
                  </div>
                  <button onClick={handleSaveAccount} className="luxury-button flex items-center gap-2">
                    <Save className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="pin-card p-8 animate-slideUp space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Privacy & Safety</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Private Profile', desc: 'Only approved followers can see your pins', value: privateProfile, set: setPrivateProfile },
                      { label: 'Show Activity Status', desc: "Let others see when you're active", value: showActivity, set: setShowActivity },
                      { label: 'Allow Direct Messages', desc: 'Let followers send you messages', value: allowMessages, set: setAllowMessages },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between pb-4 border-b border-border/30">
                        <label className="flex items-center justify-between w-full cursor-pointer">
                          <div>
                            <p className="font-semibold text-foreground">{item.label}</p>
                            <p className="text-sm text-foreground/60">{item.desc}</p>
                          </div>
                          <input type="checkbox" checked={item.value} onChange={e => item.set(e.target.checked)} className="w-5 h-5 rounded accent cursor-pointer" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSavePrivacy} className="luxury-button flex items-center gap-2 mt-6">
                    <Lock className="w-5 h-5" /> Save Privacy Settings
                  </button>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="pin-card p-8 animate-slideUp space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Enable Notifications', desc: 'Receive in-app notifications', value: allowNotifications, set: setAllowNotifications },
                      { label: 'New Follower Email', desc: 'Get notified when someone follows you', value: emailOnNewFollower, set: setEmailOnNewFollower },
                      { label: 'Pin Interaction Email', desc: 'Get notified on pin interactions', value: emailOnPinInteraction, set: setEmailOnPinInteraction },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between pb-4 border-b border-border/30">
                        <label className="flex items-center justify-between w-full cursor-pointer">
                          <div>
                            <p className="font-semibold text-foreground">{item.label}</p>
                            <p className="text-sm text-foreground/60">{item.desc}</p>
                          </div>
                          <input type="checkbox" checked={item.value} onChange={e => item.set(e.target.checked)} className="w-5 h-5 rounded accent cursor-pointer" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSaveNotifications} className="luxury-button flex items-center gap-2 mt-6">
                    <Bell className="w-5 h-5" /> Save Preferences
                  </button>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="pin-card p-8 animate-slideUp">
                  <h2 className="text-2xl font-bold mb-6">Appearance</h2>
                  <div className="mb-8">
                    <p className="font-semibold text-foreground mb-4">Theme</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border-2 border-accent bg-accent/10">
                        <Palette className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-center">Dark (Active)</p>
                      </div>
                      <div className="p-4 rounded-lg border-2 border-border/30 opacity-50 cursor-not-allowed">
                        <Palette className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-center">Light (Coming Soon)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/30">
            <button onClick={handleLogout} className="luxury-button-outline flex items-center gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
