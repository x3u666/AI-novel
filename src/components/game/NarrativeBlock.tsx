'use client';

import { motion } from 'framer-motion';
import type { NarrativeBlock as NarrativeBlockType } from '@/types';
import { formatDateShort } from '@/utils/formatDate';

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
      <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-serif">
        {block.content}
      </div>

      {/* Timestamp */}
      {block.timestamp && (
        <div className="mt-2 text-xs text-white/30">
          {formatDateShort(block.timestamp)}
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
