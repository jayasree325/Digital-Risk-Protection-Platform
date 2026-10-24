import React from 'react';
import { Globe, Smartphone, Share2 } from 'lucide-react';

export interface PlatformBadgeProps {
  platform: string;
  type?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  iconOnly?: boolean;
}

/**
 * Normalizes platform strings like "X (Twitter)", "Google Play Store", "Instagram Profile", etc.
 */
export function normalizePlatform(raw: string = ''): 'instagram' | 'twitter' | 'telegram' | 'google-play' | 'apple' | 'facebook' | 'linkedin' | 'tiktok' | 'web' | 'other' {
  const p = raw.toLowerCase().trim();
  if (p.includes('instagram') || p.includes('insta')) return 'instagram';
  if (p.includes('twitter') || p === 'x' || p.includes('x /') || p.includes('x (')) return 'twitter';
  if (p.includes('telegram') || p.includes('tg')) return 'telegram';
  if (p.includes('play') || p.includes('android') || p.includes('apk')) return 'google-play';
  if (p.includes('apple') || p.includes('app store') || p.includes('ios')) return 'apple';
  if (p.includes('facebook') || p.includes('meta')) return 'facebook';
  if (p.includes('linkedin')) return 'linkedin';
  if (p.includes('tiktok')) return 'tiktok';
  if (p.includes('web') || p.includes('domain') || p.includes('site') || p.includes('portal') || p.includes('dns') || p.includes('whois')) return 'web';
  return 'other';
}

/**
 * Pure Vector SVG Platform Logos
 */
export const PlatformLogo: React.FC<{ platform: string; className?: string; size?: 'xs' | 'sm' | 'md' | 'lg' }> = ({
  platform,
  className = '',
  size = 'sm',
}) => {
  const norm = normalizePlatform(platform);

  const sizePx = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  switch (norm) {
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} flex-shrink-0`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Instagram logo"
        >
          <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad-badge)" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad-badge)" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad-badge)" />
          <defs>
            <linearGradient id="ig-grad-badge" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF543E" />
              <stop offset="0.4" stopColor="#E1306C" />
              <stop offset="0.7" stopColor="#C13584" />
              <stop offset="1" stopColor="#833AB4" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'twitter':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} text-white flex-shrink-0`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="X / Twitter logo"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'telegram':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} text-[#2AABEE] flex-shrink-0`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Telegram logo"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      );

    case 'google-play':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} flex-shrink-0`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Google Play logo"
        >
          <path fill="#4285F4" d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" />
          <path fill="#FBBC04" d="M17.2 8.6L13.8 12l3.4 3.4 3.8-2.2c1.1-.6 1.1-1.7 0-2.3l-3.8-2.3z" />
          <path fill="#EA4335" d="M3.6 22.2l10.2-10.2 3.4 3.4-11.8 6.8c-.8.5-1.5.3-1.8 0z" />
          <path fill="#34A853" d="M3.6 1.8l1.8 0 11.8 6.8-3.4 3.4-10.2-10.2z" />
        </svg>
      );

    case 'apple':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} text-slate-200 flex-shrink-0`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Apple App Store logo"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
        </svg>
      );

    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} text-[#1877F2] flex-shrink-0`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Facebook logo"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} text-[#0A66C2] flex-shrink-0`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="LinkedIn logo"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${sizePx} ${className} text-[#00F2FE] flex-shrink-0`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="TikTok logo"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.41a6.33 6.33 0 0 0-5.96 6.36 6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.83-4.47V9.33a8.16 8.16 0 0 0 4.96 1.67V7.55a4.83 4.83 0 0 1-2.4-.86z" />
        </svg>
      );

    case 'web':
      return <Globe className={`${sizePx} ${className} text-cyan-400 flex-shrink-0`} />;

    default:
      return <Share2 className={`${sizePx} ${className} text-[#00FFA3] flex-shrink-0`} />;
  }
};

/**
 * PlatformBadge: Renders authentic platform logo + cyber pill
 */
export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  type,
  size = 'sm',
  showLabel = true,
  className = '',
  iconOnly = false,
}) => {
  const norm = normalizePlatform(platform);

  // Platform specific visual tinting
  const badgeTheme = {
    instagram: 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 text-pink-300 border-pink-500/30 hover:border-pink-400/50',
    twitter: 'bg-white/[0.06] text-white border-white/20 hover:border-white/40',
    telegram: 'bg-[#2AABEE]/15 text-[#2AABEE] border-[#2AABEE]/35 hover:border-[#2AABEE]/60',
    'google-play': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50',
    apple: 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-slate-500',
    facebook: 'bg-[#1877F2]/15 text-[#60A5FA] border-[#1877F2]/30 hover:border-[#1877F2]/50',
    linkedin: 'bg-[#0A66C2]/15 text-[#38BDF8] border-[#0A66C2]/30 hover:border-[#0A66C2]/50',
    tiktok: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:border-cyan-400/50',
    web: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30 hover:border-cyan-400/50',
    other: 'bg-[#00050B] text-slate-300 border-[#00FFA3]/20 hover:border-[#00FFA3]/40',
  }[norm];

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-3 py-1.5 text-xs gap-2.5',
  }[size];

  if (iconOnly) {
    return (
      <span className={`inline-flex items-center justify-center p-1.5 rounded-lg border shadow-sm ${badgeTheme} ${className}`} title={platform}>
        <PlatformLogo platform={platform} size={size} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono font-bold border transition-colors shadow-sm ${badgeTheme} ${sizeClasses} ${className}`}
      title={`Detected on ${platform}`}
    >
      <PlatformLogo platform={platform} size={size} />
      {showLabel && <span className="truncate">{platform}</span>}
    </span>
  );
};
