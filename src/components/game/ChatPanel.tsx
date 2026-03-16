'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { ChatMessage as ChatMessageType, Choice, NarratorPreset } from '@/types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChoiceButtons } from './ChoiceButtons';
import { UserInput } from './UserInput';
import { AutoPlayButton } from './AutoPlayButton';
import { MessageSquare } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface ChatPanelProps {
  messages: ChatMessageType[];
  preset: NarratorPreset;
  choices: Choice[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onChoose: (choice: Choice) => void;
  isDisabled?: boolean;
  useTypewriter?: boolean;
  onTypingComplete?: () => void;
}

export function ChatPanel({
  messages,
  preset,
  choices,
  isTyping,
  onSendMessage,
  onChoose,
  isDisabled = false,
  useTypewriter = true,
  onTypingComplete,
}: ChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoPlayActive = useUIStore((state) => state.autoPlayActive);
  const toggleAutoPlay = useUIStore((state) => state.toggleAutoPlay);
  const autoPlaySpeed = useSettingsStore((state) => state.autoPlaySpeed);
  
  // Track if typewriter is currently animating
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);

  // Auto-scroll when typing indicator changes
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [isTyping, scrollToBottom]);

  // Reset typewriter state when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'narrator' && useTypewriter) {
        const timer = setTimeout(() => {
          setIsTypewriterActive(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [messages.length, useTypewriter]);

  // Handle typewriter complete
  const handleTypewriterComplete = useCallback(() => {
    setIsTypewriterActive(false);
    onTypingComplete?.();
  }, [onTypingComplete]);

  const hasMessages = messages.length > 0;
  
  // Show choices only when:
  // 1. There are choices available
  // 2. Server is not typing (isTyping is false)
  // 3. Typewriter animation is complete (isTypewriterActive is false)
  const showChoices = choices.length > 0 && !isTyping && !isTypewriterActive;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white/50" />
          <span className="text-sm font-medium text-white/70">Чат с рассказчиком</span>
        </div>
        <AutoPlayButton
          isActive={autoPlayActive}
          onToggle={toggleAutoPlay}
          disabled={isDisabled || isTyping}
          autoPlaySpeed={autoPlaySpeed}
        />
      </div>

      {/* Messages Area - scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        <div className="p-6 space-y-4">
          {hasMessages ? (
            <>
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isLastNarratorMessage = isLastMessage && message.role === 'narrator';

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    preset={preset}
                    useTypewriterEffect={useTypewriter && isLastNarratorMessage}
                    onTypingComplete={isLastNarratorMessage ? handleTypewriterComplete : undefined}
                  />
                );
              })}

              {/* Typing indicator */}
              <TypingIndicator preset={preset} isVisible={isTyping} />
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="h-1" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${preset.accentColor}15` }}
              >
                <MessageSquare
                  className="w-8 h-8"
                  style={{ color: preset.accentColor }}
                />
              </div>
              <p className="text-white/50 text-sm max-w-sm mb-4">
                {preset.initialMessage}
              </p>
              <p className="text-white/30 text-xs">
                Введите первое сообщение, чтобы начать историю
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Choice buttons (if available) */}
      {showChoices && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-white/5 max-h-64 overflow-y-auto">
          <ChoiceButtons
            choices={choices}
            onChoose={onChoose}
            disabled={isDisabled}
            accentColor={preset.accentColor}
          />
        </div>
      )}

      {/* User Input */}
      {!showChoices && (
        <div className="flex-shrink-0">
          <UserInput
            onSend={onSendMessage}
            disabled={isDisabled || isTyping || isTypewriterActive}
            minLength={10}
            maxLength={500}
            placeholder="Опишите ваше действие или ответ..."
          />
        </div>
      )}
    </div>
  );
}
