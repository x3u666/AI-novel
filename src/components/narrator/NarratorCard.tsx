'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NarratorPreset, PresetId } from '@/types/narrator';

const presetEmojis: Record<PresetId, string> = {
  neutral:   '📝',
  knight:    '⚔️',
  romantic:  '🌹',
  fighter:   '💥',
  scientist: '⚡',
  dark_mage: '🔮',
  detective: '🔍',
  horror:    '👁️',
  comedian:  '🎭',
};

// Per-narrator themed backgrounds — radial gradient blobs like the main menu
const presetCardBg: Record<PresetId, string> = {
  neutral:   `radial-gradient(ellipse 80% 60% at 30% 30%, rgba(168,176,188,0.18) 0%, transparent 65%),
              radial-gradient(ellipse 60% 80% at 75% 70%, rgba(140,148,160,0.12) 0%, transparent 60%),
              linear-gradient(150deg, #16171e 0%, #1a1b24 100%)`,
  knight:    `radial-gradient(ellipse 80% 60% at 25% 25%, rgba(212,168,83,0.22) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 70%, rgba(180,130,50,0.14) 0%, transparent 55%),
              linear-gradient(150deg, #1a1408 0%, #1e1a0e 100%)`,
  romantic:  `radial-gradient(ellipse 80% 60% at 30% 30%, rgba(212,123,142,0.22) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 75% 70%, rgba(180,90,110,0.14) 0%, transparent 55%),
              linear-gradient(150deg, #1a0e12 0%, #1e1016 100%)`,
  fighter:   `radial-gradient(ellipse 80% 60% at 80% 30%, rgba(212,91,62,0.22) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 20% 70%, rgba(200,70,40,0.14) 0%, transparent 55%),
              linear-gradient(150deg, #1a0e0a 0%, #1e100c 100%)`,
  scientist: `radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,212,255,0.20) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 75%, rgba(0,160,220,0.14) 0%, transparent 55%),
              radial-gradient(ellipse 40% 40% at 55% 45%, rgba(0,255,200,0.08) 0%, transparent 50%),
              linear-gradient(150deg, #060d14 0%, #081018 100%)`,
  dark_mage: `radial-gradient(ellipse 80% 60% at 30% 25%, rgba(139,92,212,0.22) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 75% 70%, rgba(100,60,180,0.14) 0%, transparent 55%),
              linear-gradient(150deg, #0e0a1a 0%, #120c1e 100%)`,
  detective: `radial-gradient(ellipse 80% 60% at 25% 30%, rgba(201,168,76,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 65%, rgba(160,130,50,0.12) 0%, transparent 55%),
              linear-gradient(150deg, #14120a 0%, #181408 100%)`,
  horror:    `radial-gradient(ellipse 70% 50% at 50% 20%, rgba(139,46,59,0.20) 0%, transparent 55%),
              radial-gradient(ellipse 50% 60% at 20% 75%, rgba(100,20,30,0.16) 0%, transparent 50%),
              linear-gradient(150deg, #120608 0%, #160808 100%)`,
  comedian:  `radial-gradient(ellipse 80% 60% at 25% 30%, rgba(232,168,56,0.20) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 70%, rgba(200,140,30,0.14) 0%, transparent 55%),
              linear-gradient(150deg, #181008 0%, #1c1408 100%)`,
};

