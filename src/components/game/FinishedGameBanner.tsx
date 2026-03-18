'use client';

import { motion } from 'framer-motion';

interface FinishedGameBannerProps {
  accentColor?: string;
}

export function FinishedGameBanner({ accentColor = '#d4af37' }: FinishedGameBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-shrink-0 mx-4 mb-4 rounded-xl border px-4 py-3 flex items-center gap-3"
      style={{
        backgroundColor: `${accentColor}08`,
        borderColor: `${accentColor}25`,
      }}
    >
      <span style={{ color: accentColor }} className="text-base leading-none flex-shrink-0">
        ✦
      </span>
      <div>
        <p className="text-sm font-medium" style={{ color: `${accentColor}cc` }}>
          История завершена
        </p>
        <p className="text-xs text-white/35 mt-0.5">
          Это просмотр пройденной игры
        </p>
      </div>
    </motion.div>
  );
}
