'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';

const supabase = createClient();

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  certifications?: string;
  challenge_badges?: string[];
}

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isGuide, setIsGuide] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
        
        // Check if guide
        const { data: guideData } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', authUser.id)
          .single();
        
        setIsGuide(!!guideData);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = isGuide
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Trips', href: '/dashboard' },
        { label: 'Messages', href: '/dashboard/messages' },
        { label: 'Earnings', href: '/dashboard/earnings' },
        { label: 'Profile', href: '/dashboard/profile' },
        { label: 'UGC', href: '/dashboard/ugc' },
      ]
    : [
        { label: 'Dashboard', href: '/customer-dashboard' },
        { label: 'Trips', href: '/trips' },
        { label: 'Calendar', href: '/customer-dashboard' },
        { label: 'Messages', href: '/customer-dashboard' },
        { label: 'Profile', href: '/customer-dashboard' },
        { label: 'Referral Earnings', href: '/dashboard/referral-earnings' },
      ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-50 text-gray-900 dark:text-gray-100 dark:text-gray-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 w-64 h-screen bg-white dark:bg-slate-900 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 dark:border-slate-700 p-6 overflow-y-auto transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:translate-x-0 z-40`}
      >
        {/* Profile Section */}
        {profile && (
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {profile.full_name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 text-sm">{profile.full_name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-400">{isGuide ? 'Guide' : 'Adventurer'}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-xs text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-3">{profile.bio}</p>
            )}

            {/* Certifications */}
            {profile.certifications && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {profile.certifications.split(',').map((cert) => (
                    <span
                      key={cert.trim()}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {cert.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.challenge_badges && profile.challenge_badges.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  {profile.challenge_badges.map((badge) => (
                    <div
                      key={badge}
                      className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-lg"
                      title={badge}
                    >
                      🏅
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-gray-900 dark:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:bg-slate-800 dark:bg-slate-800 rounded-lg transition text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30 top-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
