'use client';

import { useRef } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { NarratorCard } from './NarratorCard';
import type { NarratorPreset, PresetId } from '@/types/narrator';

interface NarratorGridProps {
  presets: NarratorPreset[];
  selectedId: PresetId | null;
  onSelect: (id: PresetId) => void;
}

export function NarratorGrid({ presets, selectedId, onSelect }: NarratorGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea className="w-full" ref={scrollContainerRef}>
      <div className="flex gap-3 md:gap-4 px-2 py-2">
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
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  );
}
