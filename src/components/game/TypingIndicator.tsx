'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { NarratorPreset } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  preset: NarratorPreset;
  isVisible: boolean;
}

export function TypingIndicator({ preset, isVisible }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex gap-3"
        >
          {/* Avatar */}
          <Avatar className="w-10 h-10 shrink-0 ring-2 ring-white/10">
            <AvatarFallback
              className="text-lg font-serif"
              style={{
                backgroundColor: `${preset.accentColor}30`,
                color: preset.accentColor,
              }}
            >
              {preset.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Typing dots */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-sm font-medium"
                style={{ color: preset.accentColor }}
              >
                {preset.name}
              </span>
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderLeft: `2px solid ${preset.accentColor}40`,
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: preset.accentColor }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
