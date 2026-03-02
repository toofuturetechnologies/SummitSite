/**
 * User Profile Page
 * /profile/[userId]
 * 
 * Shows user profile with activity feed
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/ProfileHeader';
import ActivityFeed from '@/components/ActivityFeed';
import { Loader } from 'lucide-react';

const supabase = createClient();

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  location?: string;
  created_at: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [params.userId]);

  const loadProfile = async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/auth/login?returnTo=/profile');
        return;
      }

      setUser(authUser);
      setIsOwnProfile(authUser.id === params.userId);

      // Get profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.userId)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-6 rounded-lg max-w-md text-center">
          <p className="font-semibold mb-2">Profile Not Found</p>
          <p className="text-sm">{error || 'This user profile does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          name={profile.name}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          coverUrl={profile.cover_url}
          location={profile.location}
          joinedDate={profile.created_at}
          socialLinks={profile.social_media}
          isOwnProfile={isOwnProfile}
          onEditClick={() => {
            if (isOwnProfile) {
              router.push('/profile/edit');
            }
          }}
        />

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
              {profile.email}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Member Since</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Activity
          </h2>
          <ActivityFeed userId={params.userId} />
        </div>
      </div>
    </div>
  );
}
