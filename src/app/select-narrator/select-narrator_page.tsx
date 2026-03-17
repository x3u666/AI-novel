'use client';

import { useState, useSyncExternalStore, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Toolbar } from '@/components/layout/Toolbar';
import { NarratorGrid } from '@/components/narrator/NarratorGrid';
import { NarratorDetails } from '@/components/narrator/NarratorDetails';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { presets, defaultPreset } from '@/data/presets';
import { useGameStore } from '@/stores/gameStore';
import type { PresetId } from '@/types/narrator';

// ── SSR helpers ───────────────────────────────────────────────────────────────
const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

// ── Static data (computed once, never recreated) ───────────────────────────────
type Particle = { id: number; x: number; y: number; size: number; opacity: number; duration: number; delay: number; symbol?: string; color?: string; };

const PARTICLES: Record<PresetId, Particle[]> = {
  neutral: [],
  knight: [
    { id:0, x:15, y:75, size:2,   opacity:0.06, duration:5,   delay:0,   color:'#D4A853' },
    { id:1, x:30, y:85, size:1.5, opacity:0.05, duration:7,   delay:1.2, color:'#D4A853' },
    { id:2, x:50, y:80, size:2,   opacity:0.07, duration:6,   delay:0.5, color:'#D4A853' },
    { id:3, x:65, y:90, size:1,   opacity:0.04, duration:8,   delay:2,   color:'#D4A853' },
    { id:4, x:78, y:72, size:1.5, opacity:0.06, duration:5.5, delay:1.8, color:'#D4A853' },
    { id:5, x:42, y:95, size:2,   opacity:0.05, duration:6.5, delay:3,   color:'#D4A853' },
    { id:6, x:88, y:78, size:1,   opacity:0.07, duration:7.5, delay:0.8, color:'#D4A853' },
  ],
  romantic: [
    { id:0, x:10, y:5,   size:14, opacity:0.05, duration:9,  delay:0,   symbol:'🌸' },
    { id:1, x:35, y:-5,  size:12, opacity:0.04, duration:12, delay:2.5, symbol:'🌸' },
    { id:2, x:60, y:10,  size:16, opacity:0.05, duration:8,  delay:5,   symbol:'🌸' },
    { id:3, x:80, y:0,   size:10, opacity:0.04, duration:11, delay:1,   symbol:'🌸' },
    { id:4, x:50, y:-10, size:13, opacity:0.05, duration:10, delay:3.5, symbol:'🌸' },
  ],
  fighter: [
    { id:0, x:25, y:40, size:2,   opacity:0.06, duration:3,   delay:0,   color:'#D45B3E' },
    { id:1, x:45, y:60, size:1.5, opacity:0.05, duration:2.5, delay:0.7, color:'#E8703A' },
    { id:2, x:60, y:50, size:2.5, opacity:0.06, duration:4,   delay:1.4, color:'#D45B3E' },
    { id:3, x:35, y:75, size:1,   opacity:0.07, duration:2,   delay:0.3, color:'#E8703A' },
    { id:4, x:70, y:35, size:2,   opacity:0.05, duration:3.5, delay:2,   color:'#D45B3E' },
    { id:5, x:55, y:80, size:1.5, opacity:0.06, duration:2.8, delay:1,   color:'#E8703A' },
    { id:6, x:30, y:55, size:2,   opacity:0.05, duration:3.2, delay:1.8, color:'#D45B3E' },
  ],
  scientist: [],
  dark_mage: [
    { id:0, x:10, y:20, size:16, opacity:0.06, duration:12, delay:0, symbol:'∞', color:'#8B5CD4' },
    { id:1, x:30, y:55, size:12, opacity:0.06, duration:9,  delay:2, symbol:'◈', color:'#8B5CD4' },
    { id:2, x:55, y:15, size:18, opacity:0.06, duration:14, delay:4, symbol:'△', color:'#8B5CD4' },
    { id:3, x:72, y:70, size:14, opacity:0.06, duration:10, delay:1, symbol:'⌬', color:'#8B5CD4' },
    { id:4, x:85, y:35, size:16, opacity:0.06, duration:11, delay:3, symbol:'❖', color:'#8B5CD4' },
    { id:5, x:45, y:80, size:12, opacity:0.06, duration:13, delay:5, symbol:'⬡', color:'#8B5CD4' },
  ],
  detective: [],
  horror:    [],
  poet: [
    { id:0, x:12, y:5,  size:16, opacity:0.04, duration:12, delay:0,   symbol:'🍃' },
    { id:1, x:40, y:-5, size:12, opacity:0.04, duration:16, delay:3,   symbol:'🍂' },
    { id:2, x:65, y:8,  size:14, opacity:0.04, duration:10, delay:6,   symbol:'🌿' },
    { id:3, x:82, y:-8, size:16, opacity:0.04, duration:14, delay:1.5, symbol:'🍃' },
  ],
  comedian: [
    { id:0, x:10, y:-5,  size:5, opacity:0.06, duration:7,   delay:0,   color:'#D4A853' },
    { id:1, x:25, y:10,  size:4, opacity:0.05, duration:8,   delay:1,   color:'#D47B8E' },
    { id:2, x:45, y:-8,  size:6, opacity:0.06, duration:6,   delay:2,   color:'#4BA3D4' },
    { id:3, x:60, y:5,   size:4, opacity:0.05, duration:9,   delay:0.5, color:'#7BA896' },
    { id:4, x:75, y:-3,  size:5, opacity:0.06, duration:7.5, delay:3,   color:'#8B5CD4' },
    { id:5, x:88, y:12,  size:3, opacity:0.05, duration:8.5, delay:1.5, color:'#D4A853' },
    { id:6, x:35, y:-10, size:5, opacity:0.06, duration:6.5, delay:4,   color:'#D47B8E' },
    { id:7, x:55, y:15,  size:4, opacity:0.05, duration:9.5, delay:2.5, color:'#4BA3D4' },
  ],
};

