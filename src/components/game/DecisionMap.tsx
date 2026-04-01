'use client';

import { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, Pen, Clock } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { Decision, DecisionChoice } from '@/types';

interface DecisionMapProps {
  open: boolean;
  onClose: () => void;
}

interface TreeLevel {
  decision: Decision;
  allOptions: DecisionChoice[];
  levelIndex: number;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

interface LevelNodeProps {
  level: TreeLevel;
  accentColor: string;
  isLast: boolean;
}

function LevelNode({ level, accentColor, isLast }: LevelNodeProps) {
  const { decision, allOptions } = level;
  const isCustom = decision.isCustomInput;

  const chosenOption = decision.choiceText;
  const alternativeOptions = allOptions.filter(o => o.id !== decision.choiceId && o.text !== chosenOption);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Connector line from previous level */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-px origin-top"
        style={{
          height: '32px',
          background: `linear-gradient(to bottom, ${accentColor}60, ${accentColor}30)`,
        }}
      />

      {/* Decision node container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-lg"
      >
        {/* Chapter badge */}
        <div className="flex justify-center mb-2">
          <div
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs"
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}35`,
              color: `${accentColor}cc`,
            }}
          >
            <Clock className="w-3 h-3" />
            <span>Глава {decision.chapter} · {formatTime(decision.timestamp)}</span>
          </div>
        </div>

        {/* Options cluster */}
        <div className="relative flex flex-col gap-2">
          {/* Alternative options (unselected) — shown dimmed above */}
          {alternativeOptions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {alternativeOptions.map((opt, i) => (
                <motion.div
                  key={opt.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  />
                  <span className="text-sm text-white/30 leading-tight">
                    {truncate(opt.text, 72)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Chosen answer — highlighted with chain link marker */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{
              background: isCustom ? `${accentColor}12` : `${accentColor}1a`,
              border: `1.5px solid ${accentColor}${isCustom ? '50' : '60'}`,
              boxShadow: `0 0 16px ${accentColor}18`,
            }}
          >
            {/* Chain link indicator */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
              {isCustom ? (
                <Pen className="w-3.5 h-3.5" style={{ color: accentColor }} />
              ) : (
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: accentColor }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: accentColor }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug font-medium" style={{ color: accentColor }}>
                {truncate(chosenOption, 100)}
              </p>
              {isCustom && (
                <p className="text-xs mt-1" style={{ color: `${accentColor}70` }}>
                  Ваш ответ
                </p>
              )}
              {decision.consequence && (
                <p className="text-xs mt-1 italic text-white/35 leading-tight">
                  {truncate(decision.consequence, 80)}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function DecisionMap({ open, onClose }: DecisionMapProps) {
  const { decisions, currentChapter } = useGameStore();
  const accentColor = '#d4af37';
  const scrollRef = useRef<HTMLDivElement>(null);

  const treeLevels: TreeLevel[] = useMemo(() => {
    return decisions.map((decision, index) => ({
      decision,
      allOptions: decision.allChoices || [
        { id: decision.choiceId, text: decision.choiceText, consequence: decision.consequence }
      ],
      levelIndex: index,
    }));
  }, [decisions]);

  useEffect(() => {
    if (open && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [open, treeLevels.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4" style={{ color: accentColor }} />
                <h2 className="text-base font-semibold text-white/90">Дерево решений</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 px-5 py-2.5 bg-white/3 border-b border-white/5 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0" style={{ borderColor: accentColor }} />
                <span>Выбранный ответ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
                <span>Альтернативы</span>
              </div>
              <div className="flex items-center gap-2">
                <Pen className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
                <span>Свой ответ</span>
              </div>
            </div>

            {/* Tree content */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              {treeLevels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <GitBranch className="w-10 h-10 text-white/15 mb-3" />
                  <p className="text-white/30 text-sm">Ещё нет решений</p>
                  <p className="text-white/20 text-xs mt-1">Дерево строится по мере прохождения истории</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Root node */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center w-10 h-10 rounded-full mb-1"
                    style={{
                      background: `${accentColor}20`,
                      border: `2px solid ${accentColor}50`,
                      boxShadow: `0 0 16px ${accentColor}25`,
                    }}
                  >
                    <span className="text-sm">⚔️</span>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-white/30 mb-1"
                  >
                    Начало истории
                  </motion.p>

                  {/* Decision levels — each appended dynamically */}
                  {treeLevels.map((level, i) => (
                    <LevelNode
                      key={level.decision.id}
                      level={level}
                      accentColor={accentColor}
                      isLast={i === treeLevels.length - 1}
                    />
                  ))}

                  {/* Current position pulse */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-px origin-top"
                    style={{
                      height: '28px',
                      background: `linear-gradient(to bottom, ${accentColor}40, transparent)`,
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-3 h-3 rounded-full"
                    style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
                  />
                  <p className="text-xs text-white/30 mt-2">Вы здесь · Глава {currentChapter}</p>
                </div>
              )}
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-white/3">
              <div className="flex items-center gap-5 text-xs text-white/40">
                <span><span className="text-white/70 font-medium">{decisions.length}</span> решений</span>
                <span><span className="text-white/70 font-medium">{currentChapter}</span> глав</span>
                <span>
                  <span className="text-white/70 font-medium">
                    {decisions.filter((d: Decision) => d.isCustomInput).length}
                  </span> своих ответов
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
