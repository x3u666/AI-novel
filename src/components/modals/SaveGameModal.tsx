'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Clock, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getAllSlots, saveSlot, deleteSlot, type SaveSlot } from '@/services/saveService';
import { useGameStore } from '@/stores/gameStore';
import { formatTimeFromMs } from '@/utils/formatTime';
import { formatDateShort } from '@/utils/formatDate';

interface SaveGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Create slots array outside component
const SLOT_COUNT = 4;

export function SaveGameModal({ open, onOpenChange }: SaveGameModalProps) {
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null);
  const gameState = useGameStore();

  // Load slots when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const loadedSlots = getAllSlots();
        setSlots(loadedSlots);
        setSelectedSlot(null);
        setSaveSuccess(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle slot selection
  const handleSelectSlot = (index: number) => {
    setSelectedSlot(index);
  };

  // Handle save to selected slot
  const handleSave = () => {
    if (selectedSlot === null) return;

    try {
      saveSlot(selectedSlot, gameState);
      setSaveSuccess(selectedSlot);
      setSlots(getAllSlots());
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Handle slot deletion
  const handleDelete = (index: number) => {
    deleteSlot(index);
    setSlots(getAllSlots());
  };

  // Generate slot buttons
  const slotButtons = Array.from({ length: SLOT_COUNT }, (_, index) => {
    const slot = slots[index];
    const isAutoSave = index === 0;
    const isSelected = selectedSlot === index;
    const isJustSaved = saveSuccess === index;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => handleSelectSlot(index)}
        className={`
          w-full text-left p-4 rounded-xl transition-all duration-200 cursor-pointer
          ${isSelected
            ? 'bg-[#d4af37]/20 border-2 border-[#d4af37]/50'
            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
          }
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">
                {isAutoSave ? '🔄 Автосохранение' : `📂 Слот ${index}`}
              </span>
              {isJustSaved && (
                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded">
                  Сохранено!
                </span>
              )}
            </div>

            {slot ? (
              <>
                <div className="flex items-center gap-3 text-xs text-white/50 mb-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Глава {slot.chapter}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeFromMs(slot.playTime * 1000)}
                  </span>
                  <span>{formatDateShort(slot.timestamp)}</span>
                </div>
                <p className="text-sm text-white/70 truncate">
                  {slot.preview}
                </p>
              </>
            ) : (
              <p className="text-sm text-white/40 italic">
                Пустой слот
              </p>
            )}
          </div>

          {slot && !isAutoSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(index);
              }}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a24] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Save className="w-5 h-5" />
            Сохранить игру
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-white/60">
            Выберите слот для сохранения:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {slotButtons}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedSlot === null}
            className="bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
