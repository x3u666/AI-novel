import type { Character, Choice } from '@/types';

/**
 * Mock choice for the scene tree
 */
export interface MockChoice {
  id: string;
  text: string;
  nextSceneId: string;
  shortLabel: string;
  consequenceHint?: string;
}

/**
 * Mock scene for the narrative tree
 */
export interface MockScene {
  id: string;
  chapterNumber: number;
  chapterTitle?: string;
  narratorMessage: string;
  narrativeBlock: string;
  choices: MockChoice[];
  newCharacters?: Character[];
  worldFlagUpdates?: Record<string, unknown>;
  isTimed?: boolean;
  timeLimit?: number;
  isEnding?: boolean;
  endingType?: 'good' | 'neutral' | 'bad';
}

/**
 * Characters that can appear in the story
 */
export const STORY_CHARACTERS: Record<string, Character> = {
  elara: {
    id: 'char_elara',
    name: 'Элара',
    description: 'Мудрая волшебница, хранительница древних знаний. Её серебристые волосы и пронзительные голубые глаза выдают её долгую жизнь.',
    avatarUrl: '/characters/elara.png',
    traits: ['мудрая', 'добрая', 'загадочная'],
    relationships: {},
    isUnlocked: false,
  },
  thorin: {
    id: 'char_thorin',
    name: 'Торин',
    description: 'Отважный воин из северных земель. Его раны рассказывают историю множества битв, но сердце остаётся верным и благородным.',
    avatarUrl: '/characters/thorin.png',
    traits: ['храбрый', 'верный', 'прямолинейный'],
    relationships: {},
    isUnlocked: false,
  },
  raven: {
    id: 'char_raven',
    name: 'Ворон',
    description: 'Таинственный разведчик с тёмным прошлым. Никто не знает его настоящего имени, но его навыки неоспоримы.',
    avatarUrl: '/characters/raven.png',
    traits: ['скрытный', 'ловкий', 'циничный'],
    relationships: {},
    isUnlocked: false,
  },
  merchant: {
    id: 'char_merchant',
    name: 'Торговец Гриб',
    description: 'Странный маленький человечек, торгующий всякой всячиной в самых неожиданных местах.',
    avatarUrl: '/characters/merchant.png',
    traits: ['хитрый', 'болтливый', 'жадный'],
    relationships: {},
    isUnlocked: false,
  },
  spirit: {
    id: 'char_spirit',
    name: 'Древний Дух',
    description: 'Хранитель забытого храма, чей голос эхом разносится сквозь века.',
    avatarUrl: '/characters/spirit.png',
    traits: ['древний', 'мудрый', 'бесстрастный'],
    relationships: {},
    isUnlocked: false,
  },
};

/**
 * The complete mock scene tree for the demo story
 * Story structure:
 * - Prologue: Awakening in a mysterious forest
 * - Chapter 1: Meeting companions, choosing a path
 * - Chapter 2: Different paths based on choices
 * - Chapter 3: Confrontation and resolution
 * - Multiple endings based on accumulated choices
 */
