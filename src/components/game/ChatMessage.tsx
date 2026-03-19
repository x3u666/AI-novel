'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType, NarratorPreset } from '@/types';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useSettingsStore } from '@/stores/settingsStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatTimestamp } from '@/utils/formatTime';

interface ChatMessageProps {
  message: ChatMessageType;
  preset: NarratorPreset;
  useTypewriterEffect?: boolean;
  onTypingComplete?: () => void;
}

export function ChatMessage({
  message,
  preset,
  useTypewriterEffect = false,
  onTypingComplete,
}: ChatMessageProps) {
  const typingSpeed = useSettingsStore((state) => state.typingSpeed);
  const gameFont = useSettingsStore((state) => state.gameFont);
  const messageRef = useRef<HTMLDivElement>(null);

  // Font family map
  const fontFamilyMap: Record<string, string> = {
    inter:    '"Inter", sans-serif',
    bookerly: '"Bookerly", "Georgia", serif',
    literata: '"Literata", "Georgia", serif',
    garamond: '"Garamond", "EB Garamond", serif',
    georgia:  '"Georgia", serif',
  };
  const fontFamily = fontFamilyMap[gameFont ?? 'inter'] ?? '"Inter", sans-serif';

  // Typewriter effect for narrator messages
  const { displayText, isTyping, skipToEnd } = useTypewriter({
    text: message.content,
    speed: typingSpeed,
    onComplete: onTypingComplete,
    enabled: useTypewriterEffect && message.role === 'narrator' && !message.isTyping,
  });

  // Skip typewriter on click
  const handleClick = () => {
    if (isTyping) {
      skipToEnd();
    }
  };

  // Auto-scroll to this message when it appears
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  const isNarrator = message.role === 'narrator';
  const isUser = message.role === 'user';
  const isSystem = message.role === 'assistant' && !isNarrator;

  // System message style
  if (isSystem) {
    return (
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-4 py-4"
      >
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40 px-4">{message.content}</span>
        <div className="flex-1 h-px bg-white/10" />
      </motion.div>
    );
  }

  // User message style (right-aligned)
  if (isUser) {
    return (
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-end gap-3"
      >
        <div className="max-w-[80%]">
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3 text-white/95"
            style={{
              backgroundColor: `${preset.accentColor}20`,
              border: `1px solid ${preset.accentColor}30`,
            }}
          >
            <p className="whitespace-pre-wrap leading-relaxed" style={{ fontFamily }}>{message.content}</p>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-white/30">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Narrator message style (left-aligned)
  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className="flex gap-3 cursor-pointer"
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

      {/* Message content */}
      <div className="flex-1 max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-medium"
            style={{ color: preset.accentColor }}
          >
            {preset.name}
          </span>
          <span className="text-xs text-white/30">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderLeft: `2px solid ${preset.accentColor}40`,
          }}
        >
          <p className="whitespace-pre-wrap leading-relaxed text-white/90" style={{ fontFamily }}>
            {useTypewriterEffect && isTyping ? displayText : message.content}
          </p>
          {isTyping && (
            <span
              className="inline-block w-2 h-4 ml-1 animate-pulse"
              style={{ backgroundColor: preset.accentColor }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
