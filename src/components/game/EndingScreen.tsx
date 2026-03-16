'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, FileDown } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { getEnding } from '@/data/endings';
import type { EndingType } from '@/types';
import { formatTimeFromMs } from '@/utils/formatTime';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useSettingsStore } from '@/stores/settingsStore';

interface EndingScreenProps {
  endingId: EndingType;
  onNewGame: () => void;
  onMainMenu: () => void;
}

// Ending-specific styling
const ENDING_STYLES = {
  good: {
    symbol: '✦',
    symbolColor: '#D4A853',
    textColor: '#D4A853',
    glowColor: 'rgba(212, 168, 83, 0.3)',
    pathLabel: 'Путь героя',
    pathColor: '#5CAA7E',
    buttonText: '#1A1A24',
  },
  neutral: {
    symbol: '◈',
    symbolColor: '#A8B0BC',
    textColor: '#A8B0BC',
    glowColor: 'rgba(168, 176, 188, 0.15)',
    pathLabel: 'Путь странника',
    pathColor: '#A8B0BC',
    buttonText: '#1A1A24',
  },
  bad: {
    symbol: '✧',
    symbolColor: '#8B2E3B',
    textColor: '#8B2E3B',
    glowColor: 'rgba(139, 46, 59, 0.25)',
    pathLabel: 'Путь тени',
    pathColor: '#C45C5C',
    buttonText: '#E8E8ED',
  },
};

