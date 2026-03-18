'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Choice } from '@/types';
import { ChevronRight } from 'lucide-react';

interface ChoiceButtonsProps {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
  disabled?: boolean;
  accentColor?: string;
}

// Get emoji for choice based on text content
function getChoiceEmoji(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Movement/direction
  if (lowerText.includes('идти') || lowerText.includes('путь') || lowerText.includes('дорога')) {
    return '🚶';
  }
  if (lowerText.includes('спуститься') || lowerText.includes('вниз')) {
    return '⬇️';
  }
  if (lowerText.includes('подняться') || lowerText.includes('вверх') || lowerText.includes('горы')) {
    return '⬆️';
  }
  
  // Combat/action
  if (lowerText.includes('атаковать') || lowerText.includes('сражаться') || lowerText.includes('битва')) {
    return '⚔️';
  }
  if (lowerText.includes('защищаться') || lowerText.includes('блок')) {
    return '🛡️';
  }
  
  // Social
  if (lowerText.includes('говорить') || lowerText.includes('разговор') || lowerText.includes('спросить')) {
    return '💬';
  }
  if (lowerText.includes('помочь') || lowerText.includes('помощь')) {
    return '🤝';
  }
  if (lowerText.includes('торгов') || lowerText.includes('купить') || lowerText.includes('обмен')) {
    return '💰';
  }
  
  // Exploration
  if (lowerText.includes('исследовать') || lowerText.includes('искать') || lowerText.includes('осмотреть')) {
    return '🔍';
  }
  if (lowerText.includes('лес') || lowerText.includes('дерев')) {
    return '🌲';
  }
  if (lowerText.includes('вода') || lowerText.includes('река') || lowerText.includes('море')) {
    return '💧';
  }
  
  // Magic/mystical
  if (lowerText.includes('магия') || lowerText.includes('заклин') || lowerText.includes('ритуал')) {
    return '✨';
  }
  if (lowerText.includes('глаз') || lowerText.includes('видеть')) {
    return '👁️';
  }
  if (lowerText.includes('книга') || lowerText.includes('читать')) {
    return '📖';
  }
  
  // Stealth/sneak
  if (lowerText.includes('скрыться') || lowerText.includes('прятаться') || lowerText.includes('тихо')) {
    return '🤫';
  }
  
  // Default choices
  if (lowerText.includes('да') || lowerText.includes('согласиться')) {
    return '✅';
  }
  if (lowerText.includes('нет') || lowerText.includes('отказаться')) {
    return '❌';
  }
  
  return '➤';
}

export function ChoiceButtons({
  choices,
  onChoose,
  disabled = false,
  accentColor = '#d4af37',
}: ChoiceButtonsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  const handleClick = (choice: Choice) => {
    if (disabled || choice.disabled) return;
    // Prevent any second click while the first is being processed
    if (isProcessingRef.current || selectedId !== null) return;

    isProcessingRef.current = true;
    setSelectedId(choice.id);
    
    // Delay to show selection animation
    setTimeout(() => {
      onChoose(choice);
    }, 300);
  };

  if (choices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-sm text-white/60">Выберите действие:</span>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence>
          {choices.map((choice, index) => {
            const isSelected = selectedId === choice.id;
            const isOther = selectedId !== null && !isSelected;
            const isHovered = hoveredId === choice.id;
            const emoji = getChoiceEmoji(choice.text);
            const isDisabled = disabled || choice.disabled || (selectedId !== null && !isSelected);

            return (
              <motion.button
                key={choice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isOther ? 0.3 : 1,
                  x: 0,
                  scale: isSelected ? 1.02 : 1,
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.2,
                }}
                onClick={() => handleClick(choice)}
                onMouseEnter={() => !isDisabled && setHoveredId(choice.id)}
                onMouseLeave={() => setHoveredId(null)}
                disabled={isDisabled}
                className={`
                  w-full text-left px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isDisabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                style={{
                  backgroundColor: isSelected
                    ? `${accentColor}25`
                    : isHovered
                      ? `${accentColor}15`
                      : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    isSelected
                      ? `${accentColor}50`
                      : isHovered
                        ? `${accentColor}30`
                        : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  boxShadow: isSelected
                    ? `0 0 20px ${accentColor}20`
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <span className="flex-1 text-white/90">{choice.text}</span>
                  <ChevronRight
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      color: isHovered || isSelected ? accentColor : 'rgba(255,255,255,0.3)',
                      transform: isHovered || isSelected ? 'translateX(4px)' : 'translateX(0)',
                    }}
                  />
                </div>

                {/* Consequence hint — fixed height to prevent layout jumps */}
                {choice.consequence && (
                  <div
                    className="mt-2 pt-2 border-t border-white/10 overflow-hidden transition-all duration-200"
                    style={{
                      maxHeight: isHovered || isSelected ? '40px' : '0px',
                      opacity: isHovered || isSelected ? 1 : 0,
                      borderTopWidth: isHovered || isSelected ? '1px' : '0px',
                      marginTop: isHovered || isSelected ? '8px' : '0px',
                      paddingTop: isHovered || isSelected ? '8px' : '0px',
                    }}
                  >
                    <p
                      className="text-xs italic"
                      style={{ color: `${accentColor}aa` }}
                    >
                      {choice.consequence}
                    </p>
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
