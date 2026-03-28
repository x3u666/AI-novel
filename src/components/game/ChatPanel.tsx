'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { ChatMessage as ChatMessageType, Choice, NarratorPreset } from '@/types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChoiceButtons } from './ChoiceButtons';
import { UserInput } from './UserInput';
import { FinishedGameBanner } from './FinishedGameBanner';
import { MessageSquare } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { GAME_FONT_FAMILIES, GAME_FONT_WEIGHTS, GAME_FONT_LINE_HEIGHTS } from '@/types/ui';

interface ChatPanelProps {
  messages: ChatMessageType[];
  preset: NarratorPreset;
  choices: Choice[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onChoose: (choice: Choice) => void;
  isDisabled?: boolean;
  isFinished?: boolean;
  useTypewriter?: boolean;
  onTypingComplete?: () => void;
}

export function ChatPanel({
  messages, preset, choices, isTyping, onSendMessage, onChoose,
  isDisabled = false, isFinished = false, useTypewriter = true, onTypingComplete,
}: ChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const gameFont = useSettingsStore((s) => s.gameFont);
  const textSize = useSettingsStore((s) => s.textSize);
  const headerFontSize = textSize === 'small' ? '12px' : textSize === 'medium' ? '14px' : textSize === 'large' ? '16px' : '18px';
  const fontFamily = GAME_FONT_FAMILIES[gameFont ?? 'inter'];
  const fontWeight = GAME_FONT_WEIGHTS[gameFont ?? 'inter'];
  const lineHeight = GAME_FONT_LINE_HEIGHTS[gameFont ?? 'inter'];
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, isTyping, scrollToBottom]);
  useEffect(() => {
    const t = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(t);
  }, [isTyping, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'narrator' && useTypewriter) {
        const t = setTimeout(() => setIsTypewriterActive(true), 0);
        return () => clearTimeout(t);
      }
    }
  }, [messages.length, useTypewriter]);

  const handleTypewriterComplete = useCallback(() => {
    setIsTypewriterActive(false);
    onTypingComplete?.();
  }, [onTypingComplete]);

  const hasMessages = messages.length > 0;
  const showChoices = choices.length > 0 && !isTyping && !isTypewriterActive;

  return (
    <div className="h-full flex flex-col bg-transparent" style={{ fontFamily, fontWeight, lineHeight }}>
      {/* Header — UI font */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 py-4 border-b border-white/5">
        <MessageSquare className="w-4 h-4 text-white/50" style={{ flexShrink: 0 }} />
        <span className="font-medium text-white/70" style={{ fontFamily: '"Inter", sans-serif', fontSize: headerFontSize }}>
          Чат с рассказчиком
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        <div className="p-6 space-y-4">
          {hasMessages ? (
            <>
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                const isLastNarrator = isLast && message.role === 'narrator';
                return (
                  <ChatMessage key={message.id} message={message} preset={preset}
                    useTypewriterEffect={useTypewriter && isLastNarrator}
                    onTypingComplete={isLastNarrator ? handleTypewriterComplete : undefined} />
                );
              })}
              <TypingIndicator preset={preset} isVisible={isTyping} />
              <div ref={messagesEndRef} className="h-1" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${preset.accentColor}15` }}>
                <MessageSquare className="w-8 h-8" style={{ color: preset.accentColor }} />
              </div>
              <p className="text-white/30 text-xs" style={{ fontFamily: '"Inter", sans-serif' }}>
                История начнётся совсем скоро...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: choices + input */}
      {!isFinished ? (
        <div className="flex-shrink-0 border-t border-white/5">
          {showChoices && (
            <div className="px-6 pt-3 pb-0">
              <ChoiceButtons choices={choices} onChoose={onChoose}
                disabled={isDisabled} accentColor={preset.accentColor} />
            </div>
          )}
          <UserInput onSend={onSendMessage}
            disabled={isDisabled || isTyping || isTypewriterActive}
            minLength={3} maxLength={500}
            placeholder="Напишите своё действие или ответ..." />
        </div>
      ) : (
        <FinishedGameBanner accentColor={preset.accentColor} />
      )}
    </div>
  );
}
