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
  streamNarrative,
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
  const { textSize, gameFont } = useSettingsStore();

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
  // Streaming state: text accumulating in the narrative panel before chat appears
  const [streamingNarrativeText, setStreamingNarrativeText] = useState<string>('');
  // 'idle' | 'streaming-narrative' | 'typewriting-narrative' | 'showing-chat'
  const [narrativePhase, setNarrativePhase] = useState<'idle' | 'streaming-narrative' | 'typewriting-narrative' | 'showing-chat'>('idle');

  // Ref to track previous chapter for auto-save
  const prevChapterRef = useRef(currentChapter);
  // Holds the parsed LLM response while narrative typewriter is running
  const pendingResponseRef = useRef<import('@/services/narrativeService').NarrativeResponse | null>(null);

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

  // ── Shared post-stream logic ────────────────────────────────────────────────
  const handleStreamResponse = useCallback(async (
    mode: 'input' | 'choice',
    userInputOrChoiceId: string,
  ) => {
    setNarrativePhase('streaming-narrative');
    setStreamingNarrativeText('');
    // Clear loading overlay as soon as streaming begins
    setLoading(false);

    try {
      const response = await streamNarrative(
        userInputOrChoiceId,
        useGameStore.getState(),
        mode,
        (chunk) => {
          setStreamingNarrativeText((prev) => prev + chunk);
        },
      );

      // Stream finished — commit the narrative block to the store
      // (typewriter will re-animate from the stored block)
      const narrativeBlock: Omit<NarrativeBlock, 'id' | 'timestamp'> = {
        content: response.narrativeBlock,
        type: 'narration',
      };
      addNarrativeBlock(narrativeBlock);
      setStreamingNarrativeText('');
      // Streaming done — hide loading overlay now, typewriter takes over
      setLoading(false);
      setNarrativePhase('typewriting-narrative');
      pendingResponseRef.current = response;

    } catch (error) {
      console.error('Failed to stream narrative:', error);
      // On error reset everything so the player can try again
      setNarrativePhase('idle');
      setTyping(false);
      setLoading(false);
    }
    // Note: setTyping/setLoading/setNarrativePhase → 'idle' are called
    // in handleNarrativeTypingComplete once the typewriter finishes.
  }, [addNarrativeBlock, setTyping, setLoading, router]);

  // Handle user message
  const handleSendMessage = useCallback(async (text: string) => {
    if (isTyping || isLoading || narrativePhase !== 'idle') return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'user', content: text };
    addChatMessage(userMessage);

    setTyping(true);
    setLoading(true, 'Пишу историю...');
    await handleStreamResponse('input', text);
  }, [isTyping, isLoading, addChatMessage, setTyping, setLoading, handleStreamResponse]);

  // Handle choice selection
  const handleChoose = useCallback(async (choice: Choice) => {
    if (isTyping || isLoading || narrativePhase !== 'idle') return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'user', content: choice.text };
    addChatMessage(userMessage);
    makeChoice(choice.id);

    setTyping(true);
    setLoading(true, 'Пишу историю...');
    await handleStreamResponse('choice', choice.id);
  }, [isTyping, isLoading, addChatMessage, makeChoice, setTyping, setLoading, handleStreamResponse]);

  // Called when NarrativeBlock typewriter finishes — now reveal chat
  const handleNarrativeTypingComplete = useCallback(() => {
    const response = pendingResponseRef.current;
    if (!response) return;
    pendingResponseRef.current = null;

    setNarrativePhase('showing-chat');
    setLoading(false);

    const narratorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      role: 'narrator',
      content: response.narratorMessage,
    };
    addChatMessage(narratorMessage);

    if (response.choices.length > 0) {
      setAvailableChoices(response.choices.map(ch => ({
        id: ch.id,
        text: ch.text,
        consequence: ch.consequence,
        disabled: ch.disabled,
      })));
    } else {
      clearChoices();
    }

    setCurrentSceneId(response.nextSceneId);
    setTyping(false);
    setLoading(false);
    setNarrativePhase('idle');

    if (isEndingScene(response.nextSceneId)) {
      const endingInfo = getEndingInfo(response.nextSceneId);
      if (endingInfo) {
        setEnding(endingInfo.type);
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
  }, [addChatMessage, setAvailableChoices, clearChoices, setTyping, setLoading, setEnding, router]);

  // Chat typewriter complete (for auto-play, kept for future use)
  const handleTypingComplete = useCallback(() => {}, []);

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

  const fontFamilyMap: Record<string, string> = {
    inter:    '"Inter", sans-serif',
    bookerly: '"Bookerly", "Georgia", serif',
    literata: '"Literata", "Georgia", serif',
    garamond: '"Garamond", "EB Garamond", serif',
    georgia:  '"Georgia", serif',
  };
  const gameFontFamily = fontFamilyMap[gameFont ?? 'inter'] ?? '"Inter", sans-serif';

  return (
    <div
      className={`h-screen flex flex-col relative ${getTextSizeClass()}`}
      style={{ '--game-font': gameFontFamily } as React.CSSProperties}
    >
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
              className="font-serif font-semibold"
              style={{ color: preset.accentColor, fontSize: '1.1em' }}
            >
              GenNarrative
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: preset.accentColor }}
            />
            <span className="text-white/70">{preset.name}</span>
          </div>
        </div>

        {/* Center: Chapter indicator */}
        <div className="flex items-center gap-2">
          <span className="text-white/50">Глава</span>
          <span
            className="font-medium"
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

        {/* Left Panel - Narrative — 60% */}
        <div className="w-[60%] min-w-[380px] max-w-[900px] border-r border-white/15" style={{ fontFamily: gameFontFamily }}>
          <NarrativePanel
            blocks={narrativeBlocks}
            decisions={decisions}
            currentChapter={currentChapter}
            accentColor={preset.accentColor}
            streamingText={streamingNarrativeText}
            isStreaming={narrativePhase === 'streaming-narrative'}
            isTypewriting={narrativePhase === 'typewriting-narrative'}
            onNarrativeTypingComplete={handleNarrativeTypingComplete}
          />
        </div>

        {/* Right Panel - Chat — 40% */}
        <div className="flex-1" style={{ fontFamily: gameFontFamily }}>
          <ChatPanel
            messages={chatHistory}
            preset={preset}
            choices={isFinished ? [] : availableChoices}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onChoose={handleChoose}
            isDisabled={isFinished || narrativePhase === 'streaming-narrative' || narrativePhase === 'typewriting-narrative'}
            isFinished={isFinished}
            useTypewriter={true}
            onTypingComplete={handleTypingComplete}
            isNarrativeStreaming={narrativePhase === 'streaming-narrative' || narrativePhase === 'typewriting-narrative'}
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
