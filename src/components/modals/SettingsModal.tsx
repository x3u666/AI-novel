'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import type { TextSize } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const textSizeLabels: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'xlarge', label: 'XL' },
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const {
    textSize,
    typingSpeed,
    autoPlaySpeed,
    musicVolume,
    sfxVolume,
    setTextSize,
    setTypingSpeed,
    setAutoPlaySpeed,
    setMusicVolume,
    setSfxVolume,
    resetSettings,
  } = useSettingsStore();

  // Convert autoPlaySpeed from ms to seconds for display
  const autoPlaySeconds = autoPlaySpeed / 1000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] bg-[#1a1a24] border-white/10 text-white"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Настройки
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Text Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">
              Размер текста
            </label>
            <div className="flex gap-2">
              {textSizeLabels.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setTextSize(size.value)}
                  className={`
                    flex-1 py-2 px-4 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      textSize === size.value
                        ? 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37]'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                    }
                  `}
                >
                  {size.label}
                </button>
              ))}
            </div>
            {/* Live preview */}
            <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 min-h-[48px] flex items-center">
              <p
                className="text-white/70 leading-snug line-clamp-2 transition-all duration-200"
                style={{
                  fontSize: textSize === 'small' ? '12px'
                    : textSize === 'medium' ? '14px'
                    : textSize === 'large' ? '16px'
                    : '19px',
                }}
              >
                Рассказчик произнёс слова, и мир вокруг изменился навсегда.
              </p>
            </div>
          </div>

          {/* Typing Speed */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">
                Скорость печати
              </label>
              <span className="text-sm text-white/50">{typingSpeed} симв/сек</span>
            </div>
            <Slider
              value={[typingSpeed]}
              min={20}
              max={100}
              step={5}
              onValueChange={([value]) => setTypingSpeed(value)}
              className="w-full"
            />
          </div>

          {/* Auto-play Speed */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">
                Скорость автопроигрывания
              </label>
              <span className="text-sm text-white/50">{autoPlaySeconds.toFixed(1)} сек</span>
            </div>
            <Slider
              value={[autoPlaySeconds]}
              min={1}
              max={5}
              step={0.5}
              onValueChange={([value]) => setAutoPlaySpeed(value * 1000)}
              className="w-full"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">
                Громкость музыки
              </label>
              <span className="text-sm text-white/50">{musicVolume}%</span>
            </div>
            <Slider
              value={[musicVolume]}
              min={0}
              max={100}
              step={5}
              onValueChange={([value]) => setMusicVolume(value)}
              className="w-full"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">
                Громкость эффектов
              </label>
              <span className="text-sm text-white/50">{sfxVolume}%</span>
            </div>
            <Slider
              value={[sfxVolume]}
              min={0}
              max={100}
              step={5}
              onValueChange={([value]) => setSfxVolume(value)}
              className="w-full"
            />
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="w-full bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Сбросить настройки
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