// Animated wave-line decorations per narrator (SVG paths)
const presetPatterns: Record<PresetId, React.ReactNode> = {
  neutral: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      <path d="M0,80 Q42,65 85,80 Q128,95 170,80" stroke="rgba(168,176,188,0.15)" strokeWidth="1" fill="none"/>
      <path d="M0,100 Q42,85 85,100 Q128,115 170,100" stroke="rgba(168,176,188,0.10)" strokeWidth="1" fill="none"/>
      <circle cx="145" cy="25" r="18" stroke="rgba(168,176,188,0.08)" strokeWidth="1" fill="none"/>
    </svg>
  ),
  knight: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      <path d="M85,10 L90,25 L105,25 L93,33 L97,48 L85,40 L73,48 L77,33 L65,25 L80,25 Z"
        stroke="rgba(212,168,83,0.18)" strokeWidth="1" fill="none"/>
      <path d="M0,130 Q42,115 85,130 Q128,145 170,130" stroke="rgba(212,168,83,0.12)" strokeWidth="1" fill="none"/>
      <path d="M0,150 Q42,135 85,150 Q128,165 170,150" stroke="rgba(212,168,83,0.08)" strokeWidth="1" fill="none"/>
    </svg>
  ),
  romantic: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      <path d="M85,20 C75,10 55,15 55,30 C55,45 85,60 85,60 C85,60 115,45 115,30 C115,15 95,10 85,20Z"
        stroke="rgba(212,123,142,0.18)" strokeWidth="1" fill="none"/>
      <path d="M0,120 Q42,108 85,120 Q128,132 170,120" stroke="rgba(212,123,142,0.12)" strokeWidth="1" fill="none"/>
      <circle cx="30" cy="155" r="12" stroke="rgba(212,123,142,0.10)" strokeWidth="1" fill="none" strokeDasharray="3 2"/>
    </svg>
  ),
  fighter: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      <line x1="0" y1="0" x2="170" y2="190" stroke="rgba(212,91,62,0.10)" strokeWidth="1"/>
      <line x1="170" y1="0" x2="0" y2="190" stroke="rgba(212,91,62,0.08)" strokeWidth="1"/>
      <path d="M0,95 L50,80 L85,95 L120,80 L170,95" stroke="rgba(212,91,62,0.15)" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
  scientist: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      {/* Grid lines */}
      <line x1="0" y1="63" x2="170" y2="63" stroke="rgba(0,212,255,0.07)" strokeWidth="0.8"/>
      <line x1="0" y1="126" x2="170" y2="126" stroke="rgba(0,212,255,0.07)" strokeWidth="0.8"/>
      <line x1="56" y1="0" x2="56" y2="190" stroke="rgba(0,212,255,0.07)" strokeWidth="0.8"/>
      <line x1="113" y1="0" x2="113" y2="190" stroke="rgba(0,212,255,0.07)" strokeWidth="0.8"/>
      {/* Hex */}
      <polygon points="85,15 100,24 100,42 85,51 70,42 70,24"
        stroke="rgba(0,212,255,0.18)" strokeWidth="1" fill="none"/>
      {/* Scan line */}
      <line x1="0" y1="160" x2="170" y2="160" stroke="rgba(0,255,200,0.12)" strokeWidth="1.5"/>
    </svg>
  ),
  dark_mage: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      <circle cx="85" cy="95" r="50" stroke="rgba(139,92,212,0.12)" strokeWidth="1" fill="none" strokeDasharray="4 3"/>
      <circle cx="85" cy="95" r="35" stroke="rgba(139,92,212,0.10)" strokeWidth="1" fill="none" strokeDasharray="2 4"/>
      {/* Triangle */}
      <polygon points="85,30 125,100 45,100"
        stroke="rgba(139,92,212,0.15)" strokeWidth="1" fill="none"/>
    </svg>
  ),
  detective: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      <path d="M0,60 L170,60" stroke="rgba(201,168,76,0.10)" strokeWidth="0.8"/>
      <path d="M0,130 L170,130" stroke="rgba(201,168,76,0.08)" strokeWidth="0.8"/>
      <circle cx="130" cy="35" r="20" stroke="rgba(201,168,76,0.15)" strokeWidth="1" fill="none"/>
      <line x1="143" y1="48" x2="155" y2="60" stroke="rgba(201,168,76,0.15)" strokeWidth="1.5"/>
    </svg>
  ),
  horror: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      {/* Eye */}
      <ellipse cx="85" cy="50" rx="35" ry="18" stroke="rgba(139,46,59,0.18)" strokeWidth="1" fill="none"/>
      <circle cx="85" cy="50" r="9" stroke="rgba(139,46,59,0.14)" strokeWidth="1" fill="none"/>
      <path d="M0,130 Q28,115 56,130 Q85,145 113,130 Q142,115 170,130"
        stroke="rgba(139,46,59,0.12)" strokeWidth="1" fill="none"/>
    </svg>
  ),
  comedian: (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 170 190" preserveAspectRatio="xMidYMid slice">
      {/* Stars */}
      <path d="M35,30 L37,36 L43,36 L38,40 L40,46 L35,42 L30,46 L32,40 L27,36 L33,36 Z"
        stroke="rgba(232,168,56,0.18)" strokeWidth="0.8" fill="none"/>
      <path d="M135,140 L137,146 L143,146 L138,150 L140,156 L135,152 L130,156 L132,150 L127,146 L133,146 Z"
        stroke="rgba(232,168,56,0.14)" strokeWidth="0.8" fill="none"/>
      <path d="M0,95 Q42,80 85,95 Q128,110 170,95"
        stroke="rgba(232,168,56,0.12)" strokeWidth="1" fill="none"/>
    </svg>
  ),
};

