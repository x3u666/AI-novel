'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-[#0a0a12]">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a1e] via-[#0d0d1a] to-[#1a0a12]" />

      {/* Animated blobs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-40"
        style={{
          background: 'radial-gradient(circle, #4a1a6b 0%, transparent 70%)',
          left: '10%',
          top: '20%',
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.5, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-35"
        style={{
          background: 'radial-gradient(circle, #1a3a6b 0%, transparent 70%)',
          right: '15%',
          top: '10%',
          transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 20}px)`,
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.35, 0.45, 0.35],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[550px] h-[550px] rounded-full blur-[110px] opacity-30"
        style={{
          background: 'radial-gradient(circle, #4a1a3a 0%, transparent 70%)',
          left: '30%',
          bottom: '10%',
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 35}px)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full blur-[90px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #2a1a4a 0%, transparent 70%)',
          right: '25%',
          bottom: '25%',
          transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -25}px)`,
        }}
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.4) 100%)
          `,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
