'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameStore } from '@/stores/gameStore';
import { getPresetById } from '@/data/presets';
import { NARRATOR_MUSIC, FALLBACK_MUSIC } from '@/data/music';

const FADE_INTERVAL_MS = 50;   // как часто обновляется громкость при fade
const FADE_STEP       = 0.04;  // шаг изменения громкости (0..1)

/**
 * Хук фоновой музыки.
 *
 * Использование:
 *   useBackgroundMusic()              — автоматически берёт трек текущего нарратора
 *   useBackgroundMusic('/music/x.mp3') — принудительно играет конкретный файл
 *
 * Громкость синхронизируется с settingsStore.musicVolume в реальном времени.
 * При смене трека — плавный fade-out → fade-in.
 */
export function useBackgroundMusic(overrideUrl?: string) {
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const musicVolume     = useSettingsStore((s) => s.musicVolume);
  const selectedNarrator = useGameStore((s) => s.selectedNarrator);

  // Определяем трек: override > backgroundMusicUrl пресета > NARRATOR_MUSIC > fallback
  let trackUrl: string = FALLBACK_MUSIC;

  if (overrideUrl) {
    trackUrl = overrideUrl;
  } else if (selectedNarrator) {
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

  const targetVolume = musicVolume / 100;

  // ─── Смена трека с fade ───────────────────────────────────────────────────
  useEffect(() => {
    const startNewTrack = () => {
      const audio = new Audio(trackUrl);
      audio.loop   = true;
      audio.volume = 0; // начинаем с тишины → fade-in
      audioRef.current = audio;

      audio.play().then(() => {
        // fade-in после успешного старта
        fadeIntervalRef.current = setInterval(() => {
          if (!audioRef.current) return;
          const next = Math.min(audioRef.current.volume + FADE_STEP, targetVolume);
          audioRef.current.volume = next;
          if (next >= targetVolume) {
            clearInterval(fadeIntervalRef.current!);
          }
        }, FADE_INTERVAL_MS);
      }).catch(() => {
        // Браузер заблокировал автоплей — запустим при первом клике
        const resume = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume, { once: true });
      });
    };

    const prev = audioRef.current;

    if (prev) {
      // fade-out старого трека, потом запуск нового
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
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUrl]);

  // ─── Реактивное обновление громкости ─────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = targetVolume;
    }
  }, [targetVolume]);
}
