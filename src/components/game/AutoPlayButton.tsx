'use client';

import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutoPlayButtonProps {
  isActive: boolean;
  onToggle: () => void;
  progress?: number; // 0-100
  disabled?: boolean;
  autoPlaySpeed?: number; // in ms
}

export function AutoPlayButton({
  isActive,
  onToggle,
  progress = 0,
  disabled = false,
  autoPlaySpeed = 3000,
}: AutoPlayButtonProps) {
  const seconds = autoPlaySpeed / 1000;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onToggle}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200
            ${disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer'
            }
          `}
          style={{
            backgroundColor: isActive
              ? 'rgba(212, 175, 55, 0.15)'
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${
              isActive
                ? 'rgba(212, 175, 55, 0.3)'
                : 'rgba(255, 255, 255, 0.08)'
            }`,
          }}
        >
          {/* Progress bar (only when active) */}
          {isActive && (
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-[#d4af37]/10"
                style={{ width: `${progress}%` }}
              />
            </motion.div>
          )}

          {/* Icon */}
          <motion.div
            animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {isActive ? (
              <Pause className="w-4 h-4 text-[#d4af37]" />
            ) : (
              <Play className="w-4 h-4 text-white/50" />
            )}
          </motion.div>

          {/* Label */}
          <span
            className={`
              text-xs font-medium relative z-10
              ${isActive ? 'text-[#d4af37]' : 'text-white/50'}
            `}
          >
            {isActive ? 'Авто' : `Авто (${seconds}с)`}
          </span>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-black/80 border border-white/10 text-white/80 text-xs"
      >
        {isActive
          ? 'Автопроигрывание активно'
          : `Автоматически продолжать через ${seconds} секунд`
        }
      </TooltipContent>
    </Tooltip>
  );
}

// Simple inline progress indicator for use in other components
export function AutoPlayProgress({
  progress,
  isActive,
}: {
  progress: number;
  isActive: boolean;
}) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: '100%' }}
      exit={{ opacity: 0, width: 0 }}
      className="h-1 overflow-hidden"
    >
      <Progress
        value={progress}
        className="h-full bg-transparent"
      />
    </motion.div>
  );
}
