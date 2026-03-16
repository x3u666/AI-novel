'use client';

import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}

export function MenuButton({
  label,
  onClick,
  disabled = false,
  tooltip,
  className = '',
}: MenuButtonProps) {
  const buttonContent = (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-[300px] h-[52px] rounded-lg
        transition-all duration-300 ease-out
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
        }
        ${className}
      `}
      style={{
        background: disabled
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
      }}
      whileHover={
        disabled
          ? {}
          : {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(212, 175, 55, 0.4)',
            }
      }
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: disabled ? 0 : 1 }}
      />

      {/* Button text */}
      <span
        className={`
          relative z-10 font-medium text-base tracking-wide
          ${disabled ? 'text-white/40' : 'text-white/90'}
        `}
      >
        {label}
      </span>
    </motion.button>
  );

  if (tooltip && disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-black/80 border border-white/10 text-white/80 text-sm"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
