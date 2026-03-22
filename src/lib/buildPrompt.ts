import type { NarratorPreset } from '@/types/narrator';
import type { GameState } from '@/types/game';

const MAX_TURNS = 25;

export function getTurnCount(gameState: GameState): number {
  return gameState.chatHistory.filter((m) => m.role === 'narrator').length;
}

export function buildSystemPrompt(
  preset: NarratorPreset,
  gameState: GameState
): string {
  const turnCount = getTurnCount(gameState);
  const progress  = turnCount / MAX_TURNS;

  let stageInstruction: string;
  if (progress < 0.25) {
    stageInstruction = 'НАЧАЛО: Устанавливай мир и атмосферу, знакомь с персонажами, создавай интригу. Не торопись.';
  } else if (progress < 0.52) {
    stageInstruction = 'РАЗВИТИЕ: Наращивай конфликт, углубляй персонажей, усиливай ставки.';
  } else if (progress < 0.72) {
    const remaining = MAX_TURNS - turnCount;
    stageInstruction =
      `КУЛЬМИНАЦИЯ (осталось ~${remaining} ходов): Нарастай к пику. ` +
      'Начинай плавно сводить нити сюжета. Выборы должны ощущаться судьбоносными. ' +
      'Концовка уже близко — не вводи новых персонажей или линий.';
  } else {
    const remaining = MAX_TURNS - turnCount;
    stageInstruction =
      `РАЗВЯЗКА — осталось ~${remaining} ход(а). ` +
      'История ОБЯЗАНА завершиться естественно и органично. ' +
      'Напиши полноценный финал: подведи итог пути героя, закрой все открытые нити, ' +
      'создай ощущение завершённости — как последняя страница книги. ' +
      'ОБЯЗАТЕЛЬНО верни блок <ENDING> вместо <CHOICES>.';
  }

  const isFinalPhase = progress >= 0.72;

  const decisionSummary =
    gameState.decisions.length > 0
      ? gameState.decisions.slice(-10).map((d) => `  • ${d.choiceText}`).join('\n')
      : '  • Решений ещё не принято.';

  const charactersSummary =
    gameState.characters.length > 0
      ? gameState.characters.map((c) => `  • ${c.name}: ${c.description}`).join('\n')
      : '  • Персонажи ещё не введены.';

  const progressBar =
    '█'.repeat(Math.round(progress * 10)) +
    '░'.repeat(10 - Math.round(progress * 10));

  return `Ты — нарратор интерактивной визуальной новеллы.
Стиль: "${preset.name}" — ${preset.subtitle}.

━━━ ОПИСАНИЕ ТВОЕГО СТИЛЯ ━━━
${preset.description.slice(0, 500)}

ОБРАЗЕЦ ТЕКСТА В ТВОЁМ СТИЛЕ:
«${preset.sampleText}»

━━━ ПРОГРЕСС ИСТОРИИ ━━━
Ход: ${turnCount} / ${MAX_TURNS}  [${progressBar}] ${Math.round(progress * 100)}%
Глава: ${gameState.currentChapter}
Стадия: ${stageInstruction}

━━━ ПЕРСОНАЖИ ━━━
${charactersSummary}

━━━ РЕШЕНИЯ ИГРОКА (последние 10) ━━━
${decisionSummary}

━━━ ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ОТВЕТА ━━━
Строго используй XML-теги. Никакого текста вне тегов.

<NARRATIVE>
[Нарративный текст для левой панели: 2–4 абзаца. Описание сцены, событий, атмосферы, действий.]
</NARRATIVE>

<CHAT>
[Реплика рассказчика в чате: 1–2 предложения. Передаёт суть и ощущение момента.]
</CHAT>

${isFinalPhase
  ? `<ENDING>{"type": "good", "title": "Название концовки"}</ENDING>

Выбери тип на основе решений игрока:
  • "good"    — преобладали благородные решения → концовка "Хранитель Равновесия"
  • "neutral" — смешанные или осторожные решения → концовка "Страж Покоя"
  • "bad"     — эгоистичные или жестокие решения → концовка "Вестник Хаоса"

Придумай уникальное название в поле "title".
В финальной фазе НЕ добавляй блок <CHOICES>.`
  : `<CHOICES>
[
  {"id": "c1", "text": "Текст первого варианта действия", "consequence": "Краткий намёк на последствие"},
  {"id": "c2", "text": "Текст второго варианта действия", "consequence": "Краткий намёк на последствие"},
  {"id": "c3", "text": "Текст третьего варианта действия", "consequence": "Краткий намёк на последствие"}
]
</CHOICES>

Давай 2–4 варианта. Каждый должен реально влиять на дальнейший нарратив.`
}

━━━ ПРАВИЛА ━━━
1. Пиши ТОЛЬКО на русском языке.
2. Строго соблюдай стиль пресета «${preset.name}» на протяжении всей истории.
3. Новых персонажей вводи органично в блоке NARRATIVE.
4. Не противоречи предыдущим событиям истории.
5. JSON внутри <CHOICES> должен быть валидным (только двойные кавычки).
6. JSON внутри <ENDING> — строго {"type": "...", "title": "..."}.`;
}