/**
 * Ending definitions for the visual novel
 * Three possible endings based on player choices throughout the game
 */

export type EndingType = 'good' | 'neutral' | 'bad';

export interface Ending {
  id: EndingType;
  title: string;
  subtitle: string;
  description: string;
  finalText: string[];
  backgroundColor: string;
  backgroundGradient: string;
  accentColor: string;
  emoji: string;
}

export const ENDINGS: Record<EndingType, Ending> = {
  good: {
    id: 'good',
    title: 'Свет в конце пути',
    subtitle: 'Вы нашли свой путь',
    description: 'Ты восстановил баланс мира и стал новым хранителем древней силы.',
    finalText: [
      'Стены крепости, ещё недавно объятые тьмой, вновь сияли в лучах рассвета. Знамёна, изорванные в битвах, были подняты заново — не как символ войны, но как свидетельство того, что свет не может угаснуть, пока есть те, кто готов за него стоять.',
      
      'Вы сделали выбор, который многие сочли бы безрассудным, — протянули руку вместо меча. И именно это решение изменило всё. Тот, кого вы не бросили в подземельях, оказался ключом к примирению — его слова разрушили проклятие древнее самих стен.',
      
      'Мир наступил. Не потому, что зло было уничтожено, а потому, что кто-то решил понять его. Ваш путь стал легендой — не о великих битвах, а о великом сострадании. Амулет на вашей груди светится ровным светом, указывая дорогу тем, кто заблудился во тьме.',
    ],
    backgroundColor: '#0a1a0a',
    backgroundGradient: 'linear-gradient(180deg, #0a1f1a 0%, #0a1a0a 30%, #1a2a1a 60%, #0a1a0a 100%)',
    accentColor: '#D4A853',
    emoji: '✦',
  },
  neutral: {
    id: 'neutral',
    title: 'Тень баланса',
    subtitle: 'Не всё потеряно. Не всё найдено.',
    description: 'Ты сохранил мир в безопасности, но ценой его развития.',
    finalText: [
      'Дорога уходила вдаль, и вы шли по ней один. Позади остались и победы, и потери — союзники разошлись своими путями, а крепость стояла — не разрушенная, но и не восстановленная.',
      
      'Вы сделали, что могли. Или не всё? Этот вопрос будет преследовать вас ещё долго — в тех тихих вечерах, когда ветер напоминает звук далёких битв, а тени ложатся так, что кажется: кто-то стоит за спиной.',
      
      'История не закончилась. Она просто перестала рассказывать себя вслух. Возможно, в другой раз — с другим выбором — она зазвучит иначе. Но сейчас вы — Страж Покоя, вечный часовой на границе света и тьмы.',
    ],
    backgroundColor: '#1a1a24',
    backgroundGradient: 'linear-gradient(180deg, #1a1a2a 0%, #1a1a24 30%, #2a2a3a 60%, #1a1a24 100%)',
    accentColor: '#A8B0BC',
    emoji: '◈',
  },
  bad: {
    id: 'bad',
    title: 'Цена выбора',
    subtitle: 'Каждое решение имело последствия',
    description: 'Ты освободил древнее зло и стал его вестником.',
    finalText: [
      'Пепел — вот всё, что осталось. Пепел и тишина.',
      
      'Крепость пала не от силы врага — она пала изнутри. Когда вы отвернулись от союзника в подземельях, вы потеряли не просто друга. Вы потеряли единственного, кто знал слово, снимающее проклятие. Когда подняли меч вместо того, чтобы протянуть руку, — вы получили победу в битве и проигрыш в войне.',
      
      'Теперь враг повержен, но и победитель стоит среди руин. Знамёна сгорели. Никто не поднимет их заново — некому поднимать и незачем. Каждый ваш шаг был выбором. И каждый выбор имел цену. Оглянитесь — и посчитайте, сколько заплачено.',
    ],
    backgroundColor: '#0a0a0e',
    backgroundGradient: 'linear-gradient(180deg, #1a0a0a 0%, #0a0a0e 30%, #0f0808 60%, #0a0a0e 100%)',
    accentColor: '#8B2E3B',
    emoji: '✧',
  },
};

/**
 * Get ending by ID
 */
export function getEnding(endingId: EndingType): Ending {
  return ENDINGS[endingId];
}

/**
 * Get all endings as array
 */
export function getAllEndings(): Ending[] {
  return Object.values(ENDINGS);
}

/**
 * Get ending title for display
 */
export function getEndingTitle(endingId: EndingType): string {
  return ENDINGS[endingId].title;
}
