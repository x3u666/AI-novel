'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameStore } from '@/stores/gameStore';
import { getPresetById } from '@/data/presets';
import {
  MENU_MUSIC,
  ENDING_MUSIC_BY_TYPE,
  ENDING_MUSIC,
  NARRATOR_MUSIC,
  FALLBACK_MUSIC,
} from '@/data/music';

const FADE_INTERVAL_MS = 50;
const FADE_STEP = 0.04;

/**
 * Глобальный провайдер музыки.
 * Живёт в layout.tsx — не размонтируется при переходе между страницами,
 * поэтому переход menu → select-narrator не прерывает трек.
 *
 * Логика выбора трека по pathname:
 *   /                   → MENU_MUSIC
 *   /select-narrator    → MENU_MUSIC (тот же, без прерывания)
 *   /game               → трек нарратора
 *   /ending             → ENDING_MUSIC_BY_TYPE[endingId]
 */
export function MusicProvider() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTrackRef = useRef<string>('');

  const musicVolume = useSettingsStore((s) => s.musicVolume);
  const selectedNarrator = useGameStore((s) => s.selectedNarrator);
  const endingId = useGameStore((s) => s.endingId);
  const targetVolume = musicVolume / 100;

  // Determine track based on current route
  let trackUrl: string = FALLBACK_MUSIC;

  if (pathname === '/' || pathname === '/select-narrator') {
    trackUrl = MENU_MUSIC;
  } else if (pathname === '/game') {
    if (selectedNarrator) {
      try {
        const preset = getPresetById(selectedNarrator);
        trackUrl =
          preset.backgroundMusicUrl ??
          NARRATOR_MUSIC[selectedNarrator] ??
          FALLBACK_MUSIC;
      } catch {
        trackUrl = NARRATOR_MUSIC[selectedNarrator] ?? FALLBACK_MUSIC;
      }
    }
  } else if (pathname === '/ending') {
    trackUrl = endingId
      ? (ENDING_MUSIC_BY_TYPE[endingId] ?? ENDING_MUSIC)
      : ENDING_MUSIC;
  }

  // Change track with fade when trackUrl changes
  useEffect(() => {
    // Same track already playing — don't restart
    if (currentTrackRef.current === trackUrl) return;
    currentTrackRef.current = trackUrl;

    const startNewTrack = () => {
      const audio = new Audio(trackUrl);
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;

      audio.play().then(() => {
        fadeIntervalRef.current = setInterval(() => {
          if (!audioRef.current) return;
          const next = Math.min(audioRef.current.volume + FADE_STEP, targetVolume);
          audioRef.current.volume = next;
          if (next >= targetVolume) clearInterval(fadeIntervalRef.current!);
        }, FADE_INTERVAL_MS);
      }).catch(() => {
        const resume = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume, { once: true });
      });
    };

    const prev = audioRef.current;

    if (prev) {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = setInterval(() => {
        if (!prev) return;
        const next = Math.max(prev.volume - FADE_STEP, 0);
        prev.volume = next;
        if (next <= 0) {
          clearInterval(fadeIntervalRef.current!);
          prev.pause();
          prev.src = '';
          startNewTrack();
        }
      }, FADE_INTERVAL_MS);
    } else {
      startNewTrack();
    }

    return () => {
      // Don't stop audio on unmount — this component lives forever in layout
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUrl]);

  // Reactive volume update
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = targetVolume;
    }
  }, [targetVolume]);

  return null;
}
