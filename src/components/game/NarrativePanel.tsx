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
}

export function NarrativePanel({
  blocks, decisions, currentChapter, accentColor = '#d4af37',
}: NarrativePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gameFont = useSettingsStore((s) => s.gameFont);
  const fontFamily = GAME_FONT_FAMILIES[gameFont ?? 'inter'];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [blocks.length]);

  const processedBlocks = blocks.map((block, index) => {
    const prevBlock = index > 0 ? blocks[index - 1] : null;
    const blockChapter = block.chapter ?? 1;
    const prevChapter = prevBlock?.chapter ?? 1;
    // Show chapter divider when chapter number changes OR it's the very first block
    const isNewChapter = index === 0 || blockChapter !== prevChapter;
    const relatedDecision = decisions.find((d) => Math.abs(d.timestamp - block.timestamp) < 5000);
    return {
      block,
      isNewChapter,
      chapterTitle: isNewChapter ? `Глава ${blockChapter}` : undefined,
      isDecision: !!relatedDecision,
    };
  });

  const hasContent = blocks.length > 0;

  return (
    <div className="h-full flex flex-col bg-transparent border-r border-white/5" style={{ fontFamily }}>
      {/* Header — no custom font, use inherited */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 py-4 border-b border-white/5">
        <BookOpen className="w-4 h-4 text-white/50" />
        <span className="text-sm font-medium text-white/70" style={{ fontFamily: '"Inter", sans-serif' }}>Нарратив</span>
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
                  {index > 0 && !item.isNewChapter && <NarrativeSeparator />}
                  {item.isNewChapter && (
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
                  />
                </div>
              ))}
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
