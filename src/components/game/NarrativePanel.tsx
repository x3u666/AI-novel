'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NarrativeBlock as NarrativeBlockType, Decision } from '@/types';
import { NarrativeBlock, NarrativeSeparator } from './NarrativeBlock';
import { BookOpen } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { GAME_FONT_FAMILIES } from '@/types/ui';

interface NarrativePanelProps {
  blocks: NarrativeBlockType[];
  decisions: Decision[];
  currentChapter: number;
  accentColor?: string;
  // Text being streamed right now (not yet in blocks[])
  streamingText?: string;
  isStreaming?: boolean;
  // True after streaming ends while the last block's typewriter is running
  isTypewriting?: boolean;
  onNarrativeTypingComplete?: () => void;
}

export function NarrativePanel({
  blocks, decisions, currentChapter, accentColor = '#d4af37',
  streamingText = '', isStreaming = false,
  isTypewriting = false, onNarrativeTypingComplete,
}: NarrativePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gameFont = useSettingsStore((s) => s.gameFont);
  const fontFamily = GAME_FONT_FAMILIES[gameFont ?? 'inter'];

  // Auto-scroll when blocks change or streaming text grows
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [blocks.length, streamingText]);

  const processedBlocks = blocks.map((block, index) => {
    const prevBlock = index > 0 ? blocks[index - 1] : null;
    const isNewChapter = !prevBlock || block.timestamp > prevBlock.timestamp + 60000;
    const relatedDecision = decisions.find((d) => Math.abs(d.timestamp - block.timestamp) < 5000);
    return {
      block,
      isNewChapter,
      chapterTitle: isNewChapter ? `Глава ${currentChapter}` : undefined,
      isDecision: !!relatedDecision,
    };
  });

  // The last committed block gets typewriter effect
  const lastBlockIndex = blocks.length - 1;

  const hasContent = blocks.length > 0 || isStreaming;

  return (
    <div className="h-full flex flex-col bg-transparent border-r border-white/5" style={{ fontFamily }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 py-4 border-b border-white/5">
        <BookOpen className="w-4 h-4 text-white/50" />
        <span className="text-sm font-medium text-white/70" style={{ fontFamily: '"Inter", sans-serif' }}>
          Нарратив
        </span>
        {(isStreaming || isTypewriting) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="ml-auto text-xs"
            style={{ color: accentColor, fontFamily: '"Inter", sans-serif' }}
          >
            ✦ пишет...
          </motion.span>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        <div className="p-6">
          {hasContent ? (
            <div className="space-y-2">
              {processedBlocks.map((item, index) => (
                <div key={item.block.id}>
                  {index > 0 && <NarrativeSeparator />}
                  {item.isNewChapter && index > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 my-4"
                    >
                      <div className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
                      <span className="text-xs font-medium uppercase tracking-widest"
                        style={{ color: accentColor, fontFamily: '"Inter", sans-serif' }}>
                        {item.chapterTitle}
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
                    </motion.div>
                  )}
                  <NarrativeBlock
                    block={item.block}
                    isDecision={item.isDecision}
                    accentColor={accentColor}
                    // Typewriter only on the last committed block (not during streaming)
                    useTypewriterEffect={index === lastBlockIndex && !isStreaming}
                    onTypingComplete={index === lastBlockIndex ? onNarrativeTypingComplete : undefined}
                  />
                </div>
              ))}

              {/* Live streaming block — raw text as it arrives */}
              {isStreaming && streamingText && (
                <div>
                  {blocks.length > 0 && <NarrativeSeparator />}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative pl-4 py-3"
                  >
                    <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-serif">
                      {streamingText}
                      <span
                        className="inline-block w-[2px] h-[1em] ml-[2px] align-middle animate-pulse"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Waiting for first streaming token */}
              {isStreaming && !streamingText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pl-4 py-3 flex items-center gap-2"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${accentColor}15` }}>
                <BookOpen className="w-8 h-8" style={{ color: accentColor }} />
              </div>
              <p className="text-white/30 text-xs" style={{ fontFamily: '"Inter", sans-serif' }}>
                Здесь появится история...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
