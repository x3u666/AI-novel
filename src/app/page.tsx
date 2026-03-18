'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/menu/AnimatedBackground';
import { MenuButton } from '@/components/menu/MenuButton';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { AboutModal } from '@/components/modals/AboutModal';
import { LoadGameModal } from '@/components/modals/LoadGameModal';
import { NewGameSlotModal } from '@/components/modals/NewGameSlotModal';
import { useGameStore } from '@/stores/gameStore';
import { hasAutoSave } from '@/services/saveService';

const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [newGameSlotOpen, setNewGameSlotOpen] = useState(false);

  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { loadGame, setSelectedSlot } = useGameStore();

  const canContinue = typeof window !== 'undefined' && hasAutoSave();

  const handleNewGame = () => setNewGameSlotOpen(true);

  const handleSlotSelected = (slotIndex: number) => {
    setSelectedSlot(slotIndex);
    router.push('/select-narrator');
  };

  const handleContinue = () => {
    if (canContinue) {
      loadGame(0);
      router.push('/game');
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
    },
  };
  const subtitleVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
    },
  };
  const buttonContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
    },
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-16">
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            style={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d794 50%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: 'clamp(3rem, 9vw, 7rem)',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
            }}
          >
            GenNarrative
          </motion.h1>
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
            className="mt-4 text-lg md:text-xl text-white/60 tracking-wide"
          >
            Интерактивная AI-история
          </motion.p>
        </div>

        <motion.div
          variants={buttonContainerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div variants={buttonVariants}>
            <MenuButton label="Новая игра" onClick={handleNewGame} />
          </motion.div>
          <motion.div variants={buttonVariants}>
            <MenuButton
              label="Продолжить"
              onClick={handleContinue}
              disabled={!canContinue}
              tooltip={!canContinue ? 'Нет сохранений' : undefined}
            />
          </motion.div>
          <motion.div variants={buttonVariants}>
            <MenuButton label="Загрузить" onClick={() => setLoadOpen(true)} />
          </motion.div>
          <motion.div variants={buttonVariants}>
            <MenuButton label="Настройки" onClick={() => setSettingsOpen(true)} />
          </motion.div>
          <motion.div variants={buttonVariants}>
            <MenuButton label="О проекте" onClick={() => setAboutOpen(true)} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-4 right-4 text-white/30 text-sm font-mono z-20"
      >
        v 0.1.0
      </motion.div>

      <AnimatePresence>
        {newGameSlotOpen && (
          <NewGameSlotModal
            open={newGameSlotOpen}
            onOpenChange={setNewGameSlotOpen}
            onSlotSelected={handleSlotSelected}
          />
        )}
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
