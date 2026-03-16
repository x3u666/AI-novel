'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, HelpCircle, MapPin } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { Decision } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DecisionMapProps {
  open: boolean;
  onClose: () => void;
}

interface DecisionNode {
  id: string;
  text: string;
  chapter: number;
  timestamp: number;
  isPassed: boolean;
  isCurrent: boolean;
  consequence?: string;
}

// Define the story structure for visualization
const STORY_STRUCTURE = {
  start: {
    id: 'start',
    label: 'Начало',
    choices: ['river', 'camp', 'forest'],
  },
  river: {
    id: 'river',
    label: 'Река',
    chapter: 1,
    choices: ['elara_together', 'alone'],
  },
  camp: {
    id: 'camp',
    label: 'Костёр',
    chapter: 1,
    choices: ['thorin_join', 'alone'],
  },
  forest: {
    id: 'forest',
    label: 'Лес',
    chapter: 1,
    choices: ['raven_deal', 'alone'],
  },
  elara_together: {
    id: 'elara_together',
    label: 'С Эларой',
    chapter: 2,
    choices: ['merchant', 'temple'],
  },
  thorin_join: {
    id: 'thorin_join',
    label: 'С Торином',
    chapter: 2,
    choices: ['mountain', 'swamp'],
  },
  raven_deal: {
    id: 'raven_deal',
    label: 'С Вороном',
    chapter: 2,
    choices: ['trial'],
  },
  alone: {
    id: 'alone',
    label: 'Один',
    chapter: 2,
    choices: ['temple'],
  },
  merchant: {
    id: 'merchant',
    label: 'Торговец',
    chapter: 2,
    choices: ['temple'],
  },
  mountain: {
    id: 'mountain',
    label: 'Горы',
    chapter: 2,
    choices: ['temple'],
  },
  swamp: {
    id: 'swamp',
    label: 'Болото',
    chapter: 2,
    choices: ['temple'],
  },
  trial: {
    id: 'trial',
    label: 'Испытание',
    chapter: 2,
    choices: ['temple_inner'],
  },
  temple: {
    id: 'temple',
    label: 'Храм',
    chapter: 3,
    choices: ['good', 'neutral', 'bad'],
  },
  temple_inner: {
    id: 'temple_inner',
    label: 'Внутренний храм',
    chapter: 3,
    choices: ['good', 'neutral', 'bad'],
  },
  good: {
    id: 'good',
    label: 'Хранитель Равновесия',
    isEnding: true,
  },
  neutral: {
    id: 'neutral',
    label: 'Страж Покоя',
    isEnding: true,
  },
  bad: {
    id: 'bad',
    label: 'Вестник Хаоса',
    isEnding: true,
  },
};

// Map decision text to node IDs
const DECISION_TO_NODE: Record<string, string> = {
  'Идти на звук воды': 'river',
  'Направиться к дыму': 'camp',
  'Исследовать лес': 'forest',
  'Принять помощь волшебницы': 'elara_together',
  'Использовать лодку': 'alone',
  'Присоединиться к Торину': 'thorin_join',
  'Пойти своим путём': 'alone',
  'Заключить сделку с Вороном': 'raven_deal',
  'Отказаться и продолжить одному': 'alone',
  'Попросить Элару сопровождать тебя': 'elara_together',
  'Отправиться одному с картой': 'alone',
  'Осмотреть товары торговца': 'merchant',
  'Идти дальше без остановки': 'temple',
  'Идти через горы': 'mountain',
  'Идти через болото': 'swamp',
  'Выбрать символ глаза': 'trial',
  'Выбрать символ меча': 'trial',
  'Выбрать символ книги': 'trial',
  'Войти в храм': 'temple_inner',
  'Уничтожить зло': 'good',
  'Освободить заточённое': 'bad',
  'Расспросить духа': 'temple_inner',
  'Восстановить баланс': 'good',
  'Запечатать навсегда': 'neutral',
  'Освободить полностью': 'bad',
  'Взять ключ и благодарить': 'temple',
  'Расспросить старика подробнее': 'temple',
  'Продолжить путь, вооружённый знанием': 'temple',
};

