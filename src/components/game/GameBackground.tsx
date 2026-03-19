'use client';

import type { PresetId } from '@/types/narrator';

interface GameBackgroundProps {
  narratorId: PresetId;
  accentColor: string;
}

const BG_CONFIGS: Record<PresetId, { base: string; blobs: { x: string; y: string; color: string; size: number }[] }> = {
  neutral: {
    base: '#0e0f14',
    blobs: [
      { x: '15%', y: '20%', color: 'rgba(168,176,188,0.22)', size: 500 },
      { x: '80%', y: '75%', color: 'rgba(140,148,160,0.16)', size: 400 },
    ],
  },
  knight: {
    base: '#110e05',
    blobs: [
      { x: '20%', y: '25%', color: 'rgba(212,168,83,0.28)', size: 560 },
      { x: '75%', y: '70%', color: 'rgba(180,130,50,0.20)', size: 420 },
      { x: '50%', y: '50%', color: 'rgba(212,168,83,0.10)', size: 300 },
    ],
  },
  romantic: {
    base: '#130a0d',
    blobs: [
      { x: '25%', y: '20%', color: 'rgba(212,123,142,0.28)', size: 520 },
      { x: '72%', y: '72%', color: 'rgba(180,90,110,0.20)', size: 400 },
    ],
  },
  fighter: {
    base: '#130805',
    blobs: [
      { x: '80%', y: '20%', color: 'rgba(212,91,62,0.30)', size: 500 },
      { x: '15%', y: '75%', color: 'rgba(200,60,30,0.20)', size: 380 },
    ],
  },
  scientist: {
    base: '#00080f',
    blobs: [
      { x: '50%', y: '95%', color: 'rgba(0,150,255,0.35)', size: 800 },
      { x: '15%', y: '70%', color: 'rgba(0,100,220,0.22)', size: 500 },
      { x: '85%', y: '65%', color: 'rgba(0,200,255,0.18)', size: 450 },
      { x: '50%', y: '40%', color: 'rgba(0,80,180,0.16)', size: 400 },
      { x: '30%', y: '30%', color: 'rgba(0,120,255,0.10)', size: 350 },
      { x: '70%', y: '25%', color: 'rgba(100,0,255,0.08)', size: 300 },
    ],
  },
  dark_mage: {
    base: '#090613',
    blobs: [
      { x: '25%', y: '20%', color: 'rgba(139,92,212,0.28)', size: 520 },
      { x: '70%', y: '72%', color: 'rgba(100,60,180,0.20)', size: 400 },
    ],
  },
  detective: {
    base: '#0d0b05',
    blobs: [
      { x: '20%', y: '25%', color: 'rgba(201,168,76,0.22)', size: 480 },
      { x: '78%', y: '68%', color: 'rgba(160,130,50,0.16)', size: 360 },
    ],
  },
  horror: {
    base: '#0d0305',
    blobs: [
      { x: '50%', y: '15%', color: 'rgba(139,46,59,0.28)', size: 480 },
      { x: '20%', y: '70%', color: 'rgba(100,20,30,0.22)', size: 360 },
    ],
  },
  comedian: {
    base: '#120d04',
    blobs: [
      { x: '20%', y: '20%', color: 'rgba(232,168,56,0.24)', size: 500 },
      { x: '75%', y: '72%', color: 'rgba(200,140,30,0.18)', size: 380 },
    ],
  },
};

