'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Flying open book SVG path data
function FlyingBook({ x, y, scale, rotation, duration, delay, opacity }: {
  x: string; y: string; scale: number; rotation: number;
  duration: number; delay: number; opacity: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, opacity }}
      animate={{
        y: [0, -18, 8, -12, 0],
        x: [0, 10, -6, 8, 0],
        rotate: [rotation, rotation + 6, rotation - 4, rotation + 3, rotation],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width={64 * scale}
        height={48 * scale}
        viewBox="0 0 64 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 10px rgba(140,230,155,0.6)) drop-shadow(0 0 24px rgba(100,200,120,0.35))' }}
      >
        {/* Left page */}
        <path
          d="M32 8 Q18 4 4 10 L4 42 Q18 36 32 40 Z"
          fill="rgba(160,230,160,0.12)"
          stroke="rgba(180,245,180,0.55)"
          strokeWidth="0.9"
        />
        {/* Right page */}
        <path
          d="M32 8 Q46 4 60 10 L60 42 Q46 36 32 40 Z"
          fill="rgba(160,230,160,0.12)"
          stroke="rgba(180,245,180,0.55)"
          strokeWidth="0.9"
        />
        {/* Spine */}
        <line x1="32" y1="8" x2="32" y2="40" stroke="rgba(210,255,210,0.75)" strokeWidth="1.2" />
        {/* Left page lines */}
        <line x1="10" y1="18" x2="28" y2="15" stroke="rgba(180,240,180,0.40)" strokeWidth="0.7" />
        <line x1="10" y1="23" x2="28" y2="20" stroke="rgba(180,240,180,0.40)" strokeWidth="0.7" />
        <line x1="10" y1="28" x2="28" y2="26" stroke="rgba(180,240,180,0.32)" strokeWidth="0.7" />
        <line x1="10" y1="33" x2="28" y2="31" stroke="rgba(180,240,180,0.24)" strokeWidth="0.7" />
        {/* Right page lines */}
        <line x1="36" y1="15" x2="54" y2="18" stroke="rgba(180,240,180,0.40)" strokeWidth="0.7" />
        <line x1="36" y1="20" x2="54" y2="23" stroke="rgba(180,240,180,0.40)" strokeWidth="0.7" />
        <line x1="36" y1="26" x2="54" y2="28" stroke="rgba(180,240,180,0.32)" strokeWidth="0.7" />
        <line x1="36" y1="31" x2="54" y2="33" stroke="rgba(180,240,180,0.24)" strokeWidth="0.7" />
        {/* Page curl hint on right */}
        <path d="M56 38 Q60 36 60 42" stroke="rgba(200,255,200,0.45)" strokeWidth="0.8" fill="none" />
        {/* Soft inner glow on spine */}
        <line x1="32" y1="8" x2="32" y2="40" stroke="rgba(220,255,220,0.25)" strokeWidth="3" />
      </svg>
    </motion.div>
  );
}

