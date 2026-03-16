'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarratorPreset, PresetId } from '@/types/narrator';

// Avatar emoji mapping for each preset
const presetEmojis: Record<PresetId, string> = {
  neutral: '📖',
  knight: '⚔️',
  romantic: '💕',
  fighter: '💥',
  scientist: '🔬',
  dark_mage: '🔮',
  detective: '🔍',
  horror: '👁️',
  poet: '🌿',
  comedian: '🎭',
};

// Short names for cards
const presetShortNames: Record<PresetId, string> = {
  neutral: 'Нейтр',
  knight: 'Рыцарь',
  romantic: 'Роман',
  fighter: 'Боец',
  scientist: 'Учён',
  dark_mage: 'Т.Маг',
  detective: 'Дет',
  horror: 'Хоррор',
  poet: 'Поэт',
  comedian: 'Комик',
};

interface NarratorCardProps {
  preset: NarratorPreset;
  selected: boolean;
  onClick: () => void;
  index?: number;
}

export function NarratorCard({
  preset,
  selected,
  onClick,
  index = 0,
}: NarratorCardProps) {
  const emoji = presetEmojis[preset.id];
  const shortName = presetShortNames[preset.id];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.08,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'w-[220px] h-[180px] md:w-[280px] md:h-[220px]',
        'rounded-2xl cursor-pointer',
        'bg-white/5 backdrop-blur-sm border',
        'transition-all duration-200',
        'flex-shrink-0',
        selected
          ? 'border-2 shadow-lg'
          : 'border-white/10 hover:border-white/30 hover:bg-white/10'
      )}
      style={{
        borderColor: selected ? preset.accentColor : undefined,
        boxShadow: selected
          ? `0 0 20px ${preset.accentColor}40, 0 0 40px ${preset.accentColor}20`
          : undefined,
      }}
    >
      {/* Selected Checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: preset.accentColor }}
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}

      {/* Emoji Avatar */}
      <div
        className={cn(
          'text-4xl md:text-5xl mb-3 transition-transform duration-200',
          selected && 'scale-110'
        )}
      >
        {emoji}
      </div>

      {/* Short Name */}
      <span
        className={cn(
          'text-sm md:text-base font-medium text-white/80',
          'transition-colors duration-200',
          selected && 'text-white'
        )}
      >
        {shortName}
      </span>

      {/* Subtitle */}
      <span
        className={cn(
          'text-[11px] md:text-xs text-white/40 mt-1',
          'max-w-[120px] truncate text-center'
        )}
      >
        {preset.subtitle}
      </span>

      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200',
          'pointer-events-none',
          selected && 'opacity-100'
        )}
        style={{
          background: `radial-gradient(circle at center, ${preset.accentColor}10 0%, transparent 70%)`,
        }}
      />
    </motion.button>
  );
}
