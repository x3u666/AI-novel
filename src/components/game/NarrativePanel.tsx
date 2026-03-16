'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NarrativeBlock as NarrativeBlockType, Decision } from '@/types';
import { NarrativeBlock, NarrativeSeparator } from './NarrativeBlock';
import { BookOpen } from 'lucide-react';

interface NarrativePanelProps {
  blocks: NarrativeBlockType[];
  decisions: Decision[];
  currentChapter: number;
  accentColor?: string;
}

export function NarrativePanel({
  blocks,
  decisions,
  currentChapter,
  accentColor = '#d4af37',
}: NarrativePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new blocks are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [blocks.length]);

  // Group blocks by chapter and detect chapter titles
  const processedBlocks = blocks.map((block, index) => {
    const prevBlock = index > 0 ? blocks[index - 1] : null;
    const isNewChapter = !prevBlock || block.timestamp > prevBlock.timestamp + 60000; // New chapter if > 1 min gap

    // Check if this block is related to a decision
    const relatedDecision = decisions.find(
      (d) => Math.abs(d.timestamp - block.timestamp) < 5000
    );

    return {
      block,
      isNewChapter,
      chapterTitle: isNewChapter ? `Глава ${currentChapter}` : undefined,
      isDecision: !!relatedDecision,
    };
  });

  const hasContent = blocks.length > 0;

  return (
    <div className="h-full flex flex-col bg-[#0d0d14] border-r border-white/5">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 py-4 border-b border-white/5">
        <BookOpen className="w-4 h-4 text-white/50" />
        <span className="text-sm font-medium text-white/70">Нарратив</span>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        <div className="p-6 font-serif">
          {hasContent ? (
            <div className="space-y-2">
              {processedBlocks.map((item, index) => (
                <div key={item.block.id}>
                  {index > 0 && <NarrativeSeparator />}
                  <NarrativeBlock
                    block={item.block}
                    showChapterTitle={item.isNewChapter}
                    chapterTitle={item.chapterTitle}
                    isDecision={item.isDecision}
                    accentColor={accentColor}
                  />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <BookOpen
                  className="w-8 h-8"
                  style={{ color: accentColor }}
                />
              </div>
              <p className="text-white/40 text-sm max-w-xs">
                Ваше приключение начнётся здесь. Введите первое сообщение, чтобы начать историю.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Chapter indicator at bottom */}
      {hasContent && (
        <div className="flex-shrink-0 px-6 py-3 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Глава {currentChapter}</span>
            <span>{blocks.length} блоков</span>
          </div>
        </div>
      )}
    </div>
  );
}
