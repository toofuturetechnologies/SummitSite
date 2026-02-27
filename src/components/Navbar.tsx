'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Menu, X, Mountain, User, LogOut, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const supabase = createClient();

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isGuide, setIsGuide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: guideData } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        setIsGuide(!!guideData);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('guides')
          .select('id')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: guideData }: { data: any }) => setIsGuide(!!guideData));
      } else {
        setIsGuide(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-slate-900 dark:bg-slate-900/98 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 dark:border-slate-700 shadow-lg'
          : 'bg-black/30 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 transition ${
              scrolled ? 'text-gray-900 dark:text-gray-100 dark:text-gray-100' : 'text-white hover:text-white/90'
            }`}
          >
            <Mountain className="w-7 h-7 text-blue-400" />
            <span className="text-xl font-black tracking-tight">Summit</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/trips', label: 'Browse Trips' },
              { href: '/guides', label: 'Guides' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.href)
                    ? scrolled
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-white bg-white dark:bg-slate-900 dark:bg-slate-900/20'
                    : scrolled
                    ? 'text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-white hover:text-white/90 hover:bg-white dark:bg-slate-900 dark:bg-slate-900/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={isGuide ? "/dashboard" : "/customer-dashboard"}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                    scrolled
                      ? 'text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-white hover:text-white/90 hover:bg-white dark:bg-slate-900 dark:bg-slate-900/10'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
                    scrolled
                      ? 'text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-red-600'
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`px-4 py-2 text-sm transition font-medium ${
                    scrolled
                      ? 'text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:text-blue-600'
                      : 'text-white hover:text-white/90'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup-customer"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden p-2 transition ${scrolled ? 'text-gray-900 dark:text-gray-100 dark:text-gray-100 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300' : 'text-white hover:text-white/80'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-4 space-y-1 shadow-lg">
          <Link
            href="/trips"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-gray-900 dark:text-gray-100 dark:text-gray-100 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            Browse Trips
          </Link>
          <Link
            href="/guides"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-gray-900 dark:text-gray-100 dark:text-gray-100 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            Guides
          </Link>
          {user ? (
            <>
              <Link
                href={isGuide ? "/dashboard" : "/customer-dashboard"}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-900 dark:text-gray-100 dark:text-gray-100 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-3 text-gray-900 dark:text-gray-100 dark:text-gray-100 font-medium hover:text-red-600 hover:bg-red-50 transition rounded-lg"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-900 dark:text-gray-100 dark:text-gray-100 font-medium hover:text-blue-600 hover:bg-blue-50 transition rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup-customer"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 bg-blue-600 text-white rounded-lg text-center font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