function PatternSVG({ id, accentColor }: { id: PresetId; accentColor: string }) {
  const a = (op: number) => {
    const hex = Math.round(op * 255).toString(16).padStart(2, '0');
    return `${accentColor}${hex}`;
  };

  switch (id) {
    case 'knight':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <path d="M50,5 L52,11 L58,11 L53,15 L55,21 L50,17 L45,21 L47,15 L42,11 L48,11 Z" stroke={a(0.45)} strokeWidth="1.5" fill="none"/>
          <path d="M0,55 Q25,47 50,55 Q75,63 100,55" stroke={a(0.30)} strokeWidth="2.0" fill="none"/>
          <path d="M0,65 Q25,57 50,65 Q75,73 100,65" stroke={a(0.22)} strokeWidth="1.0" fill="none"/>
          <path d="M0,75 Q25,67 50,75 Q75,83 100,75" stroke={a(0.18)} strokeWidth="1.5" fill="none"/>
        </svg>
      );
    case 'romantic':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <path d="M50,12 C46,8 38,9 38,16 C38,23 50,30 50,30 C50,30 62,23 62,16 C62,9 54,8 50,12Z" stroke={a(0.40)} strokeWidth="1.5" fill="none"/>
          <path d="M0,50 Q25,43 50,50 Q75,57 100,50" stroke={a(0.25)} strokeWidth="1.0" fill="none"/>
          <circle cx="15" cy="75" r="6" stroke={a(0.25)} strokeWidth="1.0" fill="none" strokeDasharray="1.5 1"/>
          <circle cx="85" cy="25" r="4" stroke={a(0.20)} strokeWidth="1.5" fill="none" strokeDasharray="1 1.5"/>
        </svg>
      );
    case 'fighter':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <line x1="0" y1="0" x2="100" y2="100" stroke={a(0.20)} strokeWidth="2.0"/>
          <line x1="100" y1="0" x2="0" y2="100" stroke={a(0.18)} strokeWidth="2.0"/>
          <path d="M0,50 L20,43 L50,50 L80,43 L100,50" stroke={a(0.35)} strokeWidth="1.4" fill="none"/>
          <path d="M0,60 L20,53 L50,60 L80,53 L100,60" stroke={a(0.22)} strokeWidth="2.0" fill="none"/>
        </svg>
      );
    case 'scientist':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="blur-city">
              <feGaussianBlur stdDeviation="0.6"/>
            </filter>
            <filter id="blur-soft">
              <feGaussianBlur stdDeviation="0.3"/>
            </filter>
            <filter id="neon-glow">
              <feGaussianBlur stdDeviation="0.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Размытый силуэт города на горизонте */}
          <g filter="url(#blur-city)" opacity="0.7">
            <path d="M0,75 L4,75 L4,65 L7,65 L7,60 L10,60 L10,55 L13,55 L13,60 L16,60 L16,68 L19,68 L19,62 L22,62 L22,57 L25,57 L25,50 L28,50 L28,45 L31,45 L31,50 L34,50 L34,57 L37,57 L37,63 L40,63 L40,58 L43,58 L43,52 L46,52 L46,47 L49,47 L49,43 L52,43 L52,47 L55,47 L55,52 L58,52 L58,58 L61,58 L61,63 L64,63 L64,57 L67,57 L67,51 L70,51 L70,57 L73,57 L73,62 L76,62 L76,56 L79,56 L79,50 L82,50 L82,56 L85,56 L85,62 L88,62 L88,67 L91,67 L91,72 L94,72 L94,75 L100,75 L100,100 L0,100 Z"
              fill="rgba(0,8,20,0.85)" stroke="rgba(0,150,255,0.25)" strokeWidth="0.3"/>
          </g>

          {/* Закатное солнце — размытое */}
          <g filter="url(#blur-soft)">
            <circle cx="50" cy="75" r="20" fill="rgba(0,100,255,0.12)" />
            <circle cx="50" cy="75" r="14" fill="rgba(0,150,255,0.10)" />
            <circle cx="50" cy="75" r="8"  fill="rgba(0,200,255,0.08)" />
          </g>

          {/* Лучи заката */}
          <line x1="0" y1="70" x2="100" y2="70" stroke="rgba(0,150,255,0.18)" strokeWidth="0.5"/>
          <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(0,130,255,0.13)" strokeWidth="0.4"/>
          <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(0,110,255,0.09)" strokeWidth="0.3"/>
          <line x1="0" y1="54" x2="100" y2="54" stroke="rgba(0,90,255,0.07)" strokeWidth="0.2"/>



          {/* Сканлайны */}
          {Array.from({length: 18}).map((_, i) => (
            <line key={i} x1="0" y1={i * 5.5} x2="100" y2={i * 5.5}
              stroke="rgba(0,0,0,0.12)" strokeWidth="0.8"/>
          ))}

          {/* Глитч-полосы */}
          <rect x="0" y="22" width="100" height="0.6" fill="rgba(0,100,255,0.08)"/>
          <rect x="0" y="37" width="60"  height="0.4" fill="rgba(0,200,255,0.07)"/>
          <rect x="40" y="15" width="100" height="0.4" fill="rgba(100,0,255,0.06)"/>

          {/* Дождь */}
          {[8,15,23,31,39,47,55,63,71,79,87,93].map((x, i) => (
            <line key={i} x1={x} y1={20 + (i % 4) * 5} x2={x - 1} y2={28 + (i % 4) * 5}
              stroke="rgba(0,150,255,0.15)" strokeWidth="0.3"/>
          ))}
        </svg>
      );
    case 'dark_mage':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <circle cx="50" cy="50" r="28" stroke={a(0.35)} strokeWidth="2.0" fill="none" strokeDasharray="2 1.5"/>
          <circle cx="50" cy="50" r="18" stroke={a(0.28)} strokeWidth="1.0" fill="none" strokeDasharray="1 2"/>
          <polygon points="50,18 72,55 28,55" stroke={a(0.40)} strokeWidth="2.0" fill="none"/>
          <circle cx="50" cy="50" r="3" stroke={a(0.55)} strokeWidth="2.0" fill="none"/>
        </svg>
      );
    case 'detective':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <line x1="0" y1="35" x2="100" y2="35" stroke={a(0.22)} strokeWidth="1.0"/>
          <line x1="0" y1="70" x2="100" y2="70" stroke={a(0.18)} strokeWidth="1.0"/>
          <circle cx="75" cy="20" r="12" stroke={a(0.40)} strokeWidth="2.0" fill="none"/>
          <line x1="82" y1="27" x2="90" y2="35" stroke={a(0.40)} strokeWidth="1.6"/>
          <circle cx="20" cy="80" r="7" stroke={a(0.25)} strokeWidth="1.0" fill="none"/>
        </svg>
      );
    case 'horror':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="50" cy="28" rx="22" ry="11" stroke={a(0.45)} strokeWidth="2.0" fill="none"/>
          <circle cx="50" cy="28" r="5" stroke={a(0.38)} strokeWidth="1.0" fill="none"/>
          <path d="M0,72 Q16,65 33,72 Q50,79 67,72 Q84,65 100,72" stroke={a(0.30)} strokeWidth="2.0" fill="none"/>
          <path d="M0,82 Q16,75 33,82 Q50,89 67,82 Q84,75 100,82" stroke={a(0.20)} strokeWidth="1.0" fill="none"/>
        </svg>
      );
    case 'comedian':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <path d="M20,15 L21.5,19.5 L26,19.5 L22.3,22.2 L23.7,26.7 L20,24 L16.3,26.7 L17.7,22.2 L14,19.5 L18.5,19.5 Z" stroke={a(0.45)} strokeWidth="1.0" fill="none"/>
          <path d="M80,70 L81.5,74.5 L86,74.5 L82.3,77.2 L83.7,81.7 L80,79 L76.3,81.7 L77.7,77.2 L74,74.5 L78.5,74.5 Z" stroke={a(0.35)} strokeWidth="1.0" fill="none"/>
          <path d="M0,50 Q25,42 50,50 Q75,58 100,50" stroke={a(0.30)} strokeWidth="2.0" fill="none"/>
          <circle cx="50" cy="20" r="8" stroke={a(0.25)} strokeWidth="1.0" fill="none" strokeDasharray="2 1.5"/>
        </svg>
      );
    default:
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <path d="M0,50 Q25,42 50,50 Q75,58 100,50" stroke={`${accentColor}20`} strokeWidth="1.0" fill="none"/>
          <path d="M0,60 Q25,52 50,60 Q75,68 100,60" stroke={`${accentColor}14`} strokeWidth="1.5" fill="none"/>
        </svg>
      );
  }
}

export function GameBackground({ narratorId, accentColor }: GameBackgroundProps) {
  const config = BG_CONFIGS[narratorId] ?? BG_CONFIGS.neutral;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, backgroundColor: config.base }}>

      {/* Blobs — blurred directly */}
      {config.blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `calc(${blob.x} - ${blob.size / 2}px)`,
            top: `calc(${blob.y} - ${blob.size / 2}px)`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
      ))}

      {/* SVG pattern */}
      <div className="absolute inset-0">
        <PatternSVG id={narratorId} accentColor={accentColor} />
      </div>

      {/* Dark overlay — makes content readable without hiding background */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.35) 100%)',
        }}
      />
    </div>
  );
}
