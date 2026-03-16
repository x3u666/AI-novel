'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EndingScreen } from '@/components/game/EndingScreen';
import { useGameStore } from '@/stores/gameStore';
import type { EndingType } from '@/types';

export default function EndingPage() {
  const router = useRouter();
  const { endingId, isFinished, endGame } = useGameStore();
  const [mounted, setMounted] = useState(false);
  
  // Flag to prevent redirect when navigating away
  const isNavigatingRef = useRef(false);
  
  // Wait for client-side hydration
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect to main menu if no ending is set (after hydration)
  useEffect(() => {
    // Don't redirect if we're intentionally navigating away
    if (isNavigatingRef.current) return;
    
    if (mounted && (!isFinished || !endingId)) {
      console.log('No ending set, redirecting to main menu', { isFinished, endingId });
      router.push('/');
    }
  }, [mounted, isFinished, endingId, router]);
  
  // Handle new game - navigate to narrator selection without resetting state first
  const handleNewGame = () => {
    isNavigatingRef.current = true;
    router.push('/select-narrator');
  };
  
  // Handle main menu - reset game and go to main menu
  const handleMainMenu = () => {
    isNavigatingRef.current = true;
    endGame();
    router.push('/');
  };
  
  // Don't render until mounted (SSR hydration)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-white/50">Загрузка...</div>
      </div>
    );
  }
  
  // Don't render if no ending
  if (!isFinished || !endingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-white/50">Перенаправление...</div>
      </div>
    );
  }
  
  return (
    <EndingScreen
      endingId={endingId as EndingType}
      onNewGame={handleNewGame}
      onMainMenu={handleMainMenu}
    />
  );
}
