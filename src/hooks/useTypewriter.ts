'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number; // characters per second
  onComplete?: () => void;
  skip?: boolean;
  enabled?: boolean;
}

interface UseTypewriterReturn {
  displayText: string;
  isTyping: boolean;
  progress: number;
  skipToEnd: () => void;
  restart: () => void;
}

export function useTypewriter({
  text,
  speed = 50,
  onComplete,
  skip = false,
  enabled = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const skipRef = useRef(skip);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update refs when props change
  useEffect(() => {
    skipRef.current = skip;
    onCompleteRef.current = onComplete;
  }, [skip, onComplete]);

  // Calculate delay between characters based on speed
  const getDelay = useCallback(() => {
    // speed is characters per second, so delay is 1000/speed ms
    return Math.max(10, 1000 / speed);
  }, [speed]);

  // Skip to end of text
  const skipToEnd = useCallback(() => {
    skipRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDisplayText(text);
    setProgress(100);
    setIsTyping(false);
    onCompleteRef.current?.();
  }, [text]);

  // Restart typewriter
  const restart = useCallback(() => {
    skipRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDisplayText('');
    setProgress(0);
    setIsTyping(true);
  }, []);

  // Main typewriter effect
  useEffect(() => {
    if (!enabled || !text) {
      setDisplayText(text);
      setProgress(text ? 100 : 0);
      setIsTyping(false);
      return;
    }

    // If skip is true, immediately show full text
    if (skipRef.current) {
      setDisplayText(text);
      setProgress(100);
      setIsTyping(false);
      onCompleteRef.current?.();
      return;
    }

    let currentIndex = 0;
    setIsTyping(true);
    setDisplayText('');
    setProgress(0);

    const typeNextChar = () => {
      if (skipRef.current || currentIndex >= text.length) {
        setIsTyping(false);
        setProgress(100);
        onCompleteRef.current?.();
        return;
      }

      currentIndex++;
      setDisplayText(text.slice(0, currentIndex));
      setProgress((currentIndex / text.length) * 100);

      if (currentIndex < text.length) {
        // Variable delay for more natural feel
        const char = text[currentIndex - 1];
        let delay = getDelay();

        // Add extra delay for punctuation
        if (['.', '!', '?'].includes(char)) {
          delay *= 5; // Pause longer at sentence ends
        } else if ([',', ';', ':'].includes(char)) {
          delay *= 2.5; // Pause slightly at clause ends
        } else if (char === '\n') {
          delay *= 3; // Pause at line breaks
        }

        timeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
        setProgress(100);
        onCompleteRef.current?.();
      }
    };

    // Start typing after a small initial delay
    timeoutRef.current = setTimeout(typeNextChar, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, enabled, getDelay]);

  return {
    displayText,
    isTyping,
    progress,
    skipToEnd,
    restart,
  };
}
