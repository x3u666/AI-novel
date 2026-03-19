'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Map,
  Settings,
  Home,
  Loader2,
  Trophy,
  Music2,
} from 'lucide-react';
import { NarrativePanel } from '@/components/game/NarrativePanel';
import { ChatPanel } from '@/components/game/ChatPanel';
import { DiaryPanel } from '@/components/game/DiaryPanel';
import { CharactersPanel } from '@/components/game/CharactersPanel';
import { DecisionMap } from '@/components/game/DecisionMap';
import { GameBackground } from '@/components/game/GameBackground';
import { MusicPlayer } from '@/components/game/MusicPlayer';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveSlot } from '@/services/saveService';
import { getPresetById, presets } from '@/data/presets';
import {
  getInitialNarrative,
  processChoice,
  processUserInput,
  isEndingScene,
  getEndingInfo,
} from '@/services/narrativeService';
import { EndingScreen } from '@/components/game/EndingScreen';
import type { Choice, ChatMessage, NarrativeBlock } from '@/types';
import { generateId } from '@/utils/generateId';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


// Toolbar button component
function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onClick}
          disabled={disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center
            transition-all duration-200
            ${disabled
              ? 'opacity-30 cursor-not-allowed'
              : active
                ? 'bg-[#d4af37]/20 text-[#d4af37]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }
          `}
        >
          <Icon className="w-4 h-4" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-black/80 border border-white/10 text-white/80 text-xs"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function GamePage() {
  const router = useRouter();
  
  // Game state
  const {
    isGameStarted,
    selectedNarrator,
    narrativeBlocks,
    chatHistory,
    availableChoices,
    decisions,
    currentChapter,
    isFinished,
    endingId,
    selectedSlotIndex,
    startNewGame,
    addNarrativeBlock,
    addChatMessage,
    setAvailableChoices,
    makeChoice,
    clearChoices,
    setEnding,
  } = useGameStore();

  // UI state
  const { isTyping, setTyping, setLoading, isLoading } = useUIStore();
  const { textSize } = useSettingsStore();

  // Local state
  const [currentSceneId, setCurrentSceneId] = useState<string>('scene_intro');
  const [showSettings, setShowSettings] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showDecisionMap, setShowDecisionMap] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showEndingOverlay, setShowEndingOverlay] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ref to track previous chapter for auto-save
  const prevChapterRef = useRef(currentChapter);

  // Get narrator preset
  const preset = selectedNarrator
    ? getPresetById(selectedNarrator)
    : presets[0]; // Default to first preset if none selected

  // 🎵 Музыкой управляет MusicProvider в layout.tsx

  // Auto-save hook - saves every 5 minutes and after decisions
  useAutoSave({
    enabled: isInitialized && isGameStarted,
    interval: 5 * 60 * 1000, // 5 minutes
  });

  // Redirect to narrator selection if no narrator selected
  useEffect(() => {
    if (!selectedNarrator && !isGameStarted) {
      // For demo, auto-start with default narrator
      startNewGame('knight');
    }
  }, [selectedNarrator, isGameStarted, startNewGame]);

  // Initialize game on first load
  useEffect(() => {
    if (isGameStarted && !isInitialized && selectedNarrator && !isFinished && chatHistory.length === 0) {
      initializeGame();
    } else if (isGameStarted && !isInitialized && chatHistory.length > 0) {
      // Loaded from save — skip init, mark as initialized
      setIsInitialized(true);
    }
  }, [isGameStarted, isInitialized, selectedNarrator, isFinished, chatHistory.length]);

  // Initialize game with first narrative
  const initializeGame = async () => {
    setLoading(true, 'Загрузка истории...');
    
    try {
      const response = await getInitialNarrative();
      
      // Add narrator message to chat
      const narratorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        role: 'narrator',
        content: response.narratorMessage,
      };
      addChatMessage(narratorMessage);

      // Add narrative block
      const narrativeBlock: Omit<NarrativeBlock, 'id' | 'timestamp'> = {
        content: response.narrativeBlock,
        type: 'narration',
      };
      addNarrativeBlock(narrativeBlock);

      // Set available choices - preserve original IDs for scene navigation
      if (response.choices.length > 0) {
        setAvailableChoices(response.choices.map(c => ({
          id: c.id,
          text: c.text,
          consequence: c.consequence,
          disabled: c.disabled,
        })));
      }

      setCurrentSceneId(response.nextSceneId);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize game:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user message
  const handleSendMessage = useCallback(async (text: string) => {
    if (isTyping || isLoading) return;

    // Add user message to chat
    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content: text,
    };
    addChatMessage(userMessage);

    setTyping(true);
    setLoading(true, 'Обдумываю ответ...');

    try {
      // For intro scene, use processUserInput, otherwise use generateNarrative
      const response = currentSceneId === 'scene_intro'
        ? await processUserInput(text, useGameStore.getState())
        : await processChoice(currentSceneId, '', useGameStore.getState());

      // Small delay before showing response
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add narrator response
      const narratorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        role: 'narrator',
        content: response.narratorMessage,
      };
      addChatMessage(narratorMessage);

      // Add narrative block
      const narrativeBlock: Omit<NarrativeBlock, 'id' | 'timestamp'> = {
        content: response.narrativeBlock,
        type: 'narration',
      };
      addNarrativeBlock(narrativeBlock);

      // Set available choices - preserve original IDs for scene navigation
      if (response.choices.length > 0) {
        setAvailableChoices(response.choices.map(c => ({
          id: c.id,
          text: c.text,
          consequence: c.consequence,
          disabled: c.disabled,
        })));
      } else {
        clearChoices();
      }

      setCurrentSceneId(response.nextSceneId);

      // Check for ending
      if (isEndingScene(response.nextSceneId)) {
        const endingInfo = getEndingInfo(response.nextSceneId);
        if (endingInfo) {
          setEnding(endingInfo.type);
          // Save with isFinished=true to both auto-slot and user slot, then navigate
          setTimeout(() => {
            const s = useGameStore.getState();
            try { saveSlot(0, s); } catch (e) { console.error(e); }
            if (s.selectedSlotIndex) {
              try { saveSlot(s.selectedSlotIndex, s); } catch (e) { console.error(e); }
            }
            router.push('/ending');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  }, [isTyping, isLoading, currentSceneId, addChatMessage, addNarrativeBlock, setAvailableChoices, clearChoices, setTyping, setLoading, setEnding, router]);

  // Handle choice selection
  const handleChoose = useCallback(async (choice: Choice) => {
    console.log('[DEBUG] handleChoose called with:', { choiceId: choice.id, choiceText: choice.text, currentSceneId });
    if (isTyping || isLoading) return;

    // Add user's choice as a message
    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content: choice.text,
    };
    addChatMessage(userMessage);

    // Mark choice as selected
    makeChoice(choice.id);

    setTyping(true);
    setLoading(true, 'Обдумываю последствия...');

    try {
      const response = await processChoice(currentSceneId, choice.id, useGameStore.getState());
      console.log('[DEBUG] processChoice response:', { nextSceneId: response.nextSceneId, isEnding: response.isEnding, endingType: response.endingType });

      // Small delay before showing response
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add narrator response
      const narratorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        role: 'narrator',
        content: response.narratorMessage,
      };
      addChatMessage(narratorMessage);

      // Add narrative block
      const narrativeBlock: Omit<NarrativeBlock, 'id' | 'timestamp'> = {
        content: response.narrativeBlock,
        type: 'narration',
      };
      addNarrativeBlock(narrativeBlock);

      // Set available choices - preserve original IDs for scene navigation
      if (response.choices.length > 0) {
        setAvailableChoices(response.choices.map(c => ({
          id: c.id,
          text: c.text,
          consequence: c.consequence,
          disabled: c.disabled,
        })));
      } else {
        clearChoices();
      }

      setCurrentSceneId(response.nextSceneId);

      // Check for ending
      if (isEndingScene(response.nextSceneId)) {
        const endingInfo = getEndingInfo(response.nextSceneId);
        if (endingInfo) {
          setEnding(endingInfo.type);
          // Save with isFinished=true to both auto-slot and user slot, then navigate
          setTimeout(() => {
            const s = useGameStore.getState();
            try { saveSlot(0, s); } catch (e) { console.error(e); }
            if (s.selectedSlotIndex) {
              try { saveSlot(s.selectedSlotIndex, s); } catch (e) { console.error(e); }
            }
            router.push('/ending');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to process choice:', error);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  }, [isTyping, isLoading, currentSceneId, addChatMessage, makeChoice, addNarrativeBlock, setAvailableChoices, clearChoices, setTyping, setLoading, setEnding, router]);

  // Handle typing complete (for auto-play)
  const handleTypingComplete = useCallback(() => {
    // Could trigger auto-play logic here
  }, []);

  // Handle home button
  const handleHome = () => {
    setShowExitDialog(true);
  };

  // Confirm exit — save then go to menu
  const confirmExit = () => {
    const state = useGameStore.getState();
    if (state.isGameStarted && !state.isFinished) {
      try { saveSlot(0, state); } catch (e) { console.error(e); }
      if (state.selectedSlotIndex) {
        try { saveSlot(state.selectedSlotIndex, state); } catch (e) { console.error(e); }
      }
    }
    router.push('/');
  };

  // Handle save — no longer used (auto-save on exit), kept for compatibility
  const handleSave = () => {
    const state = useGameStore.getState();
    try { saveSlot(0, state); } catch (e) { console.error(e); }
    if (state.selectedSlotIndex) {
      try { saveSlot(state.selectedSlotIndex, state); } catch (e) { console.error(e); }
    }
  };

  // Get text size class
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      default: return 'text-base';
    }
  };

  return (
    <div className={`h-screen flex flex-col relative ${getTextSizeClass()}`}>
      {/* Themed narrator background */}
      <GameBackground
        narratorId={preset.id}
        accentColor={preset.accentColor}
      />

      {/* Content above background */}
      <div className="relative z-10 h-full flex flex-col bg-black/30">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/30 backdrop-blur-sm">
        {/* Left: Logo + Narrator info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="font-serif text-xl font-semibold"
              style={{ color: preset.accentColor }}
            >
              GenNarrative
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: preset.accentColor }}
            />
            <span className="text-sm text-white/70">{preset.name}</span>
          </div>
        </div>

        {/* Center: Chapter indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Глава</span>
          <span
            className="text-sm font-medium"
            style={{ color: preset.accentColor }}
          >
            {currentChapter}
          </span>
        </div>

        {/* Right: Icon buttons */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Music2}
            label="Музыка"
            onClick={() => setShowMusicPlayer((v) => !v)}
            active={showMusicPlayer}
          />
          <ToolbarButton
            icon={BookOpen}
            label="Журнал"
            onClick={() => setShowDiary(true)}
            active={showDiary}
          />
          <ToolbarButton
            icon={Users}
            label="Персонажи"
            onClick={() => setShowCharacters(true)}
            active={showCharacters}
          />
          <ToolbarButton
            icon={Map}
            label="Карта решений"
            onClick={() => setShowDecisionMap(true)}
            active={showDecisionMap}
          />
          <ToolbarButton
            icon={Settings}
            label="Настройки"
            onClick={() => setShowSettings(true)}
            active={showSettings}
          />
          {isFinished && (
            <ToolbarButton
              icon={Trophy}
              label="Концовка"
              onClick={() => setShowEndingOverlay(true)}
              active={showEndingOverlay}
            />
          )}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ToolbarButton
            icon={Home}
            label="В меню"
            onClick={handleHome}
          />
        </div>
      </header>

      {/* Music Player */}
      <MusicPlayer
        open={showMusicPlayer}
        onClose={() => setShowMusicPlayer(false)}
        accentColor={preset.accentColor}
        trackName={preset.name}
      />
      <main className="flex-1 flex overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: preset.accentColor }}
              />
              <span className="text-white/70 text-sm">
                {useUIStore.getState().loadingMessage || 'Загрузка...'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Left Panel - Narrative */}
        <div className="w-[50%] min-w-[400px] max-w-[700px]">
          <NarrativePanel
            blocks={narrativeBlocks}
            decisions={decisions}
            currentChapter={currentChapter}
            accentColor={preset.accentColor}
          />
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1">
          <ChatPanel
            messages={chatHistory}
            preset={preset}
            choices={isFinished ? [] : availableChoices}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onChoose={handleChoose}
            isDisabled={isLoading || isFinished}
            isFinished={isFinished}
            useTypewriter={true}
            onTypingComplete={handleTypingComplete}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      {/* Diary Panel */}
      <DiaryPanel
        open={showDiary}
        onClose={() => setShowDiary(false)}
      />

      {/* Characters Panel */}
      <CharactersPanel
        open={showCharacters}
        onClose={() => setShowCharacters(false)}
      />

      {/* Decision Map */}
      <DecisionMap
        open={showDecisionMap}
        onClose={() => setShowDecisionMap(false)}
      />

      {/* Exit confirmation dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-[#1a1a24] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Выйти в главное меню?</DialogTitle>
          </DialogHeader>
          <p className="text-white/60 text-sm">
            Прогресс будет сохранён автоматически. Вы уверены, что хотите выйти?
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExitDialog(false)}
              className="bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            >
              Отмена
            </Button>
            <Button
              onClick={confirmExit}
              className="bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/30"
            >
              Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>{/* end z-10 content wrapper */}

      {/* Ending overlay — shown manually via Trophy button, not auto */}
      {showEndingOverlay && isFinished && endingId && (
        <div className="fixed inset-0 z-50">
          <EndingScreen
            endingId={endingId}
            onNewGame={() => {
              setShowEndingOverlay(false);
              router.push('/select-narrator');
            }}
            onMainMenu={() => {
              setShowEndingOverlay(false);
              router.push('/');
            }}
          />
          {/* Close button */}
          <button
            onClick={() => setShowEndingOverlay(false)}
            className="fixed top-4 right-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
