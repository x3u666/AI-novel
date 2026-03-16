'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { formatDate } from '@/utils/formatDate';
import { formatTimeFromMs } from '@/utils/formatTime';
import { Trash2, Clock, BookOpen } from 'lucide-react';
import { getAllSlots, deleteSlot, type SaveSlot } from '@/services/saveService';
import { useGameStore } from '@/stores/gameStore';

interface LoadGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad?: () => void;
}

export function LoadGameModal({ open, onOpenChange, onLoad }: LoadGameModalProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { loadGame } = useGameStore();

  // Load slots when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const loadedSlots = getAllSlots();
        setSlots(loadedSlots);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleLoad = (slot: SaveSlot, index: number) => {
    // Load game state from slot using slot index
    loadGame(index);
    onOpenChange(false);
    onLoad?.();
    router.push('/game');
  };

  const handleDelete = () => {
    if (deleteConfirm !== null) {
      deleteSlot(deleteConfirm);
      setSlots(getAllSlots());
      setDeleteConfirm(null);
    }
  };

  // Check if any save exists
  const hasAnySave = slots.some(slot => slot !== null);

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
                <p className="text-white/40 text-sm">
                  Нет сохранённых игр
                </p>
              </div>
            ) : (
              slots.map((slot, index) => {
                if (!slot) return null;

                const isAutoSave = index === 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleLoad(slot, index)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {isAutoSave ? '🔄 Автосохранение' : `📂 Слот ${index}`}
                          </span>
                          {isAutoSave && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                              Авто
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
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
                      </div>

                      {!isAutoSave && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(index);
                          }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Info text */}
          {hasAnySave && (
            <p className="text-xs text-white/40 text-center mt-4">
              Нажмите на слот для загрузки
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-[#1a1a24] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сохранение?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Это действие нельзя отменить. Сохранение будет удалено безвозвратно.
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
