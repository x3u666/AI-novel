'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarratorPreset, PresetId } from '@/types/narrator';

const presetEmojis: Record<PresetId, string> = {
  neutral: '📝', knight: '⚔️', romantic: '🌹', fighter: '💥',
  scientist: '🔬', dark_mage: '🔮', detective: '🔍',
  horror: '👁️', poet: '🍃', comedian: '🎭',
};

const presetAvatarGradients: Record<PresetId, string> = {
  neutral:   'linear-gradient(135deg, #3A3A4A 0%, #2A2A3A 100%)',
  knight:    'linear-gradient(135deg, #4A3A20 0%, #3A2A15 100%)',
  romantic:  'linear-gradient(135deg, #4A2A35 0%, #3A1A25 100%)',
  fighter:   'linear-gradient(135deg, #4A2520 0%, #3A1510 100%)',
  scientist: 'linear-gradient(135deg, #203A4A 0%, #152A3A 100%)',
  dark_mage: 'linear-gradient(135deg, #352A4A 0%, #251A3A 100%)',
  detective: 'linear-gradient(135deg, #3A3520 0%, #2A2515 100%)',
  horror:    'linear-gradient(135deg, #3A1520 0%, #2A0A15 100%)',
  poet:      'linear-gradient(135deg, #2A3A30 0%, #1A2A20 100%)',
  comedian:  'linear-gradient(135deg, #3A3020 0%, #2A2015 100%)',
};

interface NarratorCardProps {
  preset: NarratorPreset;
  selected: boolean;
  onClick: () => void;
  index?: number;
}

export function NarratorCard({ preset, selected, onClick, index = 0 }: NarratorCardProps) {
  const emoji = presetEmojis[preset.id];
  const avatarGradient = presetAvatarGradients[preset.id];

  return (
    <motion.button
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: selected ? 1 : 0.75, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center flex-shrink-0',
        'w-[130px] h-[150px] sm:w-[155px] sm:h-[175px] md:w-[170px] md:h-[190px]',
        'rounded-[14px] cursor-pointer pt-4 pb-5 px-3',
      )}
      style={{
        background: selected ? '#282840' : '#1E1E2A',
        border: selected
          ? `2px solid ${preset.accentColor}99`
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: selected
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${preset.accentColor}1A`
          : 'none',
        transform: selected ? 'scale(1.08) translateY(-6px)' : undefined,
        transition: 'background 0.3s, border 0.3s, box-shadow 0.3s, opacity 0.3s',
      }}
      // Hover via CSS — no whileHover Framer prop to keep things light
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.background = '#242434';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04) translateY(-4px)';
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.background = '#1E1E2A';
          (e.currentTarget as HTMLButtonElement).style.transform = '';
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.75';
        }
      }}
    >
      {/* Checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: preset.accentColor }}
        >
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Avatar — plain div, CSS transition */}
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: 'clamp(48px, 8vw, 72px)',
          height: 'clamp(48px, 8vw, 72px)',
          background: avatarGradient,
          border: '2px solid rgba(255,255,255,0.08)',
          fontSize: 'clamp(20px, 3.5vw, 28px)',
          transform: selected ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.25s ease',
        }}
      >
        {emoji}
      </div>

      {/* Name */}
      <span
        className="mt-2.5 text-[13px] md:text-[14px] font-semibold text-center leading-tight w-full"
        style={{ color: '#E8E8ED', fontFamily: 'Inter, sans-serif' }}
      >
        {preset.name}
      </span>

      {/* Subtitle */}
      <span
        className="mt-[3px] text-[10px] sm:text-[11px] text-center leading-tight w-full"
        style={{ color: '#9898A6', fontFamily: 'Inter, sans-serif' }}
      >
        {preset.subtitle}
      </span>

      {/* Bottom accent bar — CSS transition */}
      <div
        className="absolute bottom-2.5 rounded-[1px]"
        style={{
          height: '2px',
          backgroundColor: preset.accentColor,
          width: selected ? '60px' : '40px',
          opacity: selected ? 1 : 0.3,
          transition: 'width 0.3s ease, opacity 0.3s ease',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 rounded-[14px] pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${preset.accentColor}10 0%, transparent 70%)`,
          opacity: selected ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </motion.button>
  );
}
