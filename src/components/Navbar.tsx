'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Menu, X, Mountain, User, LogOut, LayoutDashboard } from 'lucide-react';

const supabase = createClient();

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
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
          ? 'bg-summit-950/95 backdrop-blur-md border-b border-summit-800 shadow-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-summit-200 transition"
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
                    ? 'text-white bg-summit-700/50'
                    : 'text-summit-200 hover:text-white hover:bg-summit-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-summit-200 hover:text-white hover:bg-summit-800/50 rounded-lg transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-summit-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm text-summit-200 hover:text-white transition font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup-customer"
                  className="px-5 py-2 text-sm bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold transition shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-summit-950/98 backdrop-blur-md border-b border-summit-800 px-4 py-4 space-y-1">
          <Link
            href="/trips"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-summit-200 hover:text-white hover:bg-summit-800/50 rounded-lg transition"
          >
            Browse Trips
          </Link>
          <Link
            href="/guides"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-summit-200 hover:text-white hover:bg-summit-800/50 rounded-lg transition"
          >
            Guides
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-summit-200 hover:text-white hover:bg-summit-800/50 rounded-lg transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-3 text-summit-300 hover:text-white transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-summit-200 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup-customer"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 bg-blue-500 text-white rounded-lg text-center font-semibold"
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