// Animated counter component
function AnimatedCounter({ 
  value, 
  duration = 800 
}: { 
  value: number; 
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <>{displayValue}</>;
}

export function EndingScreen({ endingId, onNewGame, onMainMenu }: EndingScreenProps) {
  const { totalPlayTime, decisions, characters, sessionStartTime, updatePlayTime, narrativeBlocks } = useGameStore();
  const typingSpeed = useSettingsStore((state) => state.typingSpeed);
  
  const ending = getEnding(endingId);
  const styles = ENDING_STYLES[endingId];
  
  // Animation states
  const [showSymbol, setShowSymbol] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showEndingName, setShowEndingName] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const [showDivider, setShowDivider] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showReplayHint, setShowReplayHint] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  
  // Calculate final play time
  const finalPlayTime = sessionStartTime 
    ? totalPlayTime + (Date.now() - sessionStartTime)
    : totalPlayTime;
  
  // Full epilogue text
  const fullText = ending.finalText.join('\n\n');
  
  // Typewriter for epilogue
  const { displayText, isTyping, skipToEnd } = useTypewriter({
    text: fullText,
    speed: typingSpeed,
    onComplete: useCallback(() => setTextComplete(true), []),
    enabled: showEpilogue,
  });
  
  // Animation sequence
  useEffect(() => {
    // Timeline based on spec
    const timers = [
      setTimeout(() => setShowSymbol(true), 1000),        // Symbol at 1s
      setTimeout(() => setShowTitle(true), 2500),         // КОНЕЦ at 2.5s
      setTimeout(() => setShowEndingName(true), 3500),    // Name at 3.5s
      setTimeout(() => setShowSubtitle(true), 4200),      // Subtitle at 4.2s
      setTimeout(() => setShowEpilogue(true), 5000),      // Epilogue at 5s
    ];
    
    return () => timers.forEach(clearTimeout);
  }, []);
  
  // After text completes
  useEffect(() => {
    if (textComplete) {
      const timers = [
        setTimeout(() => setShowDivider(true), 1000),     // Divider after text
        setTimeout(() => setShowStats(true), 1500),       // Stats
        setTimeout(() => setShowQuote(true), 2500),       // Quote
        setTimeout(() => setShowButtons(true), 3500),     // Buttons
        setTimeout(() => setShowReplayHint(true), 4000),  // Replay hint
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [textComplete]);
  
  // Skip all animations
  const handleSkip = () => {
    setShowSymbol(true);
    setShowTitle(true);
    setShowEndingName(true);
    setShowSubtitle(true);
    setShowEpilogue(true);
    setShowDivider(true);
    setShowStats(true);
    setShowQuote(true);
    setShowButtons(true);
    setShowReplayHint(true);
    skipToEnd();
  };
  
  // Update play time on mount
  useEffect(() => {
    updatePlayTime();
  }, [updatePlayTime]);
  
  // Count unlocked characters
  const unlockedCharacters = characters.filter((c) => c.isUnlocked).length;
  
  // Get max chapter from narrative blocks
  const maxChapter = Math.max(...narrativeBlocks.map(b => 1), 1);
  
  // Ending number
  const types: EndingType[] = ['good', 'neutral', 'bad'];
  const endingNumber = types.indexOf(endingId) + 1;
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start py-12 px-4 relative overflow-y-auto"
      style={{
        background: ending.backgroundGradient,
      }}
      onClick={handleSkip}
    >
      {/* Vignette overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: endingId === 'good' 
            ? 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)'
            : endingId === 'bad'
              ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)'
              : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      
      {/* Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(endingId === 'good' ? 20 : endingId === 'bad' ? 30 : 15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ 
              backgroundColor: endingId === 'good' ? '#D4A853' : endingId === 'bad' ? '#4a2020' : '#808090',
              width: endingId === 'bad' ? '2px' : '3px',
              height: endingId === 'bad' ? '2px' : '3px',
              opacity: endingId === 'good' ? 0.4 : endingId === 'bad' ? 0.3 : 0.2,
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: endingId === 'good' ? (typeof window !== 'undefined' ? window.innerHeight + 50 : 800) : -50,
            }}
            animate={endingId === 'good' ? {
              y: -50,
              x: [null, Math.random() * 50 - 25],
            } : {
              y: (typeof window !== 'undefined' ? window.innerHeight + 50 : 800),
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-[700px] w-full text-center">
        
        {/* Decorative symbol */}
        <AnimatePresence>
          {showSymbol && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: endingId === 'good' ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                duration: 0.4,
                repeat: endingId === 'good' ? Infinity : 0,
                repeatDuration: 2,
              }}
              className="text-3xl mb-10"
              style={{ color: styles.symbolColor }}
            >
              {styles.symbol}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* КОНЕЦ */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <h1 
                className="font-playfair text-4xl md:text-5xl font-bold tracking-[0.3em] uppercase"
                style={{ 
                  color: styles.textColor,
                  textShadow: `0 0 20px ${styles.glowColor}`,
                }}
              >
                {'КОНЕЦ'.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.2 }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ending name */}
        <AnimatePresence>
          {showEndingName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 
                className="font-playfair text-xl md:text-2xl italic mb-2"
                style={{ color: styles.textColor, opacity: 0.85 }}
              >
                «{ending.title}»
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtitle */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-white/50"
            >
              {ending.subtitle}
            </motion.p>
          )}
        </AnimatePresence>
        
        {/* Epilogue text */}
        <AnimatePresence>
          {showEpilogue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-8 mb-6"
            >
              <div 
                className="max-w-[620px] mx-auto bg-black/40 backdrop-blur-md rounded-xl p-7 border border-white/10 text-left cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  skipToEnd();
                }}
              >
                <p 
                  className="font-playfair text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#E8E8ED' }}
                >
                  {displayText}
                  {isTyping && (
                    <span
                      className="inline-block w-0.5 h-5 ml-1 animate-pulse"
                      style={{ backgroundColor: styles.textColor }}
                    />
                  )}
                </p>
              </div>
              {isTyping && (
                <p className="text-xs text-white/30 mt-2">
                  Нажмите, чтобы пропустить
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Divider */}
        <AnimatePresence>
          {showDivider && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 my-6"
            >
              <div className="w-20 h-px bg-white/10" />
              <span className="text-xs text-white/40 uppercase tracking-widest">
                {styles.symbol} Ваш путь {styles.symbol}
              </span>
              <div className="w-20 h-px bg-white/10" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Statistics */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-[480px] mx-auto bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10"
            >
              {[
                { icon: '⏱', label: 'Время прохождения', value: formatTimeFromMs(finalPlayTime), animate: false },
                { icon: '🔀', label: 'Принято решений', value: decisions.length, animate: true },
                { icon: '👥', label: 'Встречено персонажей', value: unlockedCharacters, animate: true },
                { icon: '📖', label: 'Глав пройдено', value: maxChapter, animate: true },
                { icon: '⚖️', label: 'Ваш путь', value: styles.pathLabel, animate: false, color: styles.pathColor },
                { icon: '🏆', label: 'Концовка', value: `${endingNumber} из 3`, animate: false },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-sm text-white/50">{stat.label}</span>
                  </div>
                  <span 
                    className="text-sm font-semibold"
                    style={stat.color ? { color: stat.color } : { color: '#E8E8ED' }}
                  >
                    {stat.animate ? <AnimatedCounter value={stat.value as number} /> : stat.value}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Quote */}
        <AnimatePresence>
          {showQuote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-[520px] mx-auto mt-7 pl-5"
              style={{ borderLeft: `3px solid ${styles.textColor}40` }}
            >
              <p className="font-playfair italic text-base opacity-80" style={{ color: '#E8E8ED' }}>
                {endingId === 'good' 
                  ? 'Каждый подвиг начинается с одного шага, сделанного вопреки страху. Ты сделал этот шаг — и мир стал светлее.'
                  : endingId === 'neutral'
                    ? 'Не каждая история заканчивается триумфом или трагедией. Иногда она просто заканчивается. Но может начаться снова.'
                    : 'Я рассказал историю, которую ты написал своими решениями. Не вини рассказчика за финал — каждая строка была твоей.'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Buttons */}
        <AnimatePresence>
          {showButtons && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3 mt-9"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewGame();
                }}
                className="w-[260px] h-12 rounded-lg font-semibold text-base transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: styles.textColor,
                  color: styles.buttonText,
                }}
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Начать заново
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMainMenu();
                }}
                className="w-[260px] h-12 rounded-lg font-semibold text-base bg-transparent border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Главное меню
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Replay hint */}
        <AnimatePresence>
          {showReplayHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-white/30 mt-6"
            >
              {endingId === 'good'
                ? 'Это был лучший исход. Но что, если бы...'
                : endingId === 'neutral'
                  ? 'Не всё потеряно, не всё найдено. Попробуйте другой путь.'
                  : 'Можно переписать эту историю. Свет существует.'
              }
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
