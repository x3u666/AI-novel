'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import type { TextSize, GameFont } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  GAME_FONT_LABELS,
  GAME_FONT_FAMILIES,
  GAME_FONT_WEIGHTS,
  GAME_FONT_LINE_HEIGHTS,
} from '@/types/ui';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'small',  label: 'S'  },
  { value: 'medium', label: 'M'  },
  { value: 'large',  label: 'L'  },
  { value: 'xlarge', label: 'XL' },
];

const FONTS: GameFont[] = ['inter', 'source_serif', 'spectral'];

// Pixel sizes for the preview text, matching the actual game font sizes
const PREVIEW_SIZE: Record<TextSize, string> = {
  small:  '13px',
  medium: '15px',
  large:  '17px',
  xlarge: '20px',
};

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const pathname = usePathname();
  const isGamePage = pathname === '/game';

  const {
    textSize, typingSpeed, musicVolume, sfxVolume, gameFont,
    setTextSize, setTypingSpeed, setMusicVolume, setSfxVolume,
    setGameFont, resetSettings,
  } = useSettingsStore();

  const previewSize   = PREVIEW_SIZE[textSize ?? 'large'];
  const previewWeight = GAME_FONT_WEIGHTS[gameFont ?? 'inter'];
  const previewLH     = GAME_FONT_LINE_HEIGHTS[gameFont ?? 'inter'];
  const previewFamily = GAME_FONT_FAMILIES[gameFont ?? 'inter'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] bg-[#1a1a24] border-white/10 text-white max-h-[90vh] overflow-y-auto"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Настройки</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">

          {/* Text Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Размер текста</label>
            <div className="flex gap-2">
              {TEXT_SIZES.map(({ value, label }) => (
                <button key={value} onClick={() => setTextSize(value)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    textSize === value
                      ? 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37]'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Preview — реагирует на размер и шрифт */}
            <div
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center transition-all duration-200"
              style={{ minHeight: textSize === 'xlarge' ? '68px' : textSize === 'large' ? '58px' : '48px' }}
            >
              <p
                className="text-white/70 leading-snug line-clamp-3 transition-all duration-200"
                style={{
                  fontSize: previewSize,
                  fontFamily: previewFamily,
                  fontWeight: previewWeight,
                  lineHeight: previewLH,
                }}
              >
                Рассказчик произнёс слова, и мир вокруг изменился навсегда.
              </p>
            </div>
          </div>

          {/* Game Font — только на экране игры */}
          {isGamePage && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/80">Шрифт</label>
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font}
                    onClick={() => setGameFont(font)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all duration-200 truncate ${
                      gameFont === font
                        ? 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37]'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                    }`}
                    style={{
                      fontFamily: GAME_FONT_FAMILIES[font],
                      fontWeight: GAME_FONT_WEIGHTS[font],
                    }}
                  >
                    {GAME_FONT_LABELS[font]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Speed */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">Скорость печати</label>
              <span className="text-sm text-white/50">{typingSpeed} симв/сек</span>
            </div>
            <Slider value={[typingSpeed]} min={20} max={100} step={5}
              onValueChange={([v]) => setTypingSpeed(v)} className="w-full" />
          </div>

          {/* Music Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">Громкость музыки</label>
              <span className="text-sm text-white/50">{musicVolume}%</span>
            </div>
            <Slider value={[musicVolume]} min={0} max={100} step={5}
              onValueChange={([v]) => setMusicVolume(v)} className="w-full" />
          </div>

          {/* SFX Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">Громкость эффектов</label>
              <span className="text-sm text-white/50">{sfxVolume}%</span>
            </div>
            <Slider value={[sfxVolume]} min={0} max={100} step={5}
              onValueChange={([v]) => setSfxVolume(v)} className="w-full" />
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-white/10">
            <Button variant="outline" onClick={resetSettings}
              className="w-full bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20">
              <RotateCcw className="mr-2 h-4 w-4" />
              Сбросить настройки
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
