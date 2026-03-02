/**
 * Admin Layout
 * Sidebar navigation, auth check, route protection
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  FileText,
  AlertCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminData {
  isAdmin: boolean;
  role: string;
  name: string;
}

const supabase = createClient();

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get current session with access token
        console.log('🔐 Admin layout: Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('❌ Admin layout: No session found');
          router.push('/auth/login?returnTo=/admin');
          return;
        }

        console.log('✅ Admin layout: Session found, calling admin check API...');
        const accessToken = session.access_token;

        // Call admin check with Authorization header
        const res = await fetch('/api/admin/check', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!res.ok) {
          console.log('❌ Admin layout: Admin check failed:', res.status);
          router.push('/');
          return;
        }

        const data = await res.json();
        console.log('✅ Admin layout: Admin check passed, isAdmin:', data.isAdmin);
        
        if (!data.isAdmin) {
          console.log('❌ Admin layout: User is not admin');
          router.push('/');
          return;
        }

        setAdminData(data);
      } catch (error) {
        console.error('❌ Admin check failed:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-500 mx-auto mb-4"></div>
          <p className="text-sky-600 dark:text-sky-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!adminData?.isAdmin) {
    return (
      <div className="min-h-screen bg-sky-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/ugc', label: 'Content', icon: FileText },
    { href: '/admin/disputes', label: 'Disputes', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-sky-200 dark:border-slate-700 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static`}
      >
        {/* Header */}
        <div className="h-16 border-b border-sky-200 dark:border-slate-700 px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-sky-600 dark:text-sky-400">Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-sky-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-6 border-b border-sky-200 dark:border-slate-700">
          <p className="text-sm text-sky-600 dark:text-sky-400">Logged in as</p>
          <p className="font-medium text-sky-900 dark:text-sky-100">{adminData.name}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-medium rounded">
            {adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1)}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-900 dark:text-sky-100 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-sky-200 dark:border-slate-700">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Mobile Toggle */}
        <div className="md:hidden h-16 bg-white dark:bg-slate-800 border-b border-sky-200 dark:border-slate-700 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-sky-100 dark:hover:bg-slate-700 rounded"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
