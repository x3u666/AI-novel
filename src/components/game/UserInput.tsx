'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface UserInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export function UserInput({
  onSend,
  disabled = false,
  minLength = 10,
  maxLength = 500,
  placeholder = 'Напишите ваше действие или ответ...',
}: UserInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max ~4 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  // Handle send
  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (trimmedText.length >= minLength && !disabled) {
      onSend(trimmedText);
      setText('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [text, minLength, disabled, onSend]);

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const textLength = text.trim().length;
  const isValid = textLength >= minLength;
  const isNearLimit = textLength > maxLength * 0.8;
  const isOverLimit = textLength > maxLength;

  return (
    <div className="p-4 border-t border-white/5 bg-black/20">
      <div
        className={`
          relative flex items-end gap-2 p-3 rounded-xl
          transition-all duration-200
        `}
        style={{
          backgroundColor: isFocused
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${
            isFocused
              ? 'rgba(212, 175, 55, 0.3)'
              : 'rgba(255, 255, 255, 0.08)'
          }`,
          boxShadow: isFocused
            ? '0 0 20px rgba(212, 175, 55, 0.1)'
            : 'none',
        }}
      >
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            flex-1 min-h-[40px] max-h-[120px] resize-none
            bg-transparent border-0 text-white/90
            placeholder:text-white/30
            focus-visible:ring-0 focus-visible:ring-offset-0
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10
          `}
          rows={1}
        />

        {/* Character counter */}
        <div className="flex items-center gap-2 pb-1">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: textLength > 0 ? 1 : 0 }}
            className={`
              text-xs transition-colors
              ${isOverLimit
                ? 'text-red-400'
                : isNearLimit
                  ? 'text-yellow-400'
                  : 'text-white/30'
              }
            `}
          >
            {textLength}/{maxLength}
          </motion.span>

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={disabled || !isValid || isOverLimit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center
              transition-all duration-200
              ${disabled
                ? 'bg-white/5 cursor-not-allowed'
                : isValid && !isOverLimit
                  ? 'bg-[#d4af37]/20 hover:bg-[#d4af37]/30 cursor-pointer'
                  : 'bg-white/5 cursor-not-allowed'
              }
            `}
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
            ) : (
              <Send
                className={`w-4 h-4 transition-colors ${
                  isValid && !isOverLimit
                    ? 'text-[#d4af37]'
                    : 'text-white/30'
                }`}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Helper text */}
      {!isValid && textLength > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-white/40 mt-2 pl-1"
        >
          Минимум {minLength} символов
        </motion.p>
      )}
    </div>
  );
}