export const MOCK_SCENES: Record<string, MockScene> = {
  // === PROLOGUE ===
  scene_intro: {
    id: 'scene_intro',
    chapterNumber: 0,
    chapterTitle: 'Пролог: Пробуждение',
    narratorMessage: 'Добро пожаловать в мир, где каждое решение имеет последствия...',
    narrativeBlock: `Ты открываешь глаза. Над головой — густые кроны древних деревьев, сквозь которые пробиваются редкие лучи солнца. Голова раскалывается, память — чистый лист.

Ты лежишь на мягком мху в центре небольшой поляны. Вокруг — тишина, нарушаемая лишь пением птиц и шелестом листьев. На груди ты обнаруживаешь странный амулет с мерцающим камнем.

⚠️ **ТЕСТОВЫЙ РЕЖИМ**: Выберите путь для просмотра концовки.

Вдали видны три тропы, каждая ведёт к своей судьбе...`,
    choices: [
      {
        id: 'choice_test_good',
        text: '🌟 Путь света (Хорошая концовка)',
        nextSceneId: 'scene_ending_good',
        shortLabel: 'Свет',
        consequenceHint: 'Восстановить баланс мира',
      },
      {
        id: 'choice_test_neutral',
        text: '⚖️ Путь равновесия (Нейтральная концовка)',
        nextSceneId: 'scene_ending_neutral',
        shortLabel: 'Равновесие',
        consequenceHint: 'Сохранить мир в безопасности',
      },
      {
        id: 'choice_test_bad',
        text: '🌑 Путь тьмы (Плохая концовка)',
        nextSceneId: 'scene_ending_bad',
        shortLabel: 'Тьма',
        consequenceHint: 'Освободить древнее зло',
      },
    ],
  },

  // === CHAPTER 1: RIVER PATH ===
  scene_river: {
    id: 'scene_river',
    chapterNumber: 1,
    chapterTitle: 'Глава 1: Река Судьбы',
    narratorMessage: 'Вода — источник жизни, но и хранительница тайн...',
    narrativeBlock: `Ты пробираешься сквозь кустарник и выходишь к быстрой реке. Вода кристально чистая, дно усыпано разноцветными камнями.

На другом берегу ты замечаешь фигуру в длинном плаще. Волшебница — это ясно по тому, как она парит над водой, не касаясь земли.

— Путник, — её голос звучит словно колокольчик. — Я чувствую в тебе силу. Этот амулет... он выбрал тебя.

Она протягивает руку, предлагая переправить тебя на другой берег. Но рядом ты замечаешь полузатопленную лодку — можно переправиться самостоятельно.`,
    choices: [
      {
        id: 'choice_river_trust',
        text: 'Принять помощь волшебницы',
        nextSceneId: 'scene_elara_meeting',
        shortLabel: 'Довериться',
        consequenceHint: 'Доверие — начало любого союза.',
      },
      {
        id: 'choice_river_independent',
        text: 'Использовать лодку',
        nextSceneId: 'scene_alone_path',
        shortLabel: 'Самостоятельно',
        consequenceHint: 'Самостоятельность учит, но и изолирует.',
      },
    ],
    worldFlagUpdates: { path: 'river', foundWater: true },
  },

  scene_elara_meeting: {
    id: 'scene_elara_meeting',
    chapterNumber: 1,
    narratorMessage: 'Новые союзники — это новые возможности...',
    narrativeBlock: `Волшебница улыбается и легко поднимает тебя в воздух. За мгновение ты оказываешься на другом берегу.

— Я Элара, хранительница древних знаний. Твой амулет — ключ к забытому храму на севере. Но дорога туда опасна, и тебе понадобятся союзники.

Она ведёт тебя к своей хижине на краю леса. Внутри — сотни свитков, волшебные артефакты и карта, на которой отмечено место под названием "Храм Забытых".

— Ты можешь отправиться туда со мной, или я укажу путь, и ты пойдёшь один. Выбор за тобой, но помни: храм охраняет древняя магия.`,
    choices: [
      {
        id: 'choice_elara_together',
        text: 'Попросить Элару сопровождать тебя',
        nextSceneId: 'scene_with_elara',
        shortLabel: 'Вместе',
        consequenceHint: 'Вместе вы сильнее, но её присутствие привлечёт внимание.',
      },
      {
        id: 'choice_elara_alone',
        text: 'Отправиться одному с картой',
        nextSceneId: 'scene_alone_path',
        shortLabel: 'Один',
        consequenceHint: 'Одиночка незаметен, но уязвим.',
      },
    ],
    newCharacters: [STORY_CHARACTERS.elara],
    worldFlagUpdates: { metElara: true },
  },

  // === CHAPTER 1: CAMP PATH ===
  scene_camp: {
    id: 'scene_camp',
    chapterNumber: 1,
    chapterTitle: 'Глава 1: Костёр в ночи',
    narratorMessage: 'Огонь согревает, но также выдаёт присутствие...',
    narrativeBlock: `Запах дыма становится сильнее. Через несколько минут ты выходишь на поляну, где горит небольшой костёр. У огня сидит массивный воин в потёртой броне, его меч лежит рядом.

Завидев тебя, он хватает оружие, но быстро расслабляется.

— Ещё один выживший? — он хмурится. — Я Торин из северных земель. Ищу своих соплеменников, пропавших в этих лесах.

Рядом с ним лежит карта с отметками. Он показывает на одну из них:

— Здесь была деревня. Можем пойти туда вместе, или каждый своим путём. Тебе какое дело?`,
    choices: [
      {
        id: 'choice_camp_join',
        text: 'Присоединиться к Торину',
        nextSceneId: 'scene_with_thorin',
        shortLabel: 'Присоединиться',
        consequenceHint: 'Воин — надёжная защита в опасных землях.',
      },
      {
        id: 'choice_camp_separate',
        text: 'Пойти своим путём',
        nextSceneId: 'scene_alone_path',
        shortLabel: 'Разойтись',
        consequenceHint: 'Каждый сам кузнец своей судьбы.',
      },
    ],
    newCharacters: [STORY_CHARACTERS.thorin],
    worldFlagUpdates: { metThorin: true, path: 'camp' },
  },

  // === CHAPTER 1: FOREST PATH ===
  scene_forest_deep: {
    id: 'scene_forest_deep',
    chapterNumber: 1,
    chapterTitle: 'Глава 1: Тени леса',
    narratorMessage: 'В темноте леса скрываются те, кто избегает света...',
    narrativeBlock: `Ты углубляешься в чащу. Света становится всё меньше, звуки — страннее. Внезапно за спиной раздаётся тихий голос:

— Заблудился, путник?

Ты оборачиваешься. На ветке дерева сидит фигура в чёрном плаще, лицо скрыто капюшоном. Ножи на поясе выдают его профессию.

— Я Ворон, — он спрыгивает на землю беззвучно. — Эти леса — мой дом. Могу провести тебя куда угодно... за определённую плату.

Он указывает на твой амулет.

— Или информацию. Мне нужно найти Храм Забытых. Говорят, ты туда направляешься.`,
    choices: [
      {
        id: 'choice_forest_deal',
        text: 'Заключить сделку с Вороном',
        nextSceneId: 'scene_with_raven',
        shortLabel: 'Сделка',
        consequenceHint: 'Разведчик знает тайные тропы, но можно ли ему доверять?',
      },
      {
        id: 'choice_forest_refuse',
        text: 'Отказаться и продолжить одному',
        nextSceneId: 'scene_alone_path',
        shortLabel: 'Отказ',
        consequenceHint: 'Некоторые пути лучше проходить в одиночку.',
      },
    ],
    newCharacters: [STORY_CHARACTERS.raven],
    worldFlagUpdates: { metRaven: true, path: 'forest' },
  },

  // === CHAPTER 2: WITH COMPANIONS ===
  scene_with_elara: {
    id: 'scene_with_elara',
    chapterNumber: 2,
    chapterTitle: 'Глава 2: Путь мудрости',
    narratorMessage: 'Знание — сила, но и ответственность...',
    narrativeBlock: `Вы с Эларой идёте на север. Дорога пролегает через древние руины и заброшенные деревни. Волшебница рассказывает историю этого мира:

— Давно здесь процветала империя. Но её правители возжелали бессмертия и открыли врата в другое измерение. То, что вышло оттуда, уничтожило всё за одну ночь.

На третий день пути вы встречаете торговца у перекрёстка дорог. Его повозка ломится от странных товаров.

— Почтенные! — кричит он. — У меня есть то, что вам нужно! Карты, зелья, даже кое-что из оружия!

Элара смотрит на тебя вопросительно.`,
    choices: [
      {
        id: 'choice_shop_buy',
        text: 'Осмотреть товары торговца',
        nextSceneId: 'scene_merchant',
        shortLabel: 'Торговаться',
        consequenceHint: 'Хороший торговец — ценный союзник.',
      },
      {
        id: 'choice_shop_ignore',
        text: 'Идти дальше без остановки',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'Не останавливаться',
        consequenceHint: 'Время — роскошь, которую нельзя терять.',
      },
    ],
    worldFlagUpdates: { companion: 'elara' },
  },

  scene_with_thorin: {
    id: 'scene_with_thorin',
    chapterNumber: 2,
    chapterTitle: 'Глава 2: Путь силы',
    narratorMessage: 'Меч не всегда решение, но защита не лишняя...',
    narrativeBlock: `Торин идёт впереди, прокладывая путь через заросли. Его сила впечатляет — он легко раздвигает кустарники и переносит поваленные деревья.

— Я был наёмником, — говорит он на привале. — Много лет. Но когда пришла чума и забрала мою семью, я поклялся защищать тех, кто не может защитить себя.

Он показывает шрам на руке.

— Это от демона, которого мы встретим в храме. Если пойдём туда. Твой выбор, командир.

К вечеру вы достигаете развилки. Одна дорога ведёт через горный перевал, другая — через болото.`,
    choices: [
      {
        id: 'choice_mountain',
        text: 'Идти через горы',
        nextSceneId: 'scene_mountain_pass',
        shortLabel: 'Горы',
        consequenceHint: 'Высота даёт обзор, но и опасности.',
      },
      {
        id: 'choice_swamp',
        text: 'Идти через болото',
        nextSceneId: 'scene_swamp',
        shortLabel: 'Болото',
        consequenceHint: 'Болота скрывают тайны... и трупы.',
      },
    ],
    worldFlagUpdates: { companion: 'thorin' },
  },

  scene_with_raven: {
    id: 'scene_with_raven',
    chapterNumber: 2,
    chapterTitle: 'Глава 2: Путь теней',
    narratorMessage: 'В тени прячутся те, кто не хочет быть найденным...',
    narrativeBlock: `Ворон ведёт тебя тайными тропами, невидимыми обычному глазу. Вы движетесь быстро и бесшумно.

— Я был убийцей, — признаётся он однажды ночью. — Но ушёл из гильдии, когда они приказали убить ребёнка. С тех пор я живу здесь, помогаю тем, кто заплутал.

На третий день вы находите пещеру. Внутри — древние фрески и странные символы.

— Это вход в храм, — шепчет Ворон. — Но он охраняется. Дух древнего стража не пропустит того, кто не прошёл испытание.

Он указывает на три символа на стене: глаз, меч и книга.`,
    choices: [
      {
        id: 'choice_symbol_eye',
        text: 'Выбрать символ глаза',
        nextSceneId: 'scene_trial_eye',
        shortLabel: 'Глаз',
        consequenceHint: 'Зрение — первый шаг к пониманию.',
      },
      {
        id: 'choice_symbol_sword',
        text: 'Выбрать символ меча',
        nextSceneId: 'scene_trial_sword',
        shortLabel: 'Меч',
        consequenceHint: 'Сила требует контроля.',
      },
      {
        id: 'choice_symbol_book',
        text: 'Выбрать символ книги',
        nextSceneId: 'scene_trial_book',
        shortLabel: 'Книга',
        consequenceHint: 'Знание — ключ ко многим дверям.',
      },
    ],
    worldFlagUpdates: { companion: 'raven' },
  },

  // === CHAPTER 2: ALONE PATH ===
  scene_alone_path: {
    id: 'scene_alone_path',
    chapterNumber: 2,
    chapterTitle: 'Глава 2: Путь одиночки',
    narratorMessage: 'В одиночку быстрее, но тяжелее...',
    narrativeBlock: `Ты идёшь один. Дни сливаются в один длинный путь через леса, поля и заброшенные дороги. Твой амулет время от времени светится, указывая направление.

На пятый день ты находишь деревню. Жители выглядят испуганными, двери заперты. Лишь один старик соглашается говорить:

— Ты идёшь к храму? — он качает головой. — Глупец. Там обитает древнее зло. Но... если решился, возьми это.

Он протягивает тебе потускневший серебряный ключ.

— Это откроет внутреннюю дверь. Но что ты найдёшь там — не знаю. Никто не возвращался.`,
    choices: [
      {
        id: 'choice_take_key',
        text: 'Взять ключ и благодарить',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'Взять ключ',
        consequenceHint: 'Ключ может пригодиться.',
      },
      {
        id: 'choice_ask_more',
        text: 'Расспросить старика подробнее',
        nextSceneId: 'scene_village_info',
        shortLabel: 'Расспросить',
        consequenceHint: 'Информация может спасти жизнь.',
      },
    ],
    worldFlagUpdates: { alone: true },
  },

  // === ENCOUNTERS ===
  scene_merchant: {
    id: 'scene_merchant',
    chapterNumber: 2,
    narratorMessage: 'Торговец знает больше, чем говорит...',
    narrativeBlock: `Торговец Гриб — так он представляется — выкладывает перед тобой свои товары.

— Для тебя, друг мой, особые цены! Зелье исцеления, карта тайных троп, и... — он понижает голос, — кое-что особенное. Камень правды. Показывает, говорит ли собеседник правду.

Элара внимательно смотрит на товары, но молчит. Её лицо непроницаемо.

— Также, — добавляет Гриб, — я знаю короткий путь к храму. Через пещеры. Опасно, но сэкономите два дня.`,
    choices: [
      {
        id: 'choice_buy_potion',
        text: 'Купить зелье и карту (золота нет, предложить обмен)',
        nextSceneId: 'scene_merchant_trade',
        shortLabel: 'Обмен',
        consequenceHint: 'Всё имеет цену.',
      },
      {
        id: 'choice_buy_path',
        text: 'Узнать о коротком пути',
        nextSceneId: 'scene_cave_path',
        shortLabel: 'Короткий путь',
        consequenceHint: 'Быстрота не всегда благо.',
      },
    ],
    newCharacters: [STORY_CHARACTERS.merchant],
  },

  scene_village_info: {
    id: 'scene_village_info',
    chapterNumber: 2,
    narratorMessage: 'История повторяется для тех, кто её не помнит...',
    narrativeBlock: `Старик приглашает тебя в дом и наливает травяной чай.

— Храм был построен тысячи лет назад, — начинает он. — Хранители создали его, чтобы заточить древнее зло. Но со временем люди забыли об опасности и начали искать там сокровища.

Он показывает пожелтевшую книгу с рисунками.

— Твой амулет — это ключ. Но не простой. Он открывает дверь только для того, кто готов принять ответственность. Хранитель храма — Древний Дух — будет судить тебя.

Старик замолкает.

— У тебя есть выбор: остановить зло навсегда, или освободить его. Зависит от того, что в твоём сердце.`,
    choices: [
      {
        id: 'choice_continue_informed',
        text: 'Продолжить путь, вооружённый знанием',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'Продолжить',
        consequenceHint: 'Предупреждён — значит вооружён.',
      },
    ],
    worldFlagUpdates: { hasKey: true, informed: true },
  },

  // === TRIAL SCENES ===
  scene_trial_eye: {
    id: 'scene_trial_eye',
    chapterNumber: 2,
    narratorMessage: 'Глаз видит правду, даже когда её не хотят показывать...',
    narrativeBlock: `Ты касаешься символа глаза. Стена начинает светиться, и перед тобой возникает видение: ты видишь себя со стороны, свои выборы, свои страхи и надежды.

Голос звучит из ниоткуда:

— Ты выбрал зрение. Теперь ты увидишь то, что скрыто. Но сможешь ли выдержать правду?

Видение исчезает. Ворон смотрит на тебя с удивлением.

— Ты прошёл... Но изменился. Твои глаза... они светятся.

Путь в храм открыт.`,
    choices: [
      {
        id: 'choice_enter_temple_seer',
        text: 'Войти в храм',
        nextSceneId: 'scene_temple_inner',
        shortLabel: 'Войти',
        consequenceHint: 'Внутри тебя ждёт последнее испытание.',
      },
    ],
    worldFlagUpdates: { trial: 'eye', hasSight: true },
  },

  scene_trial_sword: {
    id: 'scene_trial_sword',
    chapterNumber: 2,
    narratorMessage: 'Сила без контроля — разрушение...',
    narrativeBlock: `Ты касаешься символа меча. Мгновенно в твоих руках оказывается призрачный клинок, тяжёлый и холодный.

Голос звучит отовсюду:

— Ты выбрал силу. Но ты должен доказать, что умеешь её контролировать.

Перед тобой возникают три тени — три противника. Ты можешь атаковать, защищаться или уклоняться.

После долгого боя ты понимаешь: нужно не побеждать тени, а просто опустить меч. Когда ты это делаешь, тени исчезают.

— Ты прошёл. Сила в том, чтобы знать, когда её не использовать.

Путь в храм открыт.`,
    choices: [
      {
        id: 'choice_enter_temple_warrior',
        text: 'Войти в храм',
        nextSceneId: 'scene_temple_inner',
        shortLabel: 'Войти',
        consequenceHint: 'Мудрость приходит через битву с собой.',
      },
    ],
    worldFlagUpdates: { trial: 'sword', hasStrength: true },
  },

  scene_trial_book: {
    id: 'scene_trial_book',
    chapterNumber: 2,
    narratorMessage: 'Знание требует жажды познания...',
    narrativeBlock: `Ты касаешься символа книги. Перед тобой появляется древний фолиант, страницы которого покрыты незнакомыми письменами.

Голос звучит мягко:

— Ты выбрал знание. Теперь ты должен прочитать то, что не написано.

Ты открываешь книгу. Страницы пусты. Но по мере того как ты вглядываешься, начинают появляться слова — история мира, история храма, история древнего зла.

Ты читаешь всю ночь. К утру ты знаешь, как остановить зло — и какой ценой.

— Ты прошёл. Знание — твоя награда и твоя ноша.

Путь в храм открыт.`,
    choices: [
      {
        id: 'choice_enter_temple_scholar',
        text: 'Войти в храм',
        nextSceneId: 'scene_temple_inner',
        shortLabel: 'Войти',
        consequenceHint: 'Ты знаешь то, что не знают другие.',
      },
    ],
    worldFlagUpdates: { trial: 'book', hasKnowledge: true },
  },

  // === PATH VARIATIONS ===
  scene_mountain_pass: {
    id: 'scene_mountain_pass',
    chapterNumber: 2,
    narratorMessage: 'Высота открывает виды, но и опасности...',
    narrativeBlock: `Подъём в горы труден, но Торин силён и помогает тебе на сложных участках. На перевале вы находите древнюю обсерваторию.

Внутри — хрустальный шар, всё ещё светящийся слабым светом. Торин касается его:

— Я вижу... храм. И что-то внутри. Демона? Нет... человека? Невозможно разобрать.

Отсюда виден храм внизу, в долине. Путь ясен.`,
    choices: [
      {
        id: 'choice_descent',
        text: 'Спуститься к храму',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'Спуститься',
        consequenceHint: 'Цель близка.',
      },
    ],
    worldFlagUpdates: { mountainPath: true },
  },

  scene_swamp: {
    id: 'scene_swamp',
    chapterNumber: 2,
    narratorMessage: 'В болоте тропа может исчезнуть в любой момент...',
    narrativeBlock: `Болото оказывает коварным. Несколько раз ты едва не проваливаешься в трясину, но Торин каждый раз вытаскивает тебя.

На третий день вы находите в болоте затонувший храм — малую копию того, что ищете. Внутри — скелеты и древние монеты.

— Предыдущие искатели, — мрачно констатирует Торин. — Забудь о сокровищах. Мы здесь ради другой цели.

К вечеру вы выбираетесь на твёрдую землю. Храм виднеется впереди.`,
    choices: [
      {
        id: 'choice_approach_temple',
        text: 'Идти к храму',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'К храму',
        consequenceHint: 'Впереди финал.',
      },
    ],
    worldFlagUpdates: { swampPath: true },
  },

  scene_cave_path: {
    id: 'scene_cave_path',
    chapterNumber: 2,
    narratorMessage: 'Пещеры хранят древние секреты...',
    narrativeBlock: `Гриб показывает вход в пещеры. Элара следует за тобой, её магический свет освещает путь.

Пещеры полны кристаллов и странных грибов. В глубине вы слышите звук капающей воды и... голоса?

— Это эхо прошлого, — шепчет Элара. — Пещера помнит всех, кто здесь проходил.

Через несколько часов вы видите свет впереди. Выход ведёт прямо к храму.`,
    choices: [
      {
        id: 'choice_exit_cave',
        text: 'Выйти к храму',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'Выйти',
        consequenceHint: 'Короткий путь привёл тебя сюда.',
      },
    ],
    worldFlagUpdates: { cavePath: true },
  },

  scene_merchant_trade: {
    id: 'scene_merchant_trade',
    chapterNumber: 2,
    narratorMessage: 'Каждый обмен имеет свою ценность...',
    narrativeBlock: `— Золото? — Гриб смеётся. — Мне не нужно золото. Но твой амулет... Нет, нет, не отдавай его! Мне нужна лишь капля его силы.

Элара предостерегающе кладёт руку на твоё плечо.

— Это может ослабить амулет, — шепчет она.

Гриб замечает её жест:

— О, мудрая волшебница боится? Справедливо. Тогда другой обмен. Расскажи мне историю, которую я ещё не слышал. Историю своего путешествия. Каждая история уникальна.`,
    choices: [
      {
        id: 'choice_tell_story',
        text: 'Рассказать историю путешествия',
        nextSceneId: 'scene_temple_approach',
        shortLabel: 'Рассказать',
        consequenceHint: 'Истории имеют свою магию.',
      },
    ],
    worldFlagUpdates: { tradedWithMerchant: true },
  },

  // === CHAPTER 3: TEMPLE ===
  scene_temple_approach: {
    id: 'scene_temple_approach',
    chapterNumber: 3,
    chapterTitle: 'Глава 3: Храм Забытых',
    narratorMessage: 'Цель близка. Но что ты найдёшь внутри?',
    narrativeBlock: `Храм возвышается перед тобой — древнее сооружение из чёрного камня, покрытое странными письменами. Ворота закрыты, но твой амулет начинает светиться, и они медленно открываются.

Внутри — просторный зал с колоннами. В центре — пьедестал с мерцающим шаром. Рядом стоит фигура в балахоне — Древний Дух, хранитель этого места.

— Наконец-то, — его голос звучит как эхо. — Ты пришёл. Многие пытались, но ты первый за тысячу лет, кого амулет привёл сюда.

Он указывает на шар.

— В этом сосуде заточено древнее зло. Ты можешь уничтожить его навсегда... или освободить. Выбор за тобой.`,
    choices: [
      {
        id: 'choice_destroy_evil',
        text: 'Уничтожить зло',
        nextSceneId: 'scene_ending_good',
        shortLabel: 'Уничтожить',
        consequenceHint: 'Правильный выбор... или нет?',
      },
      {
        id: 'choice_free_evil',
        text: 'Освободить заточённое',
        nextSceneId: 'scene_ending_bad',
        shortLabel: 'Освободить',
        consequenceHint: 'Зло — это всего лишь слово?',
      },
      {
        id: 'choice_question_spirit',
        text: 'Расспросить духа',
        nextSceneId: 'scene_temple_inner',
        shortLabel: 'Спросить',
        consequenceHint: 'Мудрость в вопросах.',
      },
    ],
  },

  scene_temple_inner: {
    id: 'scene_temple_inner',
    chapterNumber: 3,
    narratorMessage: 'Истина открывается тем, кто ищет...',
    narrativeBlock: `Древний Дух приближается к тебе.

— Ты хочешь понять. Хорошо. Это не зло в чистом виде. Это... часть мира. Хаос, который существует, чтобы противостоять порядку. Без него мир застыл бы в вечном покое.

Он показывает видение: мир без конфликта, без движения, без жизни.

— Древние заточили хаос здесь, думая, что делают добро. Но без хаоса мир начал умирать. Ты можешь восстановить баланс — уничтожить тюрьму, но оставить часть хаоса в мире.

Амулет в твоих руках дрожит от энергии.`,
    choices: [
      {
        id: 'choice_balance',
        text: 'Восстановить баланс',
        nextSceneId: 'scene_ending_good',
        shortLabel: 'Баланс',
        consequenceHint: 'Гармония — высшая цель.',
      },
      {
        id: 'choice_complete_seal',
        text: 'Запечатать навсегда',
        nextSceneId: 'scene_ending_neutral',
        shortLabel: 'Запечатать',
        consequenceHint: 'Безопасность любой ценой.',
      },
      {
        id: 'choice_release_all',
        text: 'Освободить полностью',
        nextSceneId: 'scene_ending_bad',
        shortLabel: 'Освободить',
        consequenceHint: 'Свобода — не всегда благо.',
      },
    ],
    newCharacters: [STORY_CHARACTERS.spirit],
  },

  // === ENDINGS ===
  scene_ending_good: {
    id: 'scene_ending_good',
    chapterNumber: 3,
    chapterTitle: 'Конец: Хранитель Равновесия',
    narratorMessage: 'Истинная мудрость — в балансе...',
    narrativeBlock: `Ты поднимаешь амулет и направляешь его энергию на шар. Тот раскалывается, но вместо взрыва из него вырывается мягкий свет. Хаос и порядок смешиваются, формируя новую реальность.

Древний Дух склоняет голову:

— Ты сделал то, что не удавалось никому. Ты восстановил баланс. Мир снова будет дышать.

Перед твоим взором проносятся видения: земли, которые начинают цвести, люди, обретающие надежду. Но ты также видишь тени — хаос не исчез полностью. Он стал частью мира, как и должно быть.

— Ты теперь Хранитель Равновесия, — говорит Дух. — Твой путь только начинается.

Амулет на твоей груди светится ровным светом. За пределами храма тебя ждут те, кто помогал в пути. Впереди — новые приключения.

**КОНЕЦ: ДОБРАЯ КОНЦОВКА**

Ты восстановил баланс мира и стал новым хранителем древней силы.`,
    choices: [],
    isEnding: true,
    endingType: 'good',
    worldFlagUpdates: { ending: 'good' },
  },

  scene_ending_neutral: {
    id: 'scene_ending_neutral',
    chapterNumber: 3,
    chapterTitle: 'Конец: Страж Покоя',
    narratorMessage: 'Иногда безопасность — лучшее решение...',
    narrativeBlock: `Ты направляешь всю силу амулета на укрепление печати. Шар вспыхивает и становится твёрдым как камень. Хаос затихает.

Древний Дух качает головой:

— Ты выбрал безопасность. Это понятный выбор. Но мир будет медленно угасать без перемен.

Ты чувствуешь, как амулет теряет свою силу. Его миссия выполнена.

— Ты стал Стражем Покоя. Твоя задача — следить, чтобы печать не ослабла. Это долг на всю жизнь.

Видение показывает тебе: мир без войн, но и без развития. Статичный, безопасный, но мёртвый внутри.

За храмом тебя ждут спутники. Они не знают, что ты выбрал. И ты не скажешь им.

**КОНЕЦ: НЕЙТРАЛЬНАЯ КОНЦОВКА**

Ты сохранил мир в безопасности, но ценой его развития.`,
    choices: [],
    isEnding: true,
    endingType: 'neutral',
    worldFlagUpdates: { ending: 'neutral' },
  },

  scene_ending_bad: {
    id: 'scene_ending_bad',
    chapterNumber: 3,
    chapterTitle: 'Конец: Вестник Хаоса',
    narratorMessage: 'Некоторые двери лучше оставить закрытыми...',
    narrativeBlock: `Ты разбиваешь шар. Из него вырывается тьма, поглощая свет. Ты чувствуешь, как она проходит сквозь тебя — холодная, древняя, голодная.

Древний Дух исчезает, поглощённый тьмой. Его последние слова:

— Ты... хотел этого.

Хаос заполняет храм, затем выплёскивается наружу. Небо темнеет. Земля дрожит.

Твой амулет становится чёрным. Ты чувствуешь, как меняешься — часть хаоса теперь в тебе.

За пределами храма — крики и паника. Мир, который ты знал, заканчивается.

Но в глубине души ты понимаешь: это не конец. Это новое начало. Начало эры хаоса.

**КОНЕЦ: ПЛОХАЯ КОНЦОВКА**

Ты освободил древнее зло и стал его вестником.`,
    choices: [],
    isEnding: true,
    endingType: 'bad',
    worldFlagUpdates: { ending: 'bad' },
  },
};