const BOOKS = [
  { x: '6%',  y: '10%', scale: 1.7,  rotation: -12, duration: 9,  delay: 0,   opacity: 0.75 },
  { x: '70%', y: '6%',  scale: 1.3,  rotation: 15,  duration: 11, delay: 1.5, opacity: 0.65 },
  { x: '83%', y: '52%', scale: 1.9,  rotation: -8,  duration: 13, delay: 0.5, opacity: 0.70 },
  { x: '12%', y: '62%', scale: 1.45, rotation: 10,  duration: 10, delay: 3,   opacity: 0.60 },
  { x: '46%', y: '76%', scale: 1.15, rotation: -20, duration: 8,  delay: 2,   opacity: 0.55 },
  { x: '58%', y: '28%', scale: 1.55, rotation: 5,   duration: 14, delay: 4,   opacity: 0.62 },
];

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas: flowing wave lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawWave = (
      t: number,
      offsetY: number,
      amplitude: number,
      frequency: number,
      speed: number,
      alpha: number,
      color: string,
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.2;

      const points = 120;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * canvas.width;
        const y =
          offsetY +
          Math.sin((i / points) * Math.PI * 2 * frequency + t * speed) * amplitude +
          Math.sin((i / points) * Math.PI * frequency * 0.7 + t * speed * 1.3) * amplitude * 0.4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawSwirl = (t: number, cx: number, cy: number, maxR: number, alpha: number) => {
      const loops = 4;
      const steps = 200;
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(180, 230, 180, 0.6)';
      ctx.lineWidth = 0.8;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const angle = progress * Math.PI * 2 * loops + t * 0.15;
        const r = progress * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const animate = (timestamp: number) => {
      timeRef.current = timestamp * 0.001;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const h = canvas.height;
      const w = canvas.width;

      // Wave lines — layered, slow, organic
      const waveConfigs = [
        { offsetY: h * 0.18, amp: 55, freq: 1.6, speed: 0.18, alpha: 0.12, color: 'rgba(140,210,140,1)' },
        { offsetY: h * 0.30, amp: 70, freq: 1.2, speed: 0.13, alpha: 0.10, color: 'rgba(160,220,160,1)' },
        { offsetY: h * 0.42, amp: 80, freq: 0.9, speed: 0.10, alpha: 0.09, color: 'rgba(120,200,140,1)' },
        { offsetY: h * 0.55, amp: 65, freq: 1.4, speed: 0.16, alpha: 0.11, color: 'rgba(100,190,120,1)' },
        { offsetY: h * 0.67, amp: 75, freq: 1.1, speed: 0.12, alpha: 0.09, color: 'rgba(130,210,150,1)' },
        { offsetY: h * 0.78, amp: 60, freq: 1.5, speed: 0.20, alpha: 0.10, color: 'rgba(150,220,160,1)' },
        { offsetY: h * 0.88, amp: 50, freq: 1.8, speed: 0.22, alpha: 0.08, color: 'rgba(140,200,140,1)' },
      ];

      waveConfigs.forEach(({ offsetY, amp, freq, speed, alpha, color }) => {
        drawWave(t, offsetY, amp, freq, speed, alpha, color);
      });

      // Swirling spirals
      drawSwirl(t, w * 0.12, h * 0.30, 140, 0.06);
      drawSwirl(t + 2, w * 0.85, h * 0.65, 110, 0.05);
      drawSwirl(t + 4, w * 0.50, h * 0.85, 90, 0.04);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0d1f12' }}>

      {/* Base deep green gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 20% 30%, rgba(30, 80, 45, 0.85) 0%, transparent 60%),
            radial-gradient(ellipse 70% 60% at 80% 70%, rgba(20, 65, 40, 0.80) 0%, transparent 55%),
            radial-gradient(ellipse 60% 80% at 50% 10%, rgba(40, 100, 55, 0.50) 0%, transparent 50%),
            linear-gradient(160deg, #0a1e0e 0%, #122b18 35%, #0e2414 65%, #091a0d 100%)
          `,
        }}
      />

      {/* Mouse-reactive soft glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 55% 55% at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(80, 190, 100, 0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Animated blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 700, height: 700,
          left: '5%', top: '5%',
          background: 'radial-gradient(circle, rgba(60,160,80,0.18) 0%, transparent 65%)',
          filter: 'blur(80px)',
          x: mousePosition.x * -25,
          y: mousePosition.y * -25,
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          right: '5%', bottom: '15%',
          background: 'radial-gradient(circle, rgba(40,130,65,0.15) 0%, transparent 65%)',
          filter: 'blur(90px)',
          x: mousePosition.x * 20,
          y: mousePosition.y * 20,
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 450, height: 450,
          left: '40%', top: '50%',
          background: 'radial-gradient(circle, rgba(90,180,100,0.10) 0%, transparent 65%)',
          filter: 'blur(70px)',
          x: mousePosition.x * -15,
          y: mousePosition.y * 15,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Canvas: wave lines & spirals */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* SVG decorative elements — hand-like organic shapes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 4-pointed stars — like on the reference image */}
        <g filter="url(#glow-green)" opacity="0.55">
          {/* Star top-center */}
          <path
            d="M50,14 L51.2,17.5 L54.8,17.5 L51.9,19.7 L53,23.2 L50,21 L47,23.2 L48.1,19.7 L45.2,17.5 L48.8,17.5 Z"
            fill="none" stroke="rgba(180,240,180,0.7)" strokeWidth="0.25"
          />
          <path d="M50,14.5 L50,22.5 M47,18.5 L53,18.5" stroke="rgba(200,255,200,0.5)" strokeWidth="0.15" />

          {/* Star bottom-left */}
          <path
            d="M18,72 L18.9,74.6 L21.6,74.6 L19.4,76.2 L20.2,78.8 L18,77.2 L15.8,78.8 L16.6,76.2 L14.4,74.6 L17.1,74.6 Z"
            fill="none" stroke="rgba(160,230,160,0.5)" strokeWidth="0.2"
          />
          <path d="M18,72.4 L18,78.4 M15.2,75.4 L20.8,75.4" stroke="rgba(180,240,180,0.4)" strokeWidth="0.12" />

          {/* Star right */}
          <path
            d="M82,55 L83,57.3 L85.4,57.3 L83.5,58.7 L84.2,61 L82,59.6 L79.8,61 L80.5,58.7 L78.6,57.3 L81,57.3 Z"
            fill="none" stroke="rgba(150,220,160,0.45)" strokeWidth="0.18"
          />
          <path d="M82,55.4 L82,60.6 M79.4,58 L84.6,58" stroke="rgba(170,230,170,0.35)" strokeWidth="0.11" />
        </g>

        {/* Organic curved lines — like the flowing limbs in the reference */}
        <g opacity="0.14" stroke="rgba(160,230,160,1)" strokeWidth="0.35" fill="none" strokeLinecap="round">
          {/* Left flowing arm shape */}
          <path d="M-5,38 Q8,42 14,52 Q18,60 12,68 Q8,74 10,82" />
          <path d="M-5,42 Q9,46 15,56 Q19,63 13,71" />
          {/* Top right arm shape */}
          <path d="M88,5 Q82,18 76,28 Q68,40 72,52" />
          <path d="M92,8 Q86,20 80,30 Q72,42 76,54" />
          {/* Bottom center swirl tail */}
          <path d="M40,98 Q46,88 50,80 Q56,70 52,60 Q48,52 54,44" />
          <path d="M44,100 Q50,90 54,82 Q60,72 56,62" />
        </g>

        {/* Crescent/circular accents */}
        <g opacity="0.12" stroke="rgba(140,220,150,1)" strokeWidth="0.25" fill="none">
          <circle cx="50" cy="50" r="22" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="30" strokeDasharray="1.5 3" opacity="0.5" />
          <path d="M32,38 Q50,30 68,38" strokeWidth="0.3" />
          <path d="M30,62 Q50,72 70,62" strokeWidth="0.3" />
        </g>

        {/* Sparkle dots */}
        <g fill="rgba(200,255,200,0.4)">
          <circle cx="35" cy="25" r="0.4" />
          <circle cx="65" cy="18" r="0.3" />
          <circle cx="78" cy="40" r="0.35" />
          <circle cx="22" cy="58" r="0.3" />
          <circle cx="60" cy="80" r="0.4" />
          <circle cx="30" cy="85" r="0.25" />
          <circle cx="72" cy="72" r="0.3" />
        </g>
      </svg>

      {/* Top light bloom */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '25%', right: '25%',
          height: '45%',
          background: 'radial-gradient(ellipse, rgba(100,200,110,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 45%, rgba(5, 15, 8, 0.65) 100%),
            linear-gradient(to bottom, rgba(5,15,8,0.25) 0%, transparent 15%, transparent 80%, rgba(5,15,8,0.45) 100%)
          `,
        }}
      />

      {/* Flying open books */}
      {BOOKS.map((book, i) => (
        <FlyingBook key={i} {...book} />
      ))}

      {/* Fine noise grain */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
