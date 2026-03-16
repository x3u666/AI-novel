'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
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

interface NarratorDetailsProps {
  preset: NarratorPreset | null;
}

export function NarratorDetails({ preset }: NarratorDetailsProps) {
  if (!preset) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        Выберите рассказчика
      </div>
    );
  }

  const emoji = presetEmojis[preset.id];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={preset.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
        className="flex flex-col gap-4 md:gap-6"
      >
        {/* Header with Avatar and Title */}
        <div className="flex items-start gap-4">
          {/* Large Emoji Avatar */}
          <div
            className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-3xl md:text-4xl"
            style={{
              backgroundColor: `${preset.accentColor}20`,
              border: `1px solid ${preset.accentColor}40`,
            }}
          >
            {emoji}
          </div>

          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg md:text-xl font-semibold"
              style={{ color: preset.accentColor }}
            >
              {preset.name}
            </h2>
            <p className="text-white/50 text-sm md:text-base">
              {preset.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          {preset.description.split('\n\n').map((paragraph, index) => (
            <p
              key={index}
              className="text-white/70 text-sm md:text-base leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {preset.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-2.5 py-1 border-white/20 text-white/70 hover:text-white hover:border-white/40"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Sample Text Quote */}
        <div className="relative mt-2">
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
            style={{ backgroundColor: preset.accentColor }}
          />
          <div
            className="pl-4 py-2 rounded-r-lg"
            style={{ backgroundColor: `${preset.accentColor}10` }}
          >
            <p className="text-xs text-white/40 mb-1.5">Пример текста</p>
            <p className="text-white/80 text-sm md:text-base italic leading-relaxed">
              «{preset.sampleText}»
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