/**
 * Get a scene by ID
 * @param sceneId - The scene ID
 * @returns The scene or undefined
 */
export function getScene(sceneId: string): MockScene | undefined {
  return MOCK_SCENES[sceneId];
}

/**
 * Get the starting scene
 * @returns The intro scene
 */
export function getStartingScene(): MockScene {
  return MOCK_SCENES.scene_intro;
}

/**
 * Check if a scene is an ending
 * @param sceneId - The scene ID
 * @returns True if it's an ending scene
 */
export function isEndingScene(sceneId: string): boolean {
  const scene = MOCK_SCENES[sceneId];
  return scene?.isEnding ?? false;
}

/**
 * Get ending type
 * @param sceneId - The scene ID
 * @returns The ending type or undefined
 */
export function getEndingType(sceneId: string): 'good' | 'neutral' | 'bad' | undefined {
  const scene = MOCK_SCENES[sceneId];
  return scene?.endingType;
}

/**
 * Convert mock choices to game choices
 * @param mockChoices - Array of mock choices
 * @returns Array of game choices
 */
export function convertToGameChoices(mockChoices: MockChoice[]): Omit<Choice, 'id' | 'isSelected'>[] {
  return mockChoices.map((mc) => ({
    text: mc.text,
    consequence: mc.consequenceHint,
  }));
}
