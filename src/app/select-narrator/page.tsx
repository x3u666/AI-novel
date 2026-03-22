'use client';

import { useState, useSyncExternalStore, useCallback, memo, useRef } from 'react';
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
  scientist: [
    { id:0, x:10, y:20, size:3,  opacity:0.08, duration:4,  delay:0,   color:'#00D4FF' },
    { id:1, x:85, y:15, size:2,  opacity:0.07, duration:5,  delay:1,   color:'#00FFCC' },
    { id:2, x:55, y:80, size:2.5,opacity:0.07, duration:3.5,delay:2,   color:'#00D4FF' },
    { id:3, x:30, y:60, size:2,  opacity:0.06, duration:6,  delay:0.5, color:'#00FFCC' },
    { id:4, x:70, y:50, size:3,  opacity:0.08, duration:4.5,delay:1.5, color:'#00D4FF' },
  ],
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
  comedian: [
    { id:0, x:10, y:-5,  size:5, opacity:0.06, duration:7,   delay:0,   color:'#D4A853' },
    { id:1, x:25, y:10,  size:4, opacity:0.05, duration:8,   delay:1,   color:'#D47B8E' },
    { id:2, x:45, y:-8,  size:6, opacity:0.06, duration:6,   delay:2,   color:'#4BA3D4' },
    { id:3, x:60, y:5,   size:4, opacity:0.05, duration:9,   delay:0.5, color:'#E8A838' },
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
  scientist: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)',
  dark_mage: 'radial-gradient(circle at 50% 50%, rgba(139,92,212,0.04) 0%, transparent 70%)',
  detective: 'radial-gradient(circle at 0% 0%, rgba(201,168,76,0.03) 0%, transparent 70%)',
  horror:    'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 100%)',
  comedian:  'radial-gradient(circle at 50% 50%, rgba(232,168,56,0.04) 0%, transparent 70%)',
};

