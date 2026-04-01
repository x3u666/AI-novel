'use client';

import { motion } from 'framer-motion';
import type { NarrativeBlock as NarrativeBlockType } from '@/types';
import { formatTimeShort } from '@/utils/formatDate';
import { useSettingsStore } from '@/stores/settingsStore';
import { GAME_FONT_FAMILIES, GAME_FONT_WEIGHTS, GAME_FONT_LINE_HEIGHTS, TEXT_SIZE_CONFIG } from '@/types/ui';

interface NarrativeBlockProps {
  block: NarrativeBlockType;
  showChapterTitle?: boolean;
  chapterTitle?: string;
  isDecision?: boolean;
  accentColor?: string;
}

export function NarrativeBlock({
  block,
  showChapterTitle = false,
  chapterTitle,
  isDecision = false,
  accentColor = '#d4af37',
}: NarrativeBlockProps) {
  const gameFont = useSettingsStore((s) => s.gameFont);
  const textSize = useSettingsStore((s) => s.textSize);

  const fontFamily = GAME_FONT_FAMILIES[gameFont ?? 'inter'];
  const fontWeight = GAME_FONT_WEIGHTS[gameFont ?? 'inter'];
  const lineHeight = GAME_FONT_LINE_HEIGHTS[gameFont ?? 'inter'];
  const { proseClass } = TEXT_SIZE_CONFIG[textSize ?? 'large'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`
        relative pl-4 py-3
        ${isDecision ? `border-l-2` : 'border-l-0'}
      `}
      style={{
        borderLeftColor: isDecision ? accentColor : 'transparent',
      }}
    >
      {/* Chapter Title */}
      {showChapterTitle && chapterTitle && (
        <div className="mb-4">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: accentColor }}
          >
            {chapterTitle}
          </h2>
          <div
            className="w-full h-px opacity-30"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, transparent)`,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className={`text-white/90 whitespace-pre-wrap ${proseClass}`}
        style={{ fontFamily, fontWeight, lineHeight }}
      >
        {block.content}
      </div>

      {/* Timestamp */}
      {block.timestamp && (
        <div className="mt-2 text-xs text-white/30">
          {formatTimeShort(block.timestamp)}
        </div>
      )}

      {/* Decision indicator */}
      {isDecision && (
        <div
          className="absolute top-2 -left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </motion.div>
  );
}

// Decorative separator component
export function NarrativeSeparator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center py-4 text-white/20"
    >
      <span className="tracking-[0.5em]">· · ·</span>
    </motion.div>
  );
}
