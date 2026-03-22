'use client';

import { motion } from 'framer-motion';
import type { NarrativeBlock as NarrativeBlockType } from '@/types';
import { formatTimeShort } from '@/utils/formatDate';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useSettingsStore } from '@/stores/settingsStore';

interface NarrativeBlockProps {
  block: NarrativeBlockType;
  showChapterTitle?: boolean;
  chapterTitle?: string;
  isDecision?: boolean;
  accentColor?: string;
  // When true, the block text animates with typewriter effect
  useTypewriterEffect?: boolean;
  onTypingComplete?: () => void;
}

export function NarrativeBlock({
  block,
  showChapterTitle = false,
  chapterTitle,
  isDecision = false,
  accentColor = '#d4af37',
  useTypewriterEffect = false,
  onTypingComplete,
}: NarrativeBlockProps) {
  const typingSpeed = useSettingsStore((s) => s.typingSpeed);

  const { displayText, isTyping, skipToEnd } = useTypewriter({
    text: block.content,
    speed: typingSpeed,
    onComplete: onTypingComplete,
    enabled: useTypewriterEffect && !!block.content,
  });

  const shownText = useTypewriterEffect ? displayText : block.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`
        relative pl-4 py-3
        ${isDecision ? 'border-l-2' : 'border-l-0'}
        ${useTypewriterEffect && isTyping ? 'cursor-pointer' : ''}
      `}
      style={{ borderLeftColor: isDecision ? accentColor : 'transparent' }}
      onClick={useTypewriterEffect && isTyping ? skipToEnd : undefined}
      title={useTypewriterEffect && isTyping ? 'Нажмите чтобы пропустить' : undefined}
    >
      {/* Chapter Title */}
      {showChapterTitle && chapterTitle && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2" style={{ color: accentColor }}>
            {chapterTitle}
          </h2>
          <div
            className="w-full h-px opacity-30"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-serif">
        {shownText}
        {useTypewriterEffect && isTyping && (
          <span
            className="inline-block w-[2px] h-[1em] ml-[2px] align-middle animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </div>

      {/* Timestamp — only shown after typewriter completes */}
      {block.timestamp && !isTyping && (
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
