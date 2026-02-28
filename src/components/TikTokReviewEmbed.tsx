'use client';

import { useEffect } from 'react';

interface TikTokReviewEmbedProps {
  videoId?: string | null;
  tiktokUrl?: string | null;
  compact?: boolean;
}

/**
 * Component to embed and display TikTok videos in customer reviews
 * Uses TikTok's native embed API for responsive, creator-credited embeds
 */
export function TikTokReviewEmbed({
  videoId,
  tiktokUrl,
  compact = false,
}: TikTokReviewEmbedProps) {
  useEffect(() => {
    // Load TikTok embed script
    if (window.tiktok) {
      (window.tiktok as any).embed.lib.render(document.body);
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.charset = 'UTF-8';
      document.body.appendChild(script);
    }
  }, [videoId]);

  if (!videoId && !tiktokUrl) {
    return null;
  }

  const id = videoId || tiktokUrl?.split('/video/')?.[1];
  if (!id) return null;

  return (
    <div className={`flex justify-center my-4 ${compact ? 'max-w-xs' : 'max-w-2xl'}`}>
      <blockquote
        className="tiktok-embed"
        cite={tiktokUrl || `https://www.tiktok.com/video/${id}`}
        data-video-id={id}
        style={{
          width: '100%',
          maxWidth: compact ? '280px' : '325px',
        }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            title="View on TikTok"
            href={tiktokUrl || `https://www.tiktok.com/video/${id}`}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            View on TikTok
          </a>
        </section>
      </blockquote>
    </div>
  );
}

export default TikTokReviewEmbed;