const BG_BASE: Record<PresetId, string> = {
  neutral:   '#0e0f14',
  knight:    '#110e05',
  romantic:  '#130a0d',
  fighter:   '#130805',
  scientist: '#03080f',
  dark_mage: '#090613',
  detective: '#0d0b05',
  horror:    '#0d0305',
  comedian:  '#120d04',
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
              style={{ height:'1px', background:'rgba(0,212,255,0.07)', top: line.top }}
              animate={{ y: ['0vh', '100vh'] }}
              transition={{ duration:12, delay: line.delay, repeat: Infinity, ease:'linear' }}
            />
          ))}
          {/* Hex grid dots */}
          {[15,35,55,75,90].map((x, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width:3, height:3, background:'rgba(0,212,255,0.18)', left:`${x}%`, top:`${20+i*15}%` }}
              animate={{ opacity:[0.1,0.4,0.1] }}
              transition={{ duration:3+i, delay:i*0.5, repeat:Infinity, ease:'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* Detective: rain streaks */}
      {selectedId === 'detective' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {RAIN_STREAKS.map(s => (
            <motion.div key={s.id} className="absolute"
              style={{ width:'1px', height: s.height, background:'rgba(201,168,76,0.06)', left: s.left, top:'-10%', transform:'rotate(15deg)' }}
              animate={{ y: ['0vh', '110vh'] }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease:'linear' }}
            />
          ))}
        </div>
      )}

      {/* Horror: pulsing vignette + creeping lines */}
      {selectedId === 'horror' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute inset-0"
            style={{ background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration:6, repeat: Infinity, ease:'easeInOut' }}
          />
          {[0,1,2].map(i => (
            <motion.div key={i} className="absolute left-0 right-0"
              style={{ height:'1px', background:'rgba(139,46,59,0.12)', top:`${30+i*25}%` }}
              animate={{ opacity:[0,0.3,0], scaleX:[0.8,1,0.8] }}
              transition={{ duration:4+i*2, delay:i*1.5, repeat:Infinity, ease:'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* Neutral: slow drifting lines */}
      {selectedId === 'neutral' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[20,40,60,80].map((y, i) => (
            <motion.div key={i} className="absolute left-0 right-0"
              style={{ height:'1px', background:'rgba(168,176,188,0.06)', top:`${y}%` }}
              animate={{ opacity:[0.3,0.7,0.3], x:['-2%','2%','-2%'] }}
              transition={{ duration:8+i*2, delay:i, repeat:Infinity, ease:'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* Comedian: bouncing stars */}
      {selectedId === 'comedian' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[{x:15,y:20},{x:80,y:15},{x:45,y:70},{x:70,y:55}].map((pos, i) => (
            <motion.div key={i} className="absolute select-none"
              style={{ left:`${pos.x}%`, top:`${pos.y}%`, fontSize:16, opacity:0.12, color:'#E8A838' }}
              animate={{ y:[0,-12,0], rotate:[0,15,-15,0] }}
              transition={{ duration:3+i, delay:i*0.8, repeat:Infinity, ease:'easeInOut' }}
            >★</motion.div>
          ))}
        </div>
      )}

      {/* Fighter: diagonal flash lines */}
      {selectedId === 'fighter' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0,1,2].map(i => (
            <motion.div key={i} className="absolute"
              style={{ width:'150%', height:'1px', background:'rgba(212,91,62,0.10)', left:'-25%', top:`${25+i*25}%`, transform:'rotate(-15deg)' }}
              animate={{ opacity:[0,0.5,0] }}
              transition={{ duration:2, delay:i*0.7, repeat:Infinity, ease:'easeInOut' }}
            />
          ))}
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

      {/* SVG decorative patterns per narrator — animated */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* NEUTRAL — drifting grid */}
        {selectedId === 'neutral' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.line x1="0" y1="25" x2="100" y2="25" stroke="rgba(168,176,188,0.06)" strokeWidth="0.3"
              animate={{ opacity:[0.3,0.7,0.3] }} transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.line x1="0" y1="50" x2="100" y2="50" stroke="rgba(168,176,188,0.06)" strokeWidth="0.3"
              animate={{ opacity:[0.5,0.9,0.5] }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut', delay:1 }}/>
            <motion.line x1="0" y1="75" x2="100" y2="75" stroke="rgba(168,176,188,0.06)" strokeWidth="0.3"
              animate={{ opacity:[0.3,0.7,0.3] }} transition={{ duration:7, repeat:Infinity, ease:'easeInOut', delay:2 }}/>
            <line x1="25" y1="0" x2="25" y2="100" stroke="rgba(168,176,188,0.04)" strokeWidth="0.3"/>
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(168,176,188,0.04)" strokeWidth="0.3"/>
            <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(168,176,188,0.04)" strokeWidth="0.3"/>
            <motion.circle cx="50" cy="50" r="18" stroke="rgba(168,176,188,0.10)" strokeWidth="0.4" fill="none" strokeDasharray="2 3"
              animate={{ rotate: 360 }} transition={{ duration:30, repeat:Infinity, ease:'linear' }}
              style={{ transformOrigin:'50% 50%' }}/>
            <motion.path d="M50,32 L51.5,48 L50,50 L48.5,48 Z" fill="rgba(168,176,188,0.12)"
              animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}/>
          </svg>
        )}

        {/* KNIGHT — glowing shield + rotating star */}
        {selectedId === 'knight' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.path d="M15,10 L25,10 L25,22 L20,26 L15,22 Z" stroke="rgba(212,168,83,0.18)" strokeWidth="0.5" fill="none"
              animate={{ opacity:[0.4,0.9,0.4] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}/>
            <line x1="8" y1="55" x2="32" y2="79" stroke="rgba(212,168,83,0.12)" strokeWidth="0.5"/>
            <line x1="12" y1="79" x2="28" y2="55" stroke="rgba(212,168,83,0.12)" strokeWidth="0.5"/>
            <motion.circle cx="20" cy="67" r="1.5" fill="rgba(212,168,83,0.25)"
              animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.path d="M60,5 L62,11 L68,11 L63,15 L65,21 L60,17 L55,21 L57,15 L52,11 L58,11 Z"
              stroke="rgba(212,168,83,0.20)" strokeWidth="0.4" fill="none"
              animate={{ rotate:[0,360] }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
              style={{ transformOrigin:'60% 13%' }}/>
            <motion.path d="M0,35 Q25,28 50,35 Q75,42 100,35" stroke="rgba(212,168,83,0.08)" strokeWidth="0.4" fill="none"
              animate={{ opacity:[0.3,0.8,0.3] }} transition={{ duration:6, repeat:Infinity, ease:'easeInOut', delay:1 }}/>
            <motion.path d="M0,40 Q25,33 50,40 Q75,47 100,40" stroke="rgba(212,168,83,0.05)" strokeWidth="0.3" fill="none"
              animate={{ opacity:[0.2,0.6,0.2] }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut', delay:2 }}/>
          </svg>
        )}

        {/* ROMANTIC — floating hearts + pulsing circles */}
        {selectedId === 'romantic' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.path d="M45,12 C43,9 38,10 38,14 C38,18 45,22 45,22 C45,22 52,18 52,14 C52,10 47,9 45,12Z"
              stroke="rgba(212,123,142,0.20)" strokeWidth="0.4" fill="none"
              animate={{ y:[0,-3,0], opacity:[0.4,1,0.4] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.path d="M10,30 C20,10 40,10 30,30 C20,50 10,50 10,30Z" stroke="rgba(212,123,142,0.14)" strokeWidth="0.4" fill="none"
              animate={{ opacity:[0.3,0.7,0.3] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut', delay:1 }}/>
            <motion.circle cx="80" cy="20" r="8" stroke="rgba(212,123,142,0.12)" strokeWidth="0.4" fill="none" strokeDasharray="1 2"
              animate={{ scale:[1,1.15,1], opacity:[0.4,0.8,0.4] }} transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}
              style={{ transformOrigin:'80% 20%' }}/>
            <motion.path d="M5,55 Q30,40 55,55 Q80,70 95,55" stroke="rgba(212,123,142,0.10)" strokeWidth="0.4" fill="none"
              animate={{ opacity:[0.2,0.6,0.2] }} transition={{ duration:7, repeat:Infinity, ease:'easeInOut', delay:0.5 }}/>
          </svg>
        )}

        {/* FIGHTER — flashing crosshair */}
        {selectedId === 'fighter' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <line x1="0" y1="0" x2="40" y2="40" stroke="rgba(212,91,62,0.08)" strokeWidth="0.5"/>
            <line x1="100" y1="0" x2="60" y2="40" stroke="rgba(212,91,62,0.08)" strokeWidth="0.4"/>
            <motion.circle cx="50" cy="50" r="15" stroke="rgba(212,91,62,0.16)" strokeWidth="0.5" fill="none"
              animate={{ scale:[1,1.08,1], opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
              style={{ transformOrigin:'50% 50%' }}/>
            <motion.circle cx="50" cy="50" r="8" stroke="rgba(212,91,62,0.12)" strokeWidth="0.4" fill="none"
              animate={{ scale:[1,1.12,1] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut', delay:0.3 }}
              style={{ transformOrigin:'50% 50%' }}/>
            <motion.circle cx="50" cy="50" r="2.5" fill="rgba(212,91,62,0.30)"
              animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity, ease:'easeInOut' }}/>
            <line x1="35" y1="50" x2="42" y2="50" stroke="rgba(212,91,62,0.16)" strokeWidth="0.6"/>
            <line x1="58" y1="50" x2="65" y2="50" stroke="rgba(212,91,62,0.16)" strokeWidth="0.6"/>
            <line x1="50" y1="35" x2="50" y2="42" stroke="rgba(212,91,62,0.16)" strokeWidth="0.6"/>
            <line x1="50" y1="58" x2="50" y2="65" stroke="rgba(212,91,62,0.16)" strokeWidth="0.6"/>
          </svg>
        )}

        {/* CYBERPUNK — minimal: 3 hexagons + blinking dots */}
        {selectedId === 'scientist' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.polygon points="50,8 58,13 58,23 50,28 42,23 42,13"
              stroke="rgba(0,212,255,0.20)" strokeWidth="0.5" fill="none"
              animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}/>
            <polygon points="20,60 28,65 28,75 20,80 12,75 12,65" stroke="rgba(0,212,255,0.12)" strokeWidth="0.3" fill="none"/>
            <polygon points="80,30 88,35 88,45 80,50 72,45 72,35" stroke="rgba(0,212,255,0.10)" strokeWidth="0.3" fill="none"/>
            <line x1="50" y1="28" x2="50" y2="40" stroke="rgba(0,212,255,0.10)" strokeWidth="0.4"/>
            <line x1="50" y1="40" x2="72" y2="40" stroke="rgba(0,212,255,0.10)" strokeWidth="0.4"/>
            <motion.line x1="0" y1="90" x2="100" y2="90" stroke="rgba(0,255,200,0.14)" strokeWidth="1"
              animate={{ opacity:[0.3,0.8,0.3] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.circle cx="85" cy="15" r="2.5" fill="rgba(0,212,255,0.30)"
              animate={{ opacity:[0.2,1,0.2] }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.circle cx="15" cy="45" r="2" fill="rgba(0,255,200,0.25)"
              animate={{ opacity:[0.2,1,0.2] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut', delay:0.7 }}/>
          </svg>
        )}

        {/* DARK MAGE — rotating ritual circles */}
        {selectedId === 'dark_mage' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.circle cx="50" cy="50" r="32" stroke="rgba(139,92,212,0.14)" strokeWidth="0.4" fill="none" strokeDasharray="2 2"
              animate={{ rotate:360 }} transition={{ duration:25, repeat:Infinity, ease:'linear' }}
              style={{ transformOrigin:'50% 50%' }}/>
            <circle cx="50" cy="50" r="22" stroke="rgba(139,92,212,0.10)" strokeWidth="0.3" fill="none"/>
            <motion.circle cx="50" cy="50" r="10" stroke="rgba(139,92,212,0.18)" strokeWidth="0.4" fill="none" strokeDasharray="1 2"
              animate={{ rotate:-360 }} transition={{ duration:15, repeat:Infinity, ease:'linear' }}
              style={{ transformOrigin:'50% 50%' }}/>
            <motion.polygon points="50,20 74,58 26,58" stroke="rgba(139,92,212,0.16)" strokeWidth="0.4" fill="none"
              animate={{ opacity:[0.4,0.9,0.4] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.circle cx="50" cy="20" r="2" fill="rgba(139,92,212,0.35)"
              animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.circle cx="74" cy="58" r="2" fill="rgba(139,92,212,0.28)"
              animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut', delay:1 }}/>
            <motion.circle cx="26" cy="58" r="2" fill="rgba(139,92,212,0.28)"
              animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut', delay:2 }}/>
          </svg>
        )}

        {/* DETECTIVE — scanning magnifier */}
        {selectedId === 'detective' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.g animate={{ x:[0,3,0], y:[0,2,0] }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}>
              <circle cx="35" cy="35" r="16" stroke="rgba(201,168,76,0.16)" strokeWidth="0.5" fill="none"/>
              <circle cx="35" cy="35" r="10" stroke="rgba(201,168,76,0.12)" strokeWidth="0.3" fill="none"/>
              <line x1="46" y1="46" x2="58" y2="58" stroke="rgba(201,168,76,0.18)" strokeWidth="1.2"/>
            </motion.g>
            <motion.line x1="0" y1="68" x2="100" y2="68" stroke="rgba(201,168,76,0.08)" strokeWidth="0.3"
              animate={{ opacity:[0.2,0.6,0.2] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.circle cx="80" cy="80" r="8" stroke="rgba(201,168,76,0.12)" strokeWidth="0.3" fill="none" strokeDasharray="1.5 2"
              animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
              style={{ transformOrigin:'80% 80%' }}/>
          </svg>
        )}

        {/* HORROR — blinking eye + pulsing web */}
        {selectedId === 'horror' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.ellipse cx="50" cy="30" rx="25" ry="12" stroke="rgba(139,46,59,0.18)" strokeWidth="0.4" fill="none"
              animate={{ scaleY:[1,0.1,1], opacity:[0.5,1,0.5] }}
              transition={{ duration:5, repeat:Infinity, ease:'easeInOut', times:[0,0.5,1] }}
              style={{ transformOrigin:'50% 30%' }}/>
            <motion.circle cx="50" cy="30" r="4" fill="rgba(139,46,59,0.25)"
              animate={{ scale:[1,0.1,1] }}
              transition={{ duration:5, repeat:Infinity, ease:'easeInOut', times:[0,0.5,1] }}
              style={{ transformOrigin:'50% 30%' }}/>
            <motion.path d="M0,75 Q16,68 33,75 Q50,82 67,75 Q84,68 100,75" stroke="rgba(139,46,59,0.12)" strokeWidth="0.4" fill="none"
              animate={{ opacity:[0.2,0.6,0.2] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}/>
            <path d="M5,5 L20,25 M5,5 L25,10 M5,5 L15,30" stroke="rgba(139,46,59,0.08)" strokeWidth="0.3"/>
          </svg>
        )}

        {/* COMEDIAN — bouncing shapes */}
        {selectedId === 'comedian' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <motion.path d="M20,15 L23,20 L20,25 L17,20 Z" stroke="rgba(232,168,56,0.22)" strokeWidth="0.5" fill="none"
              animate={{ y:[0,-4,0], rotate:[0,15,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
              style={{ transformOrigin:'20% 20%' }}/>
            <motion.path d="M75,10 L78,15 L75,20 L72,15 Z" stroke="rgba(232,168,56,0.18)" strokeWidth="0.4" fill="none"
              animate={{ y:[0,-3,0], rotate:[0,-10,0] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut', delay:0.5 }}
              style={{ transformOrigin:'75% 15%' }}/>
            <motion.path d="M20,60 Q35,75 50,60 Q65,45 80,60" stroke="rgba(232,168,56,0.15)" strokeWidth="0.6" fill="none"
              animate={{ opacity:[0.4,0.9,0.4] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}/>
            <motion.circle cx="25" cy="58" r="2.5" fill="rgba(232,168,56,0.22)"
              animate={{ scale:[1,1.4,1] }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
              style={{ transformOrigin:'25% 58%' }}/>
            <motion.circle cx="75" cy="58" r="2.5" fill="rgba(232,168,56,0.22)"
              animate={{ scale:[1,1.4,1] }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut', delay:1 }}
              style={{ transformOrigin:'75% 58%' }}/>
            <motion.circle cx="50" cy="20" r="8" stroke="rgba(232,168,56,0.12)" strokeWidth="0.4" fill="none" strokeDasharray="2 1.5"
              animate={{ rotate:360 }} transition={{ duration:12, repeat:Infinity, ease:'linear' }}
              style={{ transformOrigin:'50% 20%' }}/>
          </svg>
        )}

      </div>
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

export default function SelectNarratorPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<PresetId>(defaultPreset.id);
  const [bgId, setBgId] = useState<PresetId>(defaultPreset.id); // debounced for background
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  // Controls the black fade-overlay opacity during background transitions
  const [bgFading, setBgFading] = useState(false);

  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { startNewGame, selectedSlotIndex } = useGameStore();
  const selectedPreset = presets.find(p => p.id === selectedId) || null;
  const accentColor = selectedPreset?.accentColor ?? '#A8B0BC';

  const bgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = useCallback((id: PresetId) => {
    if (id === selectedId) return;
    const ci = presets.findIndex(p => p.id === selectedId);
    const ni = presets.findIndex(p => p.id === id);
    setSlideDirection(ni > ci ? 'left' : 'right');
    setSelectedId(id);

    // Fade out → swap bg → fade in
    if (bgTimer.current) clearTimeout(bgTimer.current);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setBgFading(true);                            // start fade-out (250ms)
    bgTimer.current = setTimeout(() => {
      setBgId(id);                                // swap at peak darkness
      fadeTimer.current = setTimeout(() => setBgFading(false), 50); // then fade-in
    }, 250);
  }, [selectedId]);

  const handleContinue = () => {
    if (!selectedId || isContinuing) return;
    setIsContinuing(true);
    setTimeout(() => { startNewGame(selectedId, selectedSlotIndex ?? 1); router.push('/game'); }, 600);
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col"
      style={{
        background: BG_BASE[bgId] ?? '#0F0F14',
        transition: 'background 0.8s ease-in-out',
      }}
    >

      {/* Background — memoized, won't cause page re-render on unrelated state changes */}
      <AmbientBackground selectedId={bgId} />

      {/* Crossfade overlay — fades to black between background swaps */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundColor: '#000',
          opacity: bgFading ? 0.45 : 0,
          transition: bgFading ? 'opacity 0.25s ease-in' : 'opacity 0.4s ease-out',
        }}
      />

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
        <div className="flex flex-col items-center mt-16 mb-7">
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
