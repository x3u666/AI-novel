'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';

interface MusicPlayerProps {
  open: boolean;
  onClose: () => void;
  accentColor?: string;
  trackName?: string;
}

export function MusicPlayer({
  open,
  onClose,
  accentColor = '#d4af37',
  trackName = 'Фоновая музыка',
}: MusicPlayerProps) {
  const musicVolume = useSettingsStore((s) => s.musicVolume);
  const setMusicVolume = useSettingsStore((s) => s.setMusicVolume);

  const [isPlaying, setIsPlaying] = useState(true);
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const prevVolumeRef = useRef<number>(musicVolume > 0 ? musicVolume : 50);

  // Spin animation
  useEffect(() => {
    const spin = (time: number) => {
      if (lastTimeRef.current && isPlaying) {
        const delta = time - lastTimeRef.current;
        setRotation((r) => (r + delta * 0.03) % 360);
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  // Toggle play/pause
  const handleToggle = () => {
    if (isPlaying) {
      prevVolumeRef.current = musicVolume; // запоминаем текущую громкость
      setMusicVolume(0);
      setIsPlaying(false);
    } else {
      setMusicVolume(prevVolumeRef.current); // возвращаем сохранённую
      setIsPlaying(true);
    }
  };

  // Sync isPlaying with volume (если слайдер двигают вручную)
  useEffect(() => {
    if (musicVolume === 0) setIsPlaying(false);
    else {
      prevVolumeRef.current = musicVolume; // обновляем ref при ручном изменении
      setIsPlaying(true);
    }
  }, [musicVolume]);

  const accent = accentColor;
  const accentDim = `${accent}33`;
  const accentMid = `${accent}66`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Player widget */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.25, 0.4, 0.25, 1] }}
            className="fixed z-50"
            style={{
              top: '64px',
              right: '80px',
              width: '260px',
              background: 'rgba(10, 10, 18, 0.92)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${accentMid}`,
              borderRadius: '16px',
              boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 30px ${accentDim}`,
              padding: '20px',
            }}
          >
            {/* Vinyl record */}
            <div className="flex justify-center mb-4">
              <div className="relative" style={{ width: 110, height: 110 }}>
                {/* Outer ring glow */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: isPlaying ? `0 0 20px ${accentDim}, 0 0 40px ${accentDim}` : 'none',
                    transition: 'box-shadow 0.5s',
                  }}
                />

                {/* Spinning disc */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    rotate: rotation,
                    background: `
                      radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0d0d1a 30%, #050508 60%, #111118 100%)
                    `,
                    border: `2px solid ${accentMid}`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Vinyl grooves */}
                  {[18, 26, 34, 42, 50].map((r) => (
                    <div
                      key={r}
                      className="absolute rounded-full"
                      style={{
                        width: `${r * 2}px`,
                        height: `${r * 2}px`,
                        top: `${55 - r}px`,
                        left: `${55 - r}px`,
                        border: `0.5px solid ${accent}18`,
                      }}
                    />
                  ))}

                  {/* Rainbow sheen */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        from 0deg,
                        transparent 0%,
                        ${accent}08 15%,
                        transparent 30%,
                        ${accent}05 50%,
                        transparent 70%,
                        ${accent}08 85%,
                        transparent 100%
                      )`,
                    }}
                  />

                  {/* Center label */}
                  <div
                    className="absolute rounded-full flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: `radial-gradient(circle, ${accent} 0%, ${accent}88 100%)`,
                      boxShadow: `0 0 8px ${accent}66`,
                    }}
                  >
                    {/* Center hole */}
                    <div
                      className="rounded-full"
                      style={{ width: 6, height: 6, background: '#050508' }}
                    />
                  </div>
                </motion.div>

                {/* Tonearm */}
                <div
                  className="absolute"
                  style={{
                    width: 2,
                    height: 38,
                    top: 4,
                    right: 8,
                    background: `linear-gradient(to bottom, ${accent}, ${accent}44)`,
                    borderRadius: 2,
                    transformOrigin: 'top center',
                    transform: isPlaying ? 'rotate(20deg)' : 'rotate(5deg)',
                    transition: 'transform 0.6s ease',
                    boxShadow: `0 0 4px ${accentDim}`,
                  }}
                />
              </div>
            </div>

            {/* Track name */}
            <div className="text-center mb-4">
              <p
                className="text-xs font-medium truncate"
                style={{ color: `${accent}cc`, letterSpacing: '0.08em' }}
              >
                {trackName}
              </p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {isPlaying ? 'Воспроизводится' : 'Пауза'}
              </p>
            </div>

            {/* Play/Pause button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleToggle}
                className="rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  width: 44,
                  height: 44,
                  background: `${accent}22`,
                  border: `1px solid ${accentMid}`,
                  boxShadow: isPlaying ? `0 0 12px ${accentDim}` : 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${accent}44`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${accent}22`;
                }}
              >
                {isPlaying ? (
                  /* Pause icon */
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="2" width="4" height="12" rx="1" fill={accent} />
                    <rect x="9" y="2" width="4" height="12" rx="1" fill={accent} />
                  </svg>
                ) : (
                  /* Play icon */
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2L14 8L4 14V2Z" fill={accent} />
                  </svg>
                )}
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-2">
              {/* Volume icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M2 5H4.5L7 2.5V11.5L4.5 9H2V5Z" fill={`${accent}88`} />
                {musicVolume > 0 && (
                  <path d="M9 4.5C9.8 5.3 10.3 6.1 10.3 7C10.3 7.9 9.8 8.7 9 9.5" stroke={`${accent}88`} strokeWidth="1" strokeLinecap="round" />
                )}
                {musicVolume > 50 && (
                  <path d="M10.5 3C11.8 4.2 12.5 5.5 12.5 7C12.5 8.5 11.8 9.8 10.5 11" stroke={`${accent}66`} strokeWidth="1" strokeLinecap="round" />
                )}
              </svg>

              {/* Slider */}
              <div className="relative flex-1 h-4 flex items-center">
                <div
                  className="w-full h-1 rounded-full"
                  style={{ background: `${accent}22` }}
                />
                <div
                  className="absolute h-1 rounded-full"
                  style={{
                    width: `${musicVolume}%`,
                    background: `linear-gradient(to right, ${accent}88, ${accent})`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="absolute w-full h-4 opacity-0 cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                {/* Thumb */}
                <div
                  className="absolute w-3 h-3 rounded-full pointer-events-none"
                  style={{
                    left: `calc(${musicVolume}% - 6px)`,
                    background: accent,
                    boxShadow: `0 0 6px ${accentMid}`,
                  }}
                />
              </div>

              <span
                className="text-[10px] w-6 text-right"
                style={{ color: `${accent}88` }}
              >
                {musicVolume}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