function DecisionNodeComponent({
  node,
  isPassed,
  isCurrent,
  decision,
  accentColor,
  index,
}: {
  node: typeof STORY_STRUCTURE.start;
  isPassed: boolean;
  isCurrent: boolean;
  decision?: Decision;
  accentColor: string;
  index: number;
}) {
  const isEnding = 'isEnding' in node && node.isEnding;
  const isStart = node.id === 'start';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
          className={`
            relative flex items-center justify-center
            w-24 h-12 rounded-lg border-2
            transition-all duration-300 cursor-pointer
            ${isPassed
              ? 'bg-[#1a2a1a] border-[#4ade80]/50'
              : isCurrent
                ? 'bg-[#2a2a1a] border-[#d4af37]/50'
                : 'bg-white/5 border-white/10'
            }
            ${isCurrent ? 'ring-2 ring-[#d4af37]/30 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
            ${isEnding && isPassed ? 'bg-gradient-to-br from-[#1a2a1a] to-[#2a1a2a]' : ''}
          `}
        >
          {/* Icon */}
          <div className="flex items-center gap-1.5">
            {isPassed && !isCurrent && (
              <Check className="w-3 h-3 text-[#4ade80]" />
            )}
            {isCurrent && (
              <MapPin className="w-3 h-3 text-[#d4af37] animate-pulse" />
            )}
            {!isPassed && !isCurrent && (
              <HelpCircle className="w-3 h-3 text-white/20" />
            )}
            <span className={`
              text-xs font-medium truncate max-w-[70px]
              ${isPassed ? 'text-[#4ade80]' : isCurrent ? 'text-[#d4af37]' : 'text-white/30'}
            `}>
              {isStart ? 'Начало' : node.label}
            </span>
          </div>
          
          {/* Current indicator */}
          {isCurrent && (
            <motion.div
              className="absolute -inset-1 rounded-lg border-2 border-[#d4af37]/30"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-black/90 border border-white/10 text-white/80 text-xs max-w-[200px]"
      >
        {decision ? (
          <div className="space-y-1">
            <p className="font-medium text-white">{decision.choiceText}</p>
            {decision.consequence && (
              <p className="text-white/50 text-[10px]">{decision.consequence}</p>
            )}
            <p className="text-white/30 text-[10px]">Глава {decision.chapter}</p>
          </div>
        ) : (
          <p>{isStart ? 'Твоя история началась здесь' : isPassed ? 'Пройдено' : 'Не исследовано'}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function DecisionMap({ open, onClose }: DecisionMapProps) {
  const { decisions, currentChapter, selectedNarrator } = useGameStore();
  
  // Get accent color from narrator preset
  const accentColor = '#d4af37'; // Default gold
  
  // Build the path from decisions
  const passedNodes = useMemo(() => {
    const nodes = ['start'];
    decisions.forEach((decision) => {
      const nodeId = DECISION_TO_NODE[decision.choiceText];
      if (nodeId && !nodes.includes(nodeId)) {
        nodes.push(nodeId);
      }
    });
    return nodes;
  }, [decisions]);
  
  // Get current node (last decision)
  const currentNodeId = passedNodes[passedNodes.length - 1] || 'start';
  
  // Group decisions by chapter
  const decisionsByChapter = useMemo(() => {
    const grouped: Record<number, Decision[]> = {};
    decisions.forEach((decision) => {
      if (!grouped[decision.chapter]) {
        grouped[decision.chapter] = [];
      }
      grouped[decision.chapter].push(decision);
    });
    return grouped;
  }, [decisions]);

  // Build tree structure
  const treeData = useMemo(() => {
    const levels: { id: string; node: typeof STORY_STRUCTURE.start; isPassed: boolean; isCurrent: boolean; decision?: Decision }[][] = [];
    
    // Level 0: Start
    levels.push([{
      id: 'start',
      node: STORY_STRUCTURE.start,
      isPassed: true,
      isCurrent: currentNodeId === 'start',
    }]);
    
    // Level 1: First decision (River, Camp, Forest)
    const level1 = ['river', 'camp', 'forest'].map((id) => ({
      id,
      node: STORY_STRUCTURE[id as keyof typeof STORY_STRUCTURE],
      isPassed: passedNodes.includes(id),
      isCurrent: currentNodeId === id,
    }));
    levels.push(level1);
    
    // Level 2: Companions/Alone
    const level2Ids = ['elara_together', 'thorin_join', 'raven_deal', 'alone'];
    const level2 = level2Ids.map((id) => ({
      id,
      node: STORY_STRUCTURE[id as keyof typeof STORY_STRUCTURE],
      isPassed: passedNodes.includes(id),
      isCurrent: currentNodeId === id,
      decision: decisions.find((d) => DECISION_TO_NODE[d.choiceText] === id),
    }));
    levels.push(level2);
    
    // Level 3: Path variations
    const level3Ids = ['merchant', 'mountain', 'swamp', 'trial', 'temple'];
    const level3 = level3Ids.map((id) => ({
      id,
      node: STORY_STRUCTURE[id as keyof typeof STORY_STRUCTURE],
      isPassed: passedNodes.includes(id),
      isCurrent: currentNodeId === id,
      decision: decisions.find((d) => DECISION_TO_NODE[d.choiceText] === id),
    }));
    levels.push(level3);
    
    // Level 4: Temple inner
    const level4 = [{
      id: 'temple_inner',
      node: STORY_STRUCTURE.temple_inner,
      isPassed: passedNodes.includes('temple_inner'),
      isCurrent: currentNodeId === 'temple_inner',
      decision: decisions.find((d) => DECISION_TO_NODE[d.choiceText] === 'temple_inner'),
    }];
    levels.push(level4);
    
    // Level 5: Endings
    const level5Ids = ['good', 'neutral', 'bad'];
    const level5 = level5Ids.map((id) => ({
      id,
      node: STORY_STRUCTURE[id as keyof typeof STORY_STRUCTURE],
      isPassed: passedNodes.includes(id),
      isCurrent: currentNodeId === id,
      decision: decisions.find((d) => DECISION_TO_NODE[d.choiceText] === id),
    }));
    levels.push(level5);
    
    return levels;
  }, [passedNodes, currentNodeId, decisions]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">🗺️</span>
                <h2 className="text-lg font-semibold text-white">Карта решений</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-6 px-6 py-3 bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#4ade80]" />
                <span className="text-xs text-white/50">Пройдено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#d4af37]" />
                <span className="text-xs text-white/50">Текущая позиция</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white/10" />
                <span className="text-xs text-white/50">Не исследовано</span>
              </div>
            </div>
            
            {/* Tree visualization */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="flex flex-col items-center gap-8">
                {treeData.map((level, levelIndex) => (
                  <div key={levelIndex} className="flex flex-col items-center gap-4">
                    {/* Chapter label */}
                    {levelIndex > 0 && levelIndex < 5 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-px bg-white/10" />
                        <span className="text-xs text-white/30">
                          {levelIndex === 1 && 'Глава 1'}
                          {levelIndex === 2 && 'Глава 2'}
                          {levelIndex >= 3 && levelIndex < 5 && 'Глава 3'}
                        </span>
                        <div className="w-16 h-px bg-white/10" />
                      </div>
                    )}
                    
                    {/* Nodes */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {level.map((item, nodeIndex) => (
                        <DecisionNodeComponent
                          key={item.id}
                          node={item.node}
                          isPassed={item.isPassed}
                          isCurrent={item.isCurrent}
                          decision={item.decision}
                          accentColor={accentColor}
                          index={levelIndex * 3 + nodeIndex}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistics */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#d4af37]">{decisions.length}</p>
                  <p className="text-xs text-white/40">Решений</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#d4af37]">{currentChapter}</p>
                  <p className="text-xs text-white/40">Глава</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#d4af37]">{passedNodes.length}</p>
                  <p className="text-xs text-white/40">Узлов</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
