'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Clock, BookOpen } from 'lucide-react';
import { getUserSlots, deleteSlot, type SaveSlot } from '@/services/saveService';
import { useGameStore } from '@/stores/gameStore';
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
  good: 'Хорошая концовка',
  neutral: 'Нейтральная',
  bad: 'Плохая концовка',
};

interface LoadGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad?: () => void;
}

export function LoadGameModal({ open, onOpenChange, onLoad }: LoadGameModalProps) {
  const router = useRouter();
  // slots[0] = slot index 1, slots[1] = slot index 2, slots[2] = slot index 3
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([null, null, null]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { loadGame } = useGameStore();

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => setSlots(getUserSlots()), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  const handleLoad = (slotIndex: number) => {
    loadGame(slotIndex);
    onOpenChange(false);
    onLoad?.();
    router.push('/game');
  };

  const handleDelete = () => {
    if (deleteConfirm !== null) {
      deleteSlot(deleteConfirm);
      // Also clear auto-save (slot 0) so Continue button won't load a deleted save
      deleteSlot(0);
      setSlots(getUserSlots());
      setDeleteConfirm(null);
    }
  };

  const hasAnySave = slots.some((s) => s !== null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[500px] bg-[#1a1a24] border-white/10 text-white max-h-[85vh] overflow-y-auto"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Загрузить игру
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {!hasAnySave ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">Нет сохранённых игр</p>
                <p className="text-white/25 text-xs mt-1">
                  Начните новую игру и прогресс сохранится автоматически
                </p>
              </div>
            ) : (
              [1, 2, 3].map((slotIndex) => {
                const slot = slots[slotIndex - 1];
                const narratorPreset = slot?.narratorId ? getPresetById(slot.narratorId) : null;
                const isFinished = slot?.gameState?.isFinished ?? false;
                const endingId = slot?.gameState?.endingId ?? null;

                if (!slot) {
                  // Empty slot — show placeholder
                  return (
                    <div
                      key={slotIndex}
                      className="p-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 text-sm font-bold">
                          {slotIndex}
                        </div>
                        <span className="text-white/25 text-sm">Пусто</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={slotIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: slotIndex * 0.05 }}
                    onClick={() => handleLoad(slotIndex)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Slot number with narrator accent */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: `${narratorPreset?.accentColor ?? '#d4af37'}15`,
                            color: narratorPreset?.accentColor ?? '#d4af37',
                          }}
                        >
                          {slotIndex}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white text-sm">
                              {narratorPreset?.name ?? `Слот ${slotIndex}`}
                            </span>
                            {isFinished && endingId && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                style={{
                                  backgroundColor: `${ENDING_COLORS[endingId]}18`,
                                  color: ENDING_COLORS[endingId],
                                  border: `1px solid ${ENDING_COLORS[endingId]}35`,
                                }}
                              >
                                ✓ {ENDING_LABELS[endingId]}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/45 mt-0.5">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Глава {slot.chapter}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeFromMs(slot.playTime * 1000)}
                            </span>
                            <span>{formatDate(slot.timestamp)}</span>
                          </div>
                          {slot.preview && (
                            <p className="text-xs text-white/30 mt-1 truncate max-w-[300px]">
                              {slot.preview}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(slotIndex);
                        }}
                        className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {hasAnySave && (
            <p className="text-xs text-white/30 text-center mt-4">
              Нажмите на слот для загрузки
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-[#1a1a24] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сохранение?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Это действие нельзя отменить. Сохранение слота {deleteConfirm} будет удалено безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
