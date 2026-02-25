'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient();

interface Guide {
  id: string;
  user_id: string;
  display_name: string;
  tagline?: string;
  bio?: string;
  base_location?: string;
  years_experience?: number;
  specialties?: string[];
  languages?: string[];
  certifications?: any[];
  profile_video_url?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    tagline: '',
    bio: '',
    base_location: '',
    years_experience: 0,
    specialties: '',
    languages: '',
    profile_video_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        setUser(authData.user);

        // Fetch guide profile
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError) {
          setError('Guide profile not found');
          return;
        }

        setGuide(guideData);
        setFormData({
          display_name: guideData.display_name || '',
          tagline: guideData.tagline || '',
          bio: guideData.bio || '',
          base_location: guideData.base_location || '',
          years_experience: guideData.years_experience || 0,
          specialties: (guideData.specialties || []).join(', '),
          languages: (guideData.languages || []).join(', '),
          profile_video_url: guideData.profile_video_url || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!guide) throw new Error('Guide not found');

      const updateData = {
        display_name: formData.display_name,
        tagline: formData.tagline,
        bio: formData.bio,
        base_location: formData.base_location,
        years_experience: parseInt(formData.years_experience.toString()) || 0,
        specialties: formData.specialties
          ? formData.specialties.split(',').map(s => s.trim())
          : [],
        languages: formData.languages
          ? formData.languages.split(',').map(l => l.trim())
          : [],
        profile_video_url: formData.profile_video_url || null,
      };

      const { error: updateError } = await supabase
        .from('guides')
        .update(updateData)
        .eq('id', guide.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setGuide({ ...guide, ...updateData });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-600"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
        <p className="text-gray-600 mb-8">Update your guide information</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 text-green-100 p-4 rounded-lg mb-6">
            ✅ Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Display Name */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Display Name *
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="How you appear to customers"
            />
          </div>

          {/* Tagline */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Professional Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="e.g., 'Expert climber with 15+ years'"
            />
            <p className="text-gray-600 text-xs mt-2">
              A short, catchy description that appears on your profile
            </p>
          </div>

          {/* Bio */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Biography
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
              rows={4}
              placeholder="Tell customers about your experience, certifications, and passion for guiding..."
            />
            <p className="text-gray-600 text-xs mt-2">
              Max 500 characters. Help customers get to know you better.
            </p>
          </div>

          {/* Base Location */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Base Location
            </label>
            <input
              type="text"
              name="base_location"
              value={formData.base_location}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="e.g., 'Colorado, USA'"
            />
          </div>

          {/* Years of Experience */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
            />
          </div>

          {/* Specialties */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Specialties
            </label>
            <input
              type="text"
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="e.g., mountaineering, rock_climbing, ski_touring (separate with commas)"
            />
            <p className="text-gray-600 text-xs mt-2">
              Separate multiple specialties with commas
            </p>
          </div>

          {/* Languages */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Languages Spoken
            </label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="e.g., English, Spanish, French (separate with commas)"
            />
            <p className="text-gray-600 text-xs mt-2">
              Languages you can guide in
            </p>
          </div>

          {/* Video URL */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Profile Video URL (Optional)
            </label>
            <input
              type="url"
              name="profile_video_url"
              value={formData.profile_video_url}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="https://vimeo.com/... or https://youtube.com/..."
            />
            <p className="text-gray-600 text-xs mt-2">
              Share a video introducing yourself to customers
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-200 hover:bg-summit-600 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
