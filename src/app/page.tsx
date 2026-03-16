'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/menu/AnimatedBackground';
import { MenuButton } from '@/components/menu/MenuButton';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { AboutModal } from '@/components/modals/AboutModal';
import { LoadGameModal } from '@/components/modals/LoadGameModal';
import { useGameStore } from '@/stores/gameStore';
import { loadSlot } from '@/services/saveService';

// Subscribe function for useSyncExternalStore
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

// Get snapshot for SSR vs client
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

  // Check if mounted on client
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { loadGame } = useGameStore();

  // Check if auto-save exists
  const autoSave = typeof window !== 'undefined' ? loadSlot(0) : null;
  const hasSave = !!autoSave;

  const handleNewGame = () => {
    // Navigate to narrator selection
    router.push('/select-narrator');
  };

  const handleContinue = () => {
    if (hasSave) {
      // Load from auto-save slot (index 0)
      loadGame(0);
      router.push('/game');
    }
  };

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const buttonContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
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

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title Section */}
        <div className="text-center mb-16">
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="font-playfair text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d794 50%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
            }}
          >
            Хроники
          </motion.h1>

          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
            className="mt-4 text-lg md:text-xl text-white/60 tracking-wide"
          >
            Интерактивная AI-новелла
          </motion.p>
        </div>

        {/* Menu Buttons */}
        <motion.div
          variants={buttonContainerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div variants={buttonVariants}>
            <MenuButton
              label="Новая игра"
              onClick={handleNewGame}
            />
          </motion.div>

          <motion.div variants={buttonVariants}>
            <MenuButton
              label="Продолжить"
              onClick={handleContinue}
              disabled={!hasSave}
              tooltip={!hasSave ? 'Нет сохранений' : undefined}
            />
          </motion.div>

          <motion.div variants={buttonVariants}>
            <MenuButton
              label="Загрузить игру"
              onClick={() => setLoadOpen(true)}
            />
          </motion.div>

          <motion.div variants={buttonVariants}>
            <MenuButton
              label="Настройки"
              onClick={() => setSettingsOpen(true)}
            />
          </motion.div>

          <motion.div variants={buttonVariants}>
            <MenuButton
              label="Об игре"
              onClick={() => setAboutOpen(true)}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Version Number */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-4 right-4 text-white/30 text-sm font-mono z-20"
      >
        v 0.1.0
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        )}
        {aboutOpen && (
          <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
        )}
        {loadOpen && (
          <LoadGameModal open={loadOpen} onOpenChange={setLoadOpen} />
        )}
      </AnimatePresence>
    </main>
  );
}
