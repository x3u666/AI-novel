/**
 * 🎵 КОНФИГ МУЗЫКИ — единственное место для смены треков
 *
 * Чтобы поменять музыку:
 *  1. Положи новый .mp3 файл в папку /public/music/
 *  2. Поменяй путь ниже у нужного нарратора
 *  3. Готово — больше ничего менять не нужно
 *
 * Форматы: .mp3 (универсально), .ogg (лучше сжатие)
 */

import type { PresetId } from '@/types/narrator';

// ─── Треки по нарраторам ──────────────────────────────────────────────────────
// Ключ = id нарратора из presets.ts
// Значение = путь к файлу в /public/

export const NARRATOR_MUSIC: Partial<Record<PresetId, string>> = {
  neutral:   '/music/neutral.mp3',    // нейтральный / дефолт
  knight:    '/music/knight.mp3',     // рыцарь — эпик, оркестр
  romantic:  '/music/romantic.mp3',   // романтик — нежное фортепиано
  fighter:   '/music/fighter.mp3',    // боец — агрессивный ритм
  scientist: '/music/cyberpunk.mp3',  // киберпанк — электронный синтвейв
  dark_mage: '/music/dark-mage.mp3',  // тёмный маг — мрачный оркестр
  detective: '/music/detective.mp3',  // детектив — джаз-нуар
  horror:    '/music/horror.mp3',     // хоррор — атмосферный ужас
  poet:      '/music/poet.mp3',       // поэт — акустика, тихо
  comedian:  '/music/comedian.mp3',   // комик — лёгкий джаз
};

// ─── Служебные треки (не привязаны к нарратору) ──────────────────────────────

export const MENU_MUSIC   = '/music/menu.mp3';         // главное меню
export const ENDING_MUSIC = '/music/ending.mp3';       // запасной трек концовки

// Треки по типу концовки
export const ENDING_MUSIC_BY_TYPE = {
  good:    '/music/ending_good.mp3',
  neutral: '/music/ending_neutral.mp3',
  bad:     '/music/ending_bad.mp3',
} as const;

// ─── Фоллбэк если у нарратора нет трека ──────────────────────────────────────

export const FALLBACK_MUSIC = MENU_MUSIC;
