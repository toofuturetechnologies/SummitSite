/**
 * TikTok Video ID Extraction Utility
 * Extracts video ID from various TikTok URL formats for native embedding
 */

export function extractTikTokVideoId(url: string): string | null {
  if (!url) return null;

  // Remove whitespace
  const trimmedUrl = url.trim();

  // Pattern 1: https://www.tiktok.com/@username/video/1234567890
  const pattern1 = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
  const match1 = trimmedUrl.match(pattern1);
  if (match1) return match1[1];

  // Pattern 2: https://vt.tiktok.com/abcdef (short URL - requires extraction)
  // For short URLs, we can't extract the video ID client-side, so we need server-side redirect
  const pattern2 = /(?:https?:\/\/)?(?:vt|vm)\.tiktok\.com\/[\w-]+/;
  if (pattern2.test(trimmedUrl)) {
    return null; // Return null to indicate short URL (requires API call)
  }

  // Pattern 3: https://www.tiktok.com/video/1234567890 (old format)
  const pattern3 = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/video\/(\d+)/;
  const match3 = trimmedUrl.match(pattern3);
  if (match3) return match3[1];

  return null;
}

/**
 * Validate TikTok URL format
 */
export function isValidTikTokUrl(url: string): boolean {
  if (!url) return false;
  const trimmedUrl = url.trim();
  
  // Check if URL contains tiktok.com
  if (!trimmedUrl.includes('tiktok.com')) return false;

  // Check basic URL format
  try {
    new URL(trimmedUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get TikTok embed iframe HTML
 * Uses native TikTok embed API for responsive, creator-credited embeds
 */
export function getTikTokEmbedCode(videoId: string): string {
  if (!videoId) return '';
  
  // Native TikTok embed using their official API
  return `<blockquote class="tiktok-embed" data-video-id="${videoId}" style="max-width: 325px;">
    <section>
      <a target="_blank" title="@tiktok" href="https://www.tiktok.com/@tiktok">@tiktok</a>
    </section>
  </blockquote>
  <script async src="https://www.tiktok.com/embed.js" charset="UTF-8"></script>`;
}

/**
 * Create embed URL for iframe (alternative method)
 */
export function getTikTokIframeUrl(videoId: string): string {
  if (!videoId) return '';
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}
