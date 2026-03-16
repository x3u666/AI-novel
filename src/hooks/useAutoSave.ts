'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { saveSlot } from '@/services/saveService';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  /** Whether auto-save is enabled */
  enabled?: boolean;
  /** Auto-save interval in milliseconds (default: 5 minutes) */
  interval?: number;
  /** Show toast notifications on save */
  showToasts?: boolean;
}

/**
 * Custom hook for auto-save functionality
 * 
 * Features:
 * - Auto-saves every X minutes if there are changes
 * - Auto-saves after each decision
 * - Auto-saves on chapter change
 * - Shows toast notification on save
 */
export function useAutoSave({
  enabled = true,
  interval = 5 * 60 * 1000, // 5 minutes default
  showToasts = true,
}: UseAutoSaveOptions = {}) {
  const { toast } = useToast();
  const lastSaveTimeRef = useRef<number>(0);
  const lastDecisionCountRef = useRef<number>(0);
  const lastChapterRef = useRef<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current state values
  const decisions = useGameStore((state) => state.decisions);
  const currentChapter = useGameStore((state) => state.currentChapter);
  const isGameStarted = useGameStore((state) => state.isGameStarted);

  // Perform save
  const performSave = useCallback((reason: string) => {
    if (!isGameStarted) return;

    try {
      saveSlot(0, useGameStore.getState()); // Auto-save slot (index 0)
      lastSaveTimeRef.current = Date.now();
      
      if (showToasts) {
        toast({
          title: 'Автосохранение',
          description: `Игра сохранена (${reason})`,
          duration: 2000,
        });
      }
      
      console.log(`[AutoSave] Saved: ${reason}`);
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error);
      
      if (showToasts) {
        toast({
          title: 'Ошибка сохранения',
          description: 'Не удалось сохранить игру',
          variant: 'destructive',
          duration: 3000,
        });
      }
    }
  }, [isGameStarted, showToasts, toast]);

  // Set up interval auto-save
  useEffect(() => {
    if (!enabled || !isGameStarted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
      
      // Only save if enough time has passed
      if (timeSinceLastSave >= interval) {
        performSave('по таймеру');
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isGameStarted, interval, performSave]);

  // Auto-save on decision change
  useEffect(() => {
    if (!enabled || !isGameStarted) return;

    const currentDecisionCount = decisions.length;
    
    // Check if a new decision was made
    if (currentDecisionCount > lastDecisionCountRef.current && lastDecisionCountRef.current > 0) {
      // Small delay to let the state update
      const timeoutId = setTimeout(() => {
        performSave('после решения');
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
    
    lastDecisionCountRef.current = currentDecisionCount;
  }, [decisions.length, enabled, isGameStarted, performSave]);

  // Auto-save on chapter change
  useEffect(() => {
    if (!enabled || !isGameStarted) return;

    // Check if chapter changed
    if (currentChapter > lastChapterRef.current && lastChapterRef.current > 0) {
      // Small delay to let the state update
      const timeoutId = setTimeout(() => {
        performSave('новая глава');
      }, 1000);
      
      lastChapterRef.current = currentChapter;
      return () => clearTimeout(timeoutId);
    }
    
    lastChapterRef.current = currentChapter;
  }, [currentChapter, enabled, isGameStarted, performSave]);

  // Initialize refs
  useEffect(() => {
    lastDecisionCountRef.current = decisions.length;
    lastChapterRef.current = currentChapter;
  }, []); // Only on mount

  // Manual save function
  const saveNow = useCallback((reason: string = 'ручное сохранение') => {
    performSave(reason);
  }, [performSave]);

  return {
    saveNow,
    lastSaveTime: lastSaveTimeRef.current,
  };
}