const GRADIENTS: Record<PresetId, string> = {
  neutral:   'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
  knight:    'radial-gradient(circle at 50% 100%, rgba(212,168,83,0.04) 0%, transparent 70%)',
  romantic:  'radial-gradient(circle at 50% 50%, rgba(212,123,142,0.04) 0%, transparent 70%)',
  fighter:   'radial-gradient(circle at 100% 100%, rgba(212,91,62,0.04) 0%, transparent 70%)',
  scientist: 'radial-gradient(circle at 50% 0%, rgba(75,163,212,0.04) 0%, transparent 70%)',
  dark_mage: 'radial-gradient(circle at 50% 50%, rgba(139,92,212,0.04) 0%, transparent 70%)',
  detective: 'radial-gradient(circle at 0% 0%, rgba(201,168,76,0.03) 0%, transparent 70%)',
  horror:    'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 100%)',
  poet:      'radial-gradient(circle at 50% 0%, rgba(123,168,150,0.03) 0%, transparent 70%)',
  comedian:  'radial-gradient(circle at 50% 50%, rgba(232,168,56,0.04) 0%, transparent 70%)',
};

const SCAN_LINES = [{ top:'20%', delay:0 }, { top:'50%', delay:4 }, { top:'75%', delay:8 }];
const RAIN_STREAKS = Array.from({ length: 18 }, (_, i) => ({
  id: i, left: `${(i * 5.8) % 100}%`,
  height: `${20 + (i % 3) * 15}px`,
  duration: 2 + (i % 4) * 0.5,
  delay: (i * 0.3) % 3,
}));

// ── Memoized background — only re-renders when selectedId changes ──────────────
const AmbientBackground = memo(function AmbientBackground({ selectedId }: { selectedId: PresetId }) {
  const particles = PARTICLES[selectedId] ?? [];

  return (
    <>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: GRADIENTS[selectedId], transition: 'background 0.8s ease-in-out' }}
      />

      {/* Scientist: scan lines */}
      {selectedId === 'scientist' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {SCAN_LINES.map((line, i) => (
            <motion.div key={i} className="absolute left-0 right-0"
              style={{ height:'1px', background:'rgba(75,163,212,0.06)', top: line.top }}
              animate={{ y: ['0vh', '100vh'] }}
              transition={{ duration:12, delay: line.delay, repeat: Infinity, ease:'linear' }}
            />
          ))}
        </div>
      )}

      {/* Detective: rain */}
      {selectedId === 'detective' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {RAIN_STREAKS.map(s => (
            <motion.div key={s.id} className="absolute"
              style={{ width:'1px', height: s.height, background:'rgba(201,168,76,0.04)', left: s.left, top:'-10%', transform:'rotate(15deg)' }}
              animate={{ y: ['0vh', '110vh'] }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease:'linear' }}
            />
          ))}
        </div>
      )}

      {/* Horror: vignette */}
      {selectedId === 'horror' && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute inset-0"
            style={{ background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration:6, repeat: Infinity, ease:'easeInOut' }}
          />
        </div>
      )}

      {/* Particles */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map(p => {
            const base = { position:'absolute' as const, left:`${p.x}vw`, top:`${p.y}vh` };

            if (p.symbol && selectedId === 'dark_mage') return (
              <motion.div key={p.id} className="select-none" style={{ ...base, fontSize: p.size, opacity: p.opacity, color: p.color }}
                animate={{ rotate: 360 }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease:'linear' }}
              >{p.symbol}</motion.div>
            );

            if (p.symbol) return (
              <motion.div key={p.id} className="select-none" style={{ ...base, fontSize: p.size, opacity: p.opacity }}
                animate={{ y:'110vh' }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease:'linear' }}
              >{p.symbol}</motion.div>
            );

            if (selectedId === 'knight') return (
              <motion.div key={p.id} className="rounded-full" style={{ ...base, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.opacity }}
                animate={{ y:'-80vh', opacity:[p.opacity, 0] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease:'linear' }}
              />
            );

            if (selectedId === 'fighter') return (
              <motion.div key={p.id} className="rounded-full" style={{ ...base, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.opacity }}
                animate={{ opacity:[p.opacity, 0.01, p.opacity] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease:'easeInOut' }}
              />
            );

            return (
              <motion.div key={p.id} className="rounded-full" style={{ ...base, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.opacity }}
                animate={{ y:'80vh', opacity:[p.opacity, 0] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease:'linear' }}
              />
            );
          })}
        </div>
      )}
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

