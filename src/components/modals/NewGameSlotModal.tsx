'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getUserSlots, deleteSlot, type SaveSlot } from '@/services/saveService';
import { formatDate } from '@/utils/formatDate';
import { formatTimeFromMs } from '@/utils/formatTime';
import { getPresetById } from '@/data/presets';
import type { EndingType } from '@/types';

const ENDING_COLORS: Record<EndingType, string> = {
  good: '#4ade80',
  neutral: '#94a3b8',
  bad: '#f87171',
};

const ENDING_LABELS: Record<EndingType, string> = {
  good: 'Хорошая',
  neutral: 'Нейтральная',
  bad: 'Плохая',
};

interface NewGameSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSlotSelected: (slotIndex: number) => void;
}

export function NewGameSlotModal({
  open,
  onOpenChange,
  onSlotSelected,
}: NewGameSlotModalProps) {
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([null, null, null]);
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);

  // Load slots 1-3 when modal opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        setSlots(getUserSlots());
        setPendingSlot(null);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  const handleSlotClick = (slotIndex: number) => {
    const slot = slots[slotIndex - 1]; // slots array is 0-indexed, slotIndex is 1-3
    if (slot) {
      // Occupied — ask for overwrite confirmation
      setPendingSlot(slotIndex);
    } else {
      // Empty — proceed immediately
      onSlotSelected(slotIndex);
      onOpenChange(false);
    }
  };

  const handleConfirmOverwrite = () => {
    if (pendingSlot !== null) {
      deleteSlot(pendingSlot);
      deleteSlot(0); // clear auto-save so Continue won't load deleted save
      onSlotSelected(pendingSlot);
      onOpenChange(false);
    }
  };

  const handleCancelOverwrite = () => {
    setPendingSlot(null);
  };

  const handleDeleteSlot = (e: React.MouseEvent, slotIndex: number) => {
    e.stopPropagation();
    deleteSlot(slotIndex);
    deleteSlot(0); // clear auto-save so Continue won't load deleted save
    setTimeout(() => setSlots(getUserSlots()), 0);
    setPendingSlot(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] bg-[#1a1a24] border-white/10 text-white"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Выберите слот для сохранения
          </DialogTitle>
          <p className="text-sm text-white/40 mt-1">
            Прогресс будет автоматически записываться в выбранный слот
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((slotIndex) => {
            const slot = slots[slotIndex - 1];
            const isEmpty = !slot;
            const isPending = pendingSlot === slotIndex;
            const narratorPreset = slot?.narratorId ? getPresetById(slot.narratorId) : null;

            return (
              <div key={slotIndex}>
                <motion.div
                  whileHover={!isPending ? { scale: 1.01 } : undefined}
                  onClick={() => !isPending && handleSlotClick(slotIndex)}
                  className={`
                    rounded-xl border transition-all duration-200 cursor-pointer
                    ${isPending
                      ? 'border-[#d4af37]/40 bg-[#d4af37]/5'
                      : isEmpty
                        ? 'border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    {/* Slot number */}
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: isEmpty ? 'rgba(255,255,255,0.04)' : `${narratorPreset?.accentColor ?? '#d4af37'}15`,
                        color: isEmpty ? 'rgba(255,255,255,0.25)' : (narratorPreset?.accentColor ?? '#d4af37'),
                      }}
                    >
                      {slotIndex}
                    </div>

                    {/* Content */}
                    {isEmpty ? (
                      <div className="flex-1">
                        <span className="text-white/30 text-sm">Пусто</span>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white/90 text-sm font-medium">
                            {narratorPreset?.name ?? slot.name}
                          </span>
                          {slot.gameState?.isFinished && slot.gameState.endingId && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${ENDING_COLORS[slot.gameState.endingId]}20`,
                                color: ENDING_COLORS[slot.gameState.endingId],
                                border: `1px solid ${ENDING_COLORS[slot.gameState.endingId]}40`,
                              }}
                            >
                              Завершено · {ENDING_LABELS[slot.gameState.endingId]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Гл. {slot.chapter}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeFromMs(slot.playTime * 1000)}
                          </span>
                          <span>{formatDate(slot.timestamp)}</span>
                        </div>
                        {slot.preview && (
                          <p className="text-xs text-white/30 mt-1 truncate max-w-[280px]">
                            {slot.preview}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Delete button — only for occupied slots */}
                    {!isEmpty && !isPending && (
                      <button
                        onClick={(e) => handleDeleteSlot(e, slotIndex)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Удалить сохранение"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Inline overwrite warning */}
                  <AnimatePresence>
                    {isPending && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 border-t border-[#d4af37]/20 pt-3">
                          <div className="flex items-start gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-white/70">
                              Это перезапишет сохранение в слоте {slotIndex}. Старый прогресс будет удалён безвозвратно.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleCancelOverwrite(); }}
                              className="flex-1 bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white text-xs h-8"
                            >
                              Отмена
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleConfirmOverwrite(); }}
                              className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs h-8"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Перезаписать
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-white/30 text-center mt-4">
          Выберите пустой слот или перезапишите существующий
        </p>
      </DialogContent>
    </Dialog>
  );
}
