/**
 * Profile Header Component
 * Displays user/guide profile info with avatar, cover photo, and social links
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Users, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

interface ProfileHeaderProps {
  name: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  joinedDate?: string;
  isGuide?: boolean;
  guideStats?: {
    totalTrips?: number;
    followers?: number;
    rating?: number;
  };
  socialLinks?: SocialLinks;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

const SocialIcon = ({ name, url }: { name: string; url?: string }) => {
  if (!url) return null;
  
  const iconMap = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
  };

  const Icon = iconMap[name as keyof typeof iconMap];
  if (!Icon) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
      title={name}
    >
      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
    </a>
  );
};

export default function ProfileHeader({
  name,
  tagline,
  bio,
  avatarUrl,
  coverUrl,
  location,
  joinedDate,
  isGuide,
  guideStats,
  socialLinks,
  isOwnProfile,
  onEditClick,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-sky-400 to-sky-600 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600" />
        )}
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar & Header Info */}
        <div className="flex flex-col sm:flex-row gap-4 -mt-16 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-lg border-4 border-white dark:border-slate-800 overflow-hidden bg-gray-200 dark:bg-slate-700">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {name}
                </h1>
                {tagline && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                    {tagline}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </div>
                  )}
                  {joinedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(joinedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {isOwnProfile && onEditClick && (
                <button
                  onClick={onEditClick}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}

        {/* Guide Stats */}
        {isGuide && guideStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
              <p className="text-sm text-sky-700 dark:text-sky-300 font-medium mb-1">
                Total Trips
              </p>
              <p className="text-2xl font-bold text-sky-900 dark:text-sky-100">
                {guideStats.totalTrips || 0}
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-1">
                Rating
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {guideStats.rating ? guideStats.rating.toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                Followers
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {guideStats.followers || 0}
              </p>
            </div>
          </div>
        )}

        {/* Social Links */}
        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Follow:
            </span>
            <div className="flex gap-2">
              <SocialIcon name="instagram" url={socialLinks.instagram} />
              <SocialIcon name="facebook" url={socialLinks.facebook} />
              <SocialIcon name="twitter" url={socialLinks.twitter} />
              <SocialIcon name="youtube" url={socialLinks.youtube} />
              <SocialIcon name="linkedin" url={socialLinks.linkedin} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
