'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Home,
  BookOpen,
  Save,
  ChevronLeft,
  Music2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MusicPlayer } from '@/components/game/MusicPlayer';

interface ToolbarProps {
  title: string;
  showSettings?: boolean;
  showHome?: boolean;
  showDiary?: boolean;
  showSave?: boolean;
  showBack?: boolean;
  showMusic?: boolean;
  presetIndicator?: { color: string; name: string };
  chapterNumber?: number;
  accentColor?: string;
  trackName?: string;
  onSettingsClick?: () => void;
  onSaveClick?: () => void;
  onDiaryClick?: () => void;
  onBackClick?: () => void;
  className?: string;
}

export function Toolbar({
  title,
  showSettings = false,
  showHome = false,
  showDiary = false,
  showSave = false,
  showBack = false,
  showMusic = false,
  presetIndicator,
  chapterNumber,
  accentColor = '#d4af37',
  trackName,
  onSettingsClick,
  onSaveClick,
  onDiaryClick,
  onBackClick,
  className,
}: ToolbarProps) {
  const router = useRouter();
  const [musicOpen, setMusicOpen] = useState(false);

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-14 md:h-16',
        'bg-black/40 backdrop-blur-md border-b border-white/10',
        'flex items-center justify-between px-4 md:px-6',
        className
      )}
    >
      {/* Left Section - Logo or Back Button */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Назад
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-playfair text-xl md:text-2xl font-bold text-white/90">
              GenNarrative
            </span>
          </button>
        )}

        {/* Preset Indicator */}
        {presetIndicator && (
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${presetIndicator.color}20`,
              color: presetIndicator.color,
              border: `1px solid ${presetIndicator.color}40`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: presetIndicator.color }}
            />
            {presetIndicator.name}
          </div>
        )}

        {/* Chapter Number */}
        {chapterNumber !== undefined && (
          <div className="hidden md:flex items-center gap-1.5 text-white/50 text-sm">
            <BookOpen className="w-4 h-4" />
            Глава {chapterNumber}
          </div>
        )}
      </div>

      {/* Center Section - Title */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-base md:text-lg font-medium text-white/90">
        {title}
      </h1>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-1 md:gap-2">
        {showMusic && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMusicOpen((v) => !v)}
                className="text-white/70 hover:text-white hover:bg-white/10"
                style={musicOpen ? { color: accentColor } : {}}
              >
                <Music2 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Музыка</TooltipContent>
          </Tooltip>
        )}

        {showSave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSaveClick}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Save className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Сохранить
            </TooltipContent>
          </Tooltip>
        )}

        {showDiary && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDiaryClick}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <BookOpen className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Дневник
            </TooltipContent>
          </Tooltip>
        )}

        {showSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Настройки
            </TooltipContent>
          </Tooltip>
        )}

        {showHome && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleHomeClick}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Home className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Главное меню
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </motion.header>

    {/* Music Player widget */}
    <MusicPlayer
      open={musicOpen}
      onClose={() => setMusicOpen(false)}
      accentColor={accentColor}
      trackName={trackName}
    />
    </>
  );
}
