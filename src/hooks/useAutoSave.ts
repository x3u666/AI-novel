'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { saveGame } from '@/services/saveService';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number;
  showToasts?: boolean;
}

export function useAutoSave({
  enabled = true,
  interval = 3 * 60 * 1000, // 3 minutes
  showToasts = false,
}: UseAutoSaveOptions = {}) {
  const { toast } = useToast();
  const lastDecisionCountRef = useRef<number>(0);
  const lastChapterRef = useRef<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const decisions = useGameStore((state) => state.decisions);
  const currentChapter = useGameStore((state) => state.currentChapter);
  const isGameStarted = useGameStore((state) => state.isGameStarted);
  const isFinished = useGameStore((state) => state.isFinished);

  const performSave = useCallback((reason: string) => {
    if (!isGameStarted || isFinished) return;

    try {
      const state = useGameStore.getState();
      saveGame(state.selectedSlotIndex, state);

      if (showToasts) {
        toast({
          title: 'Автосохранение',
          description: `Игра сохранена (${reason})`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[AutoSave] Failed:', error);
      if (showToasts) {
        toast({
          title: 'Ошибка сохранения',
          description: 'Не удалось сохранить игру',
          variant: 'destructive',
          duration: 3000,
        });
      }
    }
  }, [isGameStarted, isFinished, showToasts, toast]);

  // Interval save
  useEffect(() => {
    if (!enabled || !isGameStarted || isFinished) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      performSave('по таймеру');
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isGameStarted, isFinished, interval, performSave]);

  // Save after each decision
  useEffect(() => {
    if (!enabled || !isGameStarted || isFinished) return;

    const currentCount = decisions.length;
    if (currentCount > lastDecisionCountRef.current && lastDecisionCountRef.current > 0) {
      const id = setTimeout(() => performSave('после решения'), 500);
      lastDecisionCountRef.current = currentCount;
      return () => clearTimeout(id);
    }
    lastDecisionCountRef.current = currentCount;
  }, [decisions.length, enabled, isGameStarted, isFinished, performSave]);

  // Save on chapter change
  useEffect(() => {
    if (!enabled || !isGameStarted || isFinished) return;

    if (currentChapter > lastChapterRef.current && lastChapterRef.current > 0) {
      const id = setTimeout(() => performSave('новая глава'), 1000);
      lastChapterRef.current = currentChapter;
      return () => clearTimeout(id);
    }
    lastChapterRef.current = currentChapter;
  }, [currentChapter, enabled, isGameStarted, isFinished, performSave]);

  // Initialize refs on mount
  useEffect(() => {
    lastDecisionCountRef.current = decisions.length;
    lastChapterRef.current = currentChapter;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on unmount (exit from game page)
  useEffect(() => {
    return () => {
      const state = useGameStore.getState();
      if (state.isGameStarted && !state.isFinished) {
        try {
          saveGame(state.selectedSlotIndex, state);
        } catch (e) {
          console.error('[AutoSave] Unmount save failed:', e);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveNow = useCallback((reason = 'ручное сохранение') => {
    performSave(reason);
  }, [performSave]);

  return { saveNow };
}
