import React from 'react';

interface AchievementBadgeProps {
  id: string;
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  id,
  isUnlocked,
  size = 'md',
}) => {
  const dim = size === 'sm' ? 44 : size === 'lg' ? 88 : 56;
  const strokeColor = isUnlocked ? '#000000' : '#888888';
  const bgColor = isUnlocked ? '#FFFFFF' : '#0a0a0a';
  const accentColor = isUnlocked ? '#000000' : '#333333';
  const borderColor = isUnlocked ? '#FFFFFF' : '#262626';

  const renderGraphic = () => {
    switch (id) {
      case 'ach-first-step':
        return (
          <g transform="translate(10, 10)">
            <rect x="2" y="16" width="6" height="8" fill={accentColor} />
            <rect x="10" y="10" width="6" height="14" fill={accentColor} />
            <rect x="18" y="4" width="6" height="20" fill={accentColor} />
            <path d="M4 14 L20 2 M20 2 L14 2 M20 2 L20 8" stroke={strokeColor} strokeWidth="1.75" fill="none" />
          </g>
        );

      case 'ach-module-1':
        return (
          <g transform="translate(8, 8)">
            {/* 3 stacked isometric blocks */}
            <path d="M16 2 L28 8 L16 14 L4 8 Z" fill={isUnlocked ? '#000' : '#222'} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M4 8 L4 16 L16 22 L16 14 Z" fill={isUnlocked ? '#222' : '#151515'} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M28 8 L28 16 L16 22 L16 14 Z" fill={isUnlocked ? '#444' : '#111'} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M4 16 L4 24 L16 30 L16 22 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M28 16 L28 24 L16 30 L16 22 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        );

      case 'ach-three-modules':
        return (
          <g transform="translate(8, 8)">
            <rect x="2" y="4" width="7" height="24" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <rect x="12" y="4" width="7" height="24" stroke={strokeColor} strokeWidth="1.5" fill={accentColor} />
            <rect x="22" y="4" width="7" height="24" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <line x1="0" y1="16" x2="31" y2="16" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        );

      case 'ach-halfway':
        return (
          <g transform="translate(8, 8)">
            <circle cx="16" cy="16" r="12" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <path d="M16 4 A12 12 0 0 1 16 28 Z" fill={accentColor} />
            <line x1="16" y1="2" x2="16" y2="30" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3" fill={isUnlocked ? '#fff' : '#000'} stroke={strokeColor} strokeWidth="1" />
          </g>
        );

      case 'ach-master-100':
        return (
          <g transform="translate(8, 8)">
            <path d="M4 22 L6 10 L12 15 L16 6 L20 15 L26 10 L28 22 Z" stroke={strokeColor} strokeWidth="1.75" fill={accentColor} />
            <rect x="4" y="24" width="24" height="3" fill={strokeColor} />
            <circle cx="16" cy="14" r="1.5" fill={isUnlocked ? '#fff' : '#888'} />
          </g>
        );

      case 'ach-perfect-test':
        return (
          <g transform="translate(8, 8)">
            <circle cx="16" cy="16" r="12" stroke={strokeColor} strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
            <path d="M11 16 L15 20 L22 11" stroke={strokeColor} strokeWidth="2.2" fill="none" />
            <circle cx="16" cy="16" r="14" stroke={strokeColor} strokeWidth="1" fill="none" />
          </g>
        );

      case 'ach-streak-3':
        return (
          <g transform="translate(8, 8)">
            <path d="M16 2 C16 8, 10 12, 10 18 C10 23, 13 28, 16 28 C19 28, 22 23, 22 18 C22 12, 16 8, 16 2 Z" stroke={strokeColor} strokeWidth="1.75" fill={accentColor} />
            <path d="M16 16 C16 19, 14 20, 14 23 C14 25, 15 26, 16 26 C17 26, 18 25, 18 23 C18 20, 16 19, 16 16 Z" fill={isUnlocked ? '#fff' : '#555'} />
          </g>
        );

      case 'ach-streak-7':
        return (
          <g transform="translate(8, 8)">
            <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <polygon points="16,6 24,11 24,21 16,26 8,21 8,11" fill={accentColor} />
            <text x="16" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="monospace" fill={isUnlocked ? '#fff' : '#888'}>7D</text>
          </g>
        );

      case 'ach-streak-30':
        return (
          <g transform="translate(8, 8)">
            <rect x="4" y="4" width="24" height="24" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <rect x="8" y="8" width="16" height="16" stroke={strokeColor} strokeWidth="1" fill={accentColor} />
            <text x="16" y="19" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="monospace" fill={isUnlocked ? '#fff' : '#888'}>30D</text>
          </g>
        );

      case 'ach-xp-500':
        return (
          <g transform="translate(8, 8)">
            <polygon points="18,2 6,17 15,17 13,30 25,14 17,14" stroke={strokeColor} strokeWidth="1.5" fill={accentColor} />
          </g>
        );

      case 'ach-xp-2000':
        return (
          <g transform="translate(8, 8)">
            <polygon points="16,2 30,16 16,30 2,16" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <polygon points="16,7 25,16 16,25 7,16" stroke={strokeColor} strokeWidth="1" fill={accentColor} />
            <circle cx="16" cy="16" r="3" fill={isUnlocked ? '#fff' : '#000'} />
          </g>
        );

      case 'ach-first-trade':
        return (
          <g transform="translate(8, 8)">
            <circle cx="16" cy="16" r="10" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <line x1="16" y1="2" x2="16" y2="8" stroke={strokeColor} strokeWidth="1.75" />
            <line x1="16" y1="24" x2="16" y2="30" stroke={strokeColor} strokeWidth="1.75" />
            <line x1="2" y1="16" x2="8" y2="16" stroke={strokeColor} strokeWidth="1.75" />
            <line x1="24" y1="16" x2="30" y2="16" stroke={strokeColor} strokeWidth="1.75" />
            <circle cx="16" cy="16" r="2" fill={strokeColor} />
          </g>
        );

      case 'ach-profit-trade':
        return (
          <g transform="translate(8, 8)">
            <path d="M4 24 L12 16 L18 20 L28 8" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="square" />
            <polygon points="28,8 21,8 28,15" fill={strokeColor} />
            <line x1="4" y1="28" x2="28" y2="28" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,2" />
          </g>
        );

      case 'ach-winrate-70':
        return (
          <g transform="translate(8, 8)">
            <rect x="4" y="4" width="24" height="24" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <circle cx="16" cy="16" r="7" stroke={strokeColor} strokeWidth="1.5" fill={accentColor} />
            <text x="16" y="19" textAnchor="middle" fontSize="7" fontWeight="900" fontFamily="monospace" fill={isUnlocked ? '#fff' : '#888'}>70%</text>
          </g>
        );

      case 'ach-high-leverage':
        return (
          <g transform="translate(8, 8)">
            <circle cx="16" cy="16" r="12" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <path d="M8 20 L16 7 L24 20 Z" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
            <text x="16" y="25" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="monospace" fill={strokeColor}>50X</text>
          </g>
        );

      case 'ach-profit-1000':
        return (
          <g transform="translate(8, 8)">
            <rect x="4" y="6" width="24" height="20" stroke={strokeColor} strokeWidth="1.5" fill={accentColor} />
            <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="monospace" fill={isUnlocked ? '#fff' : '#888'}>$1K</text>
          </g>
        );

      case 'ach-referral-1':
        return (
          <g transform="translate(8, 8)">
            <circle cx="11" cy="11" r="5" stroke={strokeColor} strokeWidth="1.5" fill={accentColor} />
            <circle cx="21" cy="11" r="5" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <path d="M5 26 C5 21, 8 20, 11 20 C14 20, 17 21, 17 26" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <path d="M17 26 C17 22, 19 21, 22 21 C25 21, 27 22, 27 26" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          </g>
        );

      case 'ach-referral-3':
        return (
          <g transform="translate(8, 8)">
            <polygon points="16,4 28,26 4,26" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <circle cx="16" cy="10" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
            <circle cx="9" cy="22" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
            <circle cx="23" cy="22" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          </g>
        );

      case 'ach-glossary-master':
        return (
          <g transform="translate(8, 8)">
            <path d="M6 6 L16 8 L26 6 L26 24 L16 26 L6 24 Z" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <line x1="16" y1="8" x2="16" y2="26" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="9" y1="12" x2="13" y2="13" stroke={strokeColor} strokeWidth="1" />
            <line x1="9" y1="16" x2="13" y2="17" stroke={strokeColor} strokeWidth="1" />
            <line x1="19" y1="13" x2="23" y2="12" stroke={strokeColor} strokeWidth="1" />
          </g>
        );

      case 'ach-iron-risk':
      default:
        return (
          <g transform="translate(8, 8)">
            <path d="M6 6 L16 3 L26 6 L26 17 C26 23, 21 27, 16 29 C11 27, 6 23, 6 17 Z" stroke={strokeColor} strokeWidth="1.5" fill={accentColor} />
            <text x="16" y="19" textAnchor="middle" fontSize="7" fontWeight="900" fontFamily="monospace" fill={isUnlocked ? '#fff' : '#888'}>1:3</text>
          </g>
        );
    }
  };

  return (
    <div
      style={{ width: dim, height: dim }}
      className={`border flex items-center justify-center shrink-0 transition-all ${
        isUnlocked
          ? 'bg-white border-white text-black shadow-md'
          : 'bg-black border-white/20 text-neutral-600'
      }`}
    >
      <svg
        width={dim - 8}
        height={dim - 8}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer technical coordinate grid in Bauhaus style */}
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          stroke={isUnlocked ? '#000000' : 'rgba(255,255,255,0.15)'}
          strokeWidth="0.75"
          fill="none"
        />
        {/* Corner ticks */}
        <line x1="1" y1="5" x2="1" y2="1" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="1" y1="1" x2="5" y2="1" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="47" y1="5" x2="47" y2="1" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="47" y1="1" x2="43" y2="1" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="1" y1="43" x2="1" y2="47" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="1" y1="47" x2="5" y2="47" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="47" y1="43" x2="47" y2="47" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="47" y1="47" x2="43" y2="47" stroke={strokeColor} strokeWidth="1.5" />

        {/* Central Graphic */}
        {renderGraphic()}
      </svg>
    </div>
  );
};
