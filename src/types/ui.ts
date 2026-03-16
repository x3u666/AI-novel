export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
export type Theme = 'dark' | 'light';
export type Language = 'ru' | 'en';

export interface SettingsConfig {
  textSize: TextSize;
  typingSpeed: number; // 20-100 ms per character
  autoPlaySpeed: number; // 1000-5000 ms between blocks
  musicVolume: number; // 0-100
  sfxVolume: number; // 0-100
  theme: Theme;
  language: Language;
}

export const DEFAULT_SETTINGS: SettingsConfig = {
  textSize: 'medium',
  typingSpeed: 50,
  autoPlaySpeed: 3000,
  musicVolume: 50,
  sfxVolume: 70,
  theme: 'dark',
  language: 'ru',
};

export type ModalType = 
  | 'none' 
  | 'settings' 
  | 'save' 
  | 'load' 
  | 'character' 
  | 'inventory'
  | 'map'
  | 'narrator-select'
  | 'confirm'
  | 'help'
  | 'credits';

export type TextSizeClass = {
  textSize: TextSize;
  proseClass: string;
  dialogueClass: string;
  choiceClass: string;
};

export const TEXT_SIZE_CONFIG: Record<TextSize, TextSizeClass> = {
  small: {
    textSize: 'small',
    proseClass: 'text-sm leading-relaxed',
    dialogueClass: 'text-sm',
    choiceClass: 'text-sm',
  },
  medium: {
    textSize: 'medium',
    proseClass: 'text-base leading-relaxed',
    dialogueClass: 'text-base',
    choiceClass: 'text-base',
  },
  large: {
    textSize: 'large',
    proseClass: 'text-lg leading-relaxed',
    dialogueClass: 'text-lg',
    choiceClass: 'text-lg',
  },
  xlarge: {
    textSize: 'xlarge',
    proseClass: 'text-xl leading-relaxed',
    dialogueClass: 'text-xl',
    choiceClass: 'text-xl',
  },
};