interface NarratorCardProps {
  preset: NarratorPreset;
  selected: boolean;
  onClick: () => void;
  index?: number;
}

export function NarratorCard({ preset, selected, onClick, index = 0 }: NarratorCardProps) {
  const emoji = presetEmojis[preset.id];
  const cardBg = presetCardBg[preset.id];
  const pattern = presetPatterns[preset.id];

  return (
    <motion.button
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: selected ? 1 : 0.78, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center flex-shrink-0 overflow-hidden',
        'w-[130px] h-[150px] sm:w-[155px] sm:h-[175px] md:w-[170px] md:h-[190px]',
        'rounded-[14px] cursor-pointer pt-4 pb-5 px-3',
      )}
      style={{
        background: cardBg,
        border: selected
          ? `2px solid ${preset.accentColor}99`
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: selected
          ? `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${preset.accentColor}25`
          : 'none',
        transform: selected ? 'scale(1.08) translateY(-6px)' : undefined,
        transition: 'border 0.3s, box-shadow 0.3s, opacity 0.3s',
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04) translateY(-4px)';
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.92';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.transform = '';
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.78';
        }
      }}
    >
      {/* SVG pattern background */}
      <div className="absolute inset-0 pointer-events-none">
        {pattern}
      </div>

      {/* Top accent glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[14px]"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${preset.accentColor}20 0%, transparent 70%)`,
          opacity: selected ? 1 : 0.6,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Avatar circle */}
      <div
        className="relative rounded-full flex items-center justify-center flex-shrink-0 z-10"
        style={{
          width: 'clamp(48px, 8vw, 72px)',
          height: 'clamp(48px, 8vw, 72px)',
          background: `radial-gradient(circle at 35% 35%, ${preset.accentColor}30 0%, ${preset.accentColor}08 100%)`,
          border: `1.5px solid ${preset.accentColor}40`,
          fontSize: 'clamp(20px, 3.5vw, 28px)',
          transform: selected ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.25s ease',
          boxShadow: `0 0 12px ${preset.accentColor}20`,
        }}
      >
        {emoji}
      </div>

      {/* Name */}
      <span
        className="mt-2.5 text-[13px] md:text-[14px] font-semibold text-center leading-tight w-full relative z-10"
        style={{ color: '#E8E8ED', fontFamily: 'Inter, sans-serif' }}
      >
        {preset.name}
      </span>

      {/* Subtitle */}
      <span
        className="mt-[3px] text-[10px] sm:text-[11px] text-center leading-tight w-full relative z-10"
        style={{ color: `${preset.accentColor}cc`, fontFamily: 'Inter, sans-serif' }}
      >
        {preset.subtitle}
      </span>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-2.5 rounded-[1px] z-10"
        style={{
          height: '2px',
          backgroundColor: preset.accentColor,
          width: selected ? '60px' : '40px',
          opacity: selected ? 1 : 0.35,
          transition: 'width 0.3s ease, opacity 0.3s ease',
          boxShadow: selected ? `0 0 8px ${preset.accentColor}80` : 'none',
        }}
      />
    </motion.button>
  );
}
