'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NarratorCard } from './NarratorCard';
import type { NarratorPreset, PresetId } from '@/types/narrator';

interface NarratorGridProps {
  presets: NarratorPreset[];
  selectedId: PresetId | null;
  onSelect: (id: PresetId) => void;
}

function getCardStep(): number {
  if (typeof window === 'undefined') return 186;
  if (window.innerWidth >= 768) return 186; // 170px card + 16px gap
  if (window.innerWidth >= 640) return 171; // 155px card + 16px gap
  return 146;                               // 130px card + 16px gap
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout>;
  return ((...a: unknown[]) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }) as T;
}

export function NarratorGrid({ presets, selectedId, onSelect }: NarratorGridProps) {
  const [offset, setOffset] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [cardStep, setCardStep] = useState(186);
  const touchStartX = useRef<number | null>(null);

  // Sync cardStep + visibleCount on mount/resize
  useEffect(() => {
    function update() {
      setCardStep(getCardStep());
      const w = window.innerWidth;
      setVisibleCount(6);
    }
    update();
    const onResize = debounce(update, 150);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectedIdx = presets.findIndex((p) => p.id === selectedId);
  const maxOffset = Math.max(0, presets.length - visibleCount);

  // Arrows select prev/next card (not just scroll viewport)
  const goLeft = useCallback(() => {
    if (selectedIdx > 0) onSelect(presets[selectedIdx - 1].id);
  }, [selectedIdx, presets, onSelect]);

  const goRight = useCallback(() => {
    if (selectedIdx < presets.length - 1) onSelect(presets[selectedIdx + 1].id);
  }, [selectedIdx, presets, onSelect]);

  const canGoLeft = selectedIdx > 0;
  const canGoRight = selectedIdx < presets.length - 1;

  // Keep selected card visible in viewport
  useEffect(() => {
    if (selectedIdx < offset) {
      setOffset(selectedIdx);
    } else if (selectedIdx >= offset + visibleCount) {
      setOffset(selectedIdx - visibleCount + 1);
    }
  }, [selectedIdx, offset, visibleCount]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goLeft();
      if (e.key === 'ArrowRight') goRight();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goLeft, goRight]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) goRight();
    else if (dx > 40) goLeft();
    touchStartX.current = null;
  };

  const translateX = -offset * cardStep;

  // Exactly 6 full cards, no clipping, no fade
  const containerWidth = 6 * cardStep - 16;

  return (
    <div className="flex flex-col items-center w-full max-w-[1100px] mx-auto select-none">
      <div className="relative flex items-center w-full">

        {/* Left arrow */}
        <button
          onClick={goLeft}
          disabled={!canGoLeft}
          aria-label="Предыдущий"
          className="flex-shrink-0 flex items-center justify-center rounded-full mr-3 z-10 transition-all duration-200"
          style={{
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: canGoLeft ? 1 : 0.25,
            cursor: canGoLeft ? 'pointer' : 'default',
            visibility: maxOffset > 0 ? 'visible' : 'hidden',
          }}
          onMouseEnter={e => canGoLeft && ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)')}
        >
          <ChevronLeft size={16} color="#9898A6" />
        </button>

        {/* Track — exactly 6 full cards */}
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            touchAction: 'pan-x',
            width: `${containerWidth}px`,
            maxWidth: '100%',
            flexShrink: 0,
            margin: '0 auto',
          }}
        >
          <div
            className="flex gap-4 py-2"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: 'transform 0.32s cubic-bezier(0.25, 0.4, 0.25, 1)',
              willChange: 'transform',
            }}
          >
            {presets.map((preset, index) => (
              <NarratorCard
                key={preset.id}
                preset={preset}
                selected={selectedId === preset.id}
                onClick={() => onSelect(preset.id)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={goRight}
          disabled={!canGoRight}
          aria-label="Следующий"
          className="flex-shrink-0 flex items-center justify-center rounded-full ml-3 z-10 transition-all duration-200"
          style={{
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: canGoRight ? 1 : 0.25,
            cursor: canGoRight ? 'pointer' : 'default',
            visibility: maxOffset > 0 ? 'visible' : 'hidden',
          }}
          onMouseEnter={e => canGoRight && ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)')}
        >
          <ChevronRight size={16} color="#9898A6" />
        </button>
      </div>

      {/* Dot indicators — plain CSS, no Framer Motion */}
      <div className="flex items-center gap-2 mt-4">
        {presets.map((preset) => {
          const isActive = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.id)}
              aria-label={preset.name}
              style={{
                width: isActive ? 8 : 6,
                height: isActive ? 8 : 6,
                borderRadius: '50%',
                backgroundColor: isActive ? preset.accentColor : 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
