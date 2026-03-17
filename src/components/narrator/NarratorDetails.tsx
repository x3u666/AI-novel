'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { NarratorPreset, PresetId } from '@/types/narrator';

// Avatar emoji mapping
const presetEmojis: Record<PresetId, string> = {
  neutral: '📝',
  knight: '⚔️',
  romantic: '🌹',
  fighter: '💥',
  scientist: '🔬',
  dark_mage: '🔮',
  detective: '🔍',
  horror: '👁️',
  poet: '🍃',
  comedian: '🎭',
};

// Avatar gradient backgrounds per spec
const presetAvatarGradients: Record<PresetId, string> = {
  neutral: 'linear-gradient(135deg, #3A3A4A 0%, #2A2A3A 100%)',
  knight: 'linear-gradient(135deg, #4A3A20 0%, #3A2A15 100%)',
  romantic: 'linear-gradient(135deg, #4A2A35 0%, #3A1A25 100%)',
  fighter: 'linear-gradient(135deg, #4A2520 0%, #3A1510 100%)',
  scientist: 'linear-gradient(135deg, #203A4A 0%, #152A3A 100%)',
  dark_mage: 'linear-gradient(135deg, #352A4A 0%, #251A3A 100%)',
  detective: 'linear-gradient(135deg, #3A3520 0%, #2A2515 100%)',
  horror: 'linear-gradient(135deg, #3A1520 0%, #2A0A15 100%)',
  poet: 'linear-gradient(135deg, #2A3A30 0%, #1A2A20 100%)',
  comedian: 'linear-gradient(135deg, #3A3020 0%, #2A2015 100%)',
};

interface NarratorDetailsProps {
  preset: NarratorPreset | null;
  // Direction for slide animation: 'left' if new preset is to the right, 'right' if to left
  slideDirection?: 'left' | 'right';
}

export function NarratorDetails({ preset, slideDirection = 'left' }: NarratorDetailsProps) {
  if (!preset) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: '#9898A6' }}>
        Выберите рассказчика
      </div>
    );
  }

  const emoji = presetEmojis[preset.id];
  const avatarGradient = presetAvatarGradients[preset.id];
  const paragraphs = preset.description.split('\n\n').filter(Boolean);

  // Slide in from right if new preset is to the right, from left if to the left
  const xIn = slideDirection === 'left' ? 15 : -15;
  const xOut = slideDirection === 'left' ? -15 : 15;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={preset.id}
        initial={{ opacity: 0, x: xIn }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: xOut }}
        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
        className="flex flex-col"
      >
        {/* ── Header: avatar (float left) + title ── */}
        <div className="flex gap-6 mb-0">
          {/* Large avatar — 100×100 per spec */}
          <div
            className="flex-shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-2xl flex items-center justify-center text-3xl md:text-4xl"
            style={{
              background: avatarGradient,
              border: `2px solid ${preset.accentColor}4D`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              marginRight: '24px',
              marginBottom: '16px',
              float: 'left',
            }}
          >
            {emoji}
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Name in accent color */}
            <h2
              className="font-bold leading-tight"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                color: preset.accentColor,
              }}
            >
              {preset.name}
            </h2>

            {/* Subtitle */}
            <p
              className="mt-1"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#9898A6',
              }}
            >
              {preset.subtitle}
            </p>

            {/* Decorative divider line */}
            <div
              className="mt-3 rounded-[1px]"
              style={{
                width: '80px',
                height: '2px',
                backgroundColor: preset.accentColor,
                opacity: 0.4,
              }}
            />
          </div>
        </div>

        {/* ── Description paragraphs (text flows around the float avatar) ── */}
        <div style={{ overflow: 'hidden' }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                lineHeight: '1.75',
                color: '#E8E8ED',
                marginTop: i === 0 ? '16px' : '12px',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* ── Tags ── */}
        <div className="flex flex-wrap gap-2 mt-4">
          {preset.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                backgroundColor: `${preset.accentColor}1A`,
                border: `1px solid ${preset.accentColor}26`,
                color: preset.accentColor,
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                padding: '4px 14px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── Sample text block ── */}
        <div
          className="mt-5 rounded-r-lg"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderLeft: `3px solid ${preset.accentColor}80`,
            padding: '16px 20px',
          }}
        >
          {/* Label */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#9898A6',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Пример текста
          </p>

          {/* Quote */}
          <p
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              fontStyle: 'italic',
              lineHeight: '1.7',
              color: 'rgba(232, 232, 237, 0.85)',
            }}
          >
            «{preset.sampleText}»
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
