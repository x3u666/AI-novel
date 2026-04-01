'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, User, Lock, Heart, Skull } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { Character } from '@/types';

interface CharactersPanelProps {
  open: boolean;
  onClose: () => void;
}

// Relationship types with labels and icons
const RELATIONSHIP_TYPES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ally: { label: 'Союзник', icon: Heart, color: 'text-green-400' },
  friend: { label: 'Друг', icon: Heart, color: 'text-blue-400' },
  neutral: { label: 'Нейтрален', icon: User, color: 'text-gray-400' },
  enemy: { label: 'Враг', icon: Skull, color: 'text-red-400' },
  unknown: { label: 'Неизвестно', icon: Lock, color: 'text-white/30' },
};

export function CharactersPanel({ open, onClose }: CharactersPanelProps) {
  const { characters, decisions, currentChapter } = useGameStore();

  // Separate unlocked and locked characters
  const { unlockedCharacters, lockedCharacters } = useMemo(() => {
    const unlocked: Character[] = [];
    const locked: Character[] = [];

    characters.forEach(char => {
      if (char.isUnlocked) {
        unlocked.push(char);
      } else {
        locked.push(char);
      }
    });

    // Sort unlocked by name
    unlocked.sort((a, b) => a.name.localeCompare(b.name));

    return { unlockedCharacters: unlocked, lockedCharacters: locked };
  }, [characters]);

  // Get relationship info for a character
  const getRelationshipInfo = (character: Character) => {
    const attitude = character.relationships['protagonist'] ?? 0;
    if (attitude >= 30)  return RELATIONSHIP_TYPES.ally;
    if (attitude >= 5)   return RELATIONSHIP_TYPES.friend;
    if (attitude > -30)  return RELATIONSHIP_TYPES.neutral;
    return RELATIONSHIP_TYPES.enemy;
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Animation variants
  const panelVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08 },
    }),
  };

  const hasNoCharacters = unlockedCharacters.length === 0 && lockedCharacters.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 z-50 h-full w-full max-w-md bg-[#12121a] border-r border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#d4af37]" />
                </div>
                <h2 className="text-lg font-semibold text-white">Персонажи</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {hasNoCharacters ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <Users className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm">Персонажи не найдены</p>
                  <p className="text-xs mt-1">Встреченные герои появятся здесь</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Unlocked characters */}
                  {unlockedCharacters.length > 0 && (
                    <div className="space-y-3">
                      {unlockedCharacters.map((character, index) => {
                        const relationshipInfo = getRelationshipInfo(character);
                        const RelationshipIcon = relationshipInfo.icon;

                        return (
                          <motion.div
                            key={character.id}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                          >
                            <div className="flex gap-4">
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                {character.avatarUrl ? (
                                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#d4af37]/30">
                                    <img
                                      src={character.avatarUrl}
                                      alt={character.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 flex items-center justify-center border-2 border-[#d4af37]/30">
                                    <span className="text-xl font-semibold text-[#d4af37]">
                                      {character.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-white">{character.name}</h3>
                                  {character.traits[0] && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                      {character.traits[0]}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-white/50 mt-1 leading-snug">
                                  {character.description}
                                </p>
                                {character.traits[1] && (
                                  <p className="text-xs text-white/30 italic mt-1.5 leading-snug">
                                    ↳ {character.traits[1]}
                                  </p>
                                )}

                                {/* Relationship */}
                                <div className="flex items-center gap-4 mt-3 text-xs">
                                  <div className={`flex items-center gap-1 ${relationshipInfo.color}`}>
                                    <RelationshipIcon className="w-3.5 h-3.5" />
                                    <span>{relationshipInfo.label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Locked characters (unknown) */}
                  {lockedCharacters.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Неизвестные</span>
                      </div>
                      {lockedCharacters.map((character, index) => (
                        <motion.div
                          key={character.id}
                          custom={index + unlockedCharacters.length}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                          <div className="flex gap-4">
                            {/* Unknown avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10">
                                <span className="text-2xl text-white/20">?</span>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white/30">???</h3>
                              <p className="text-sm text-white/20 italic mt-1">
                                {character.description || 'Таинственный незнакомец'}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-white/20">
                                <span>Встречен: —</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer statistics */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center justify-around text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-white/50">Открыто</span>
                  <span className="text-xl font-semibold text-[#d4af37]">{unlockedCharacters.length}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-white/50">Неизвестно</span>
                  <span className="text-xl font-semibold text-white/30">{lockedCharacters.length}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-white/50">Всего</span>
                  <span className="text-xl font-semibold text-white/50">{characters.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
