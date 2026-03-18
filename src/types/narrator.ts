export type PresetId =
  | 'neutral'
  | 'knight'
  | 'romantic'
  | 'fighter'
  | 'scientist'
  | 'dark_mage'
  | 'detective'
  | 'horror'
  | 'comedian';

export interface NarratorPreset {
  id: PresetId;
  name: string;
  subtitle: string;
  description: string;
  sampleText: string;
  avatarUrl: string;
  accentColor: string;
  backgroundMusicUrl?: string;
  tags: string[];
  isDefault: boolean;
  initialMessage: string;
}
