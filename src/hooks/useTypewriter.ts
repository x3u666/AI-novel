'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
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

// ─── Web Audio typing sound ───────────────────────────────────────────────────
let sharedAudioCtx: AudioContext | null = null;

// Throttle: minimum ms between clicks regardless of typing speed
const CLICK_INTERVAL_MS = 90;
let lastClickTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return sharedAudioCtx;
}

function playTypingClick(volume: number) {
  if (volume <= 0) return;

  // Throttle — skip if fired too soon after last click
  const now = Date.now();
  if (now - lastClickTime < CLICK_INTERVAL_MS) return;
  lastClickTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = ctx.currentTime;

  // Soft noise burst — shorter and quieter than before
  const bufferSize = Math.floor(ctx.sampleRate * 0.018); // 18ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Smoother envelope: gentle rise then fall
    const env = Math.sin((i / bufferSize) * Math.PI) * Math.pow(1 - i / bufferSize, 3);
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Low-pass filter — removes harsh high frequencies, keeps it muffled/soft
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 900;
  lowpass.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.45, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);

  source.start(t);
  source.stop(t + 0.04);
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);

  useEffect(() => {
    skipRef.current = skip;
    onCompleteRef.current = onComplete;
  }, [skip, onComplete]);

  const getDelay = useCallback(() => {
    return Math.max(10, 1000 / speed);
  }, [speed]);

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

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayText(text);
      setProgress(text ? 100 : 0);
      setIsTyping(false);
      return;
    }

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
      const char = text[currentIndex - 1];
      setDisplayText(text.slice(0, currentIndex));
      setProgress((currentIndex / text.length) * 100);

      if (char !== ' ' && char !== '\n') {
        playTypingClick(sfxVolume / 100);
      }

      if (currentIndex < text.length) {
        let delay = getDelay();
        if (['.', '!', '?'].includes(char)) delay *= 5;
        else if ([',', ';', ':'].includes(char)) delay *= 2.5;
        else if (char === '\n') delay *= 3;
        timeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
        setProgress(100);
        onCompleteRef.current?.();
      }
    };

    timeoutRef.current = setTimeout(typeNextChar, 50);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, enabled, getDelay, sfxVolume]);

  return { displayText, isTyping, progress, skipToEnd, restart };
}