export default function SelectNarratorPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<PresetId>(defaultPreset.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { startNewGame } = useGameStore();
  const selectedPreset = presets.find(p => p.id === selectedId) || null;
  const accentColor = selectedPreset?.accentColor ?? '#A8B0BC';

  const handleSelect = useCallback((id: PresetId) => {
    if (id === selectedId) return;
    const ci = presets.findIndex(p => p.id === selectedId);
    const ni = presets.findIndex(p => p.id === id);
    setSlideDirection(ni > ci ? 'left' : 'right');
    setSelectedId(id);
  }, [selectedId]);

  const handleContinue = () => {
    if (!selectedId || isContinuing) return;
    setIsContinuing(true);
    setTimeout(() => { startNewGame(selectedId); router.push('/game'); }, 600);
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: '#0F0F14' }}>

      {/* Background — memoized, won't cause page re-render on unrelated state changes */}
      <AmbientBackground selectedId={selectedId} />

      {/* Toolbar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8, ease: 'easeOut' }}
        className="relative z-20"
      >
        <Toolbar title="Новая игра" showSettings showHome onSettingsClick={() => setSettingsOpen(true)} />
        <div style={{ height: '2px', width: '100%', backgroundColor: accentColor, transition: 'background-color 0.5s ease' }} />
      </motion.div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-4 md:px-8 pb-8 overflow-y-auto">

        {/* Heading */}
        <div className="flex flex-col items-center mt-8 mb-7">
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{ fontFamily:'"Playfair Display", Georgia, serif', fontWeight:700, fontSize:'clamp(20px,2.5vw,28px)', color:'#E8E8ED', letterSpacing:'1px', textAlign:'center' }}
          >
            Выберите своего рассказчика
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            style={{ fontFamily:'Inter, sans-serif', fontSize:'15px', color:'#9898A6', marginTop:'10px', textAlign:'center' }}
          >
            Каждый из них расскажет историю по-своему
          </motion.p>
        </div>

        {/* Carousel */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4, delay:1.5 }} className="mb-7">
          <NarratorGrid presets={presets} selectedId={selectedId} onSelect={handleSelect} />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:2.3 }}
          className="w-full max-w-[880px] mx-auto rounded-2xl"
          style={{
            background:'rgba(26,26,36,0.5)', backdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.06)',
            padding:'clamp(20px,3vw,32px) clamp(20px,3.5vw,36px)',
            minHeight:'280px',
          }}
        >
          <NarratorDetails preset={selectedPreset} slideDirection={slideDirection} />
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4, delay:2.8 }}
          className="flex justify-end w-full max-w-[880px] mx-auto mt-6"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedId || isContinuing}
            className="relative flex items-center justify-center gap-2 font-semibold rounded-[10px] disabled:opacity-50"
            style={{
              width:220, height:50,
              backgroundColor: accentColor,
              color:'#1A1A24',
              fontFamily:'Inter, sans-serif', fontSize:16,
              border:'none',
              cursor: selectedId && !isContinuing ? 'pointer' : 'not-allowed',
              boxShadow:`0 4px 16px ${accentColor}40`,
              transition:'background-color 0.5s ease, box-shadow 0.5s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'; }}
          >
            {isContinuing ? (
              <>
                <span>Начинаем...</span>
                <svg className="animate-spin ml-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </>
            ) : (
              <>
                <span>Продолжить</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
