'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '@/components/menu/AnimatedBackground';
import { Toolbar } from '@/components/layout/Toolbar';
import { NarratorGrid } from '@/components/narrator/NarratorGrid';
import { NarratorDetails } from '@/components/narrator/NarratorDetails';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { presets, defaultPreset } from '@/data/presets';
import { useGameStore } from '@/stores/gameStore';
import type { PresetId } from '@/types/narrator';

// Subscribe function for useSyncExternalStore
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

// Get snapshot for SSR vs client
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function SelectNarratorPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<PresetId>(defaultPreset.id);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check if mounted on client
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { startNewGame } = useGameStore();

  // Get selected preset
  const selectedPreset = presets.find((p) => p.id === selectedId) || null;

  // Handle preset selection
  const handleSelect = (id: PresetId) => {
    setSelectedId(id);
  };

  // Handle continue button
  const handleContinue = () => {
    if (selectedId) {
      // Start new game with selected narrator (resets state and sets isGameStarted: true)
      startNewGame(selectedId);
      router.push('/game');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Toolbar */}
      <Toolbar
        title="Выбор рассказчика"
        showSettings
        showHome
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 pt-16 md:pt-20 px-4 md:px-8 pb-24 min-h-screen flex flex-col"
      >
        {/* Cards Section */}
        <motion.div
          variants={itemVariants}
          className="mb-6 md:mb-8"
        >
          <NarratorGrid
            presets={presets}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </motion.div>

        {/* Details Section */}
        <motion.div
          variants={itemVariants}
          className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 md:p-6"
        >
          <ScrollArea className="h-full max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-340px)]">
            <NarratorDetails preset={selectedPreset} />
          </ScrollArea>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          variants={itemVariants}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-20"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedId}
            size="lg"
            className={`
              px-6 md:px-8 h-12 md:h-14 text-base font-medium
              bg-gradient-to-r transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl
            `}
            style={{
              background: selectedPreset
                ? `linear-gradient(135deg, ${selectedPreset.accentColor} 0%, ${selectedPreset.accentColor}CC 100%)`
                : undefined,
            }}
          >
            Продолжить
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
