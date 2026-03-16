'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { Decision, NarrativeBlock } from '@/types';

interface DiaryPanelProps {
  open: boolean;
  onClose: () => void;
}

interface DiaryEntry {
  chapter: number;
  entries: {
    id: string;
    text: string;
    timestamp: number;
    isDecision: boolean;
  }[];
}

export function DiaryPanel({ open, onClose }: DiaryPanelProps) {
  const { decisions, narrativeBlocks, characters, currentChapter } = useGameStore();

  // Group entries by chapter
  const diaryEntries = useMemo(() => {
    const chapters: DiaryEntry[] = [];

    // Create entries for each chapter up to current chapter
    for (let chapter = 1; chapter <= currentChapter; chapter++) {
      const chapterEntries: DiaryEntry['entries'] = [];

      // Add narrative blocks for this chapter
      const chapterBlocks = narrativeBlocks.filter((block, index) => {
        // Simple heuristic: divide blocks across chapters
        const blocksPerChapter = Math.ceil(narrativeBlocks.length / currentChapter);
        const blockChapter = Math.floor(index / Math.max(1, blocksPerChapter)) + 1;
        return blockChapter === chapter;
      });

      chapterBlocks.forEach(block => {
        // Create a brief description from the narrative content
        const briefText = createBriefDescription(block.content);
        if (briefText) {
          chapterEntries.push({
            id: block.id,
            text: briefText,
            timestamp: block.timestamp,
            isDecision: false,
          });
        }
      });

      // Add decisions for this chapter
      const chapterDecisions = decisions.filter(d => d.chapter === chapter);
      chapterDecisions.forEach(decision => {
        chapterEntries.push({
          id: decision.id,
          text: `Решение: ${decision.choiceText}`,
          timestamp: decision.timestamp,
          isDecision: true,
        });
      });

      // Sort entries by timestamp
      chapterEntries.sort((a, b) => a.timestamp - b.timestamp);

      if (chapterEntries.length > 0) {
        chapters.push({
          chapter,
          entries: chapterEntries,
        });
      }
    }

    return chapters;
  }, [decisions, narrativeBlocks, currentChapter]);

  // Count unique characters met
  const charactersMet = useMemo(() => {
    return characters.filter(c => c.isUnlocked).length;
  }, [characters]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Animation variants
  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
  };

  const entryVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#12121a] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#d4af37]" />
                </div>
                <h2 className="text-lg font-semibold text-white">Дневник героя</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {diaryEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm">Дневник пока пуст</p>
                  <p className="text-xs mt-1">Ваши приключения запишутся здесь</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {diaryEntries.map((chapter) => (
                    <div key={chapter.chapter}>
                      {/* Chapter header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#d4af37] font-semibold">Глава {chapter.chapter}</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>

                      {/* Entries */}
                      <div className="space-y-2">
                        {chapter.entries.map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            custom={index}
                            variants={entryVariants}
                            initial="hidden"
                            animate="visible"
                            className={`
                              p-3 rounded-lg text-sm
                              ${entry.isDecision
                                ? 'bg-[#d4af37]/10 border-l-2 border-[#d4af37]/50'
                                : 'bg-white/5'
                              }
                            `}
                          >
                            <div className="flex items-start gap-2">
                              {entry.isDecision && (
                                <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                              )}
                              <span className={entry.isDecision ? 'text-white/80' : 'text-white/60'}>
                                {entry.text}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer statistics */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center justify-around text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs text-white/50">Принятые решения</span>
                  </div>
                  <span className="text-xl font-semibold text-[#d4af37]">{decisions.length}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs text-white/50">Встречено персонажей</span>
                  </div>
                  <span className="text-xl font-semibold text-[#d4af37]">{charactersMet}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Create a brief description from narrative content
 */
function createBriefDescription(content: string): string | null {
  if (!content || content.length < 20) return null;

  // Get first meaningful sentence
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return null;

  const firstSentence = sentences[0].trim();
  
  // Truncate if too long
  if (firstSentence.length > 80) {
    return firstSentence.slice(0, 77) + '...';
  }
  
  return firstSentence + '.';
}
