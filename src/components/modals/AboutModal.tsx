'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Keyboard, Heart } from 'lucide-react';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] bg-[#1a1a24] border-white/10 text-white max-h-[85vh] overflow-y-auto"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#d4af37]" />
            Об игре
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Project Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              О проекте
            </h3>
            <p className="text-white/80 leading-relaxed">
              «Хроники» — интерактивная визуальная новелла, где каждый ваш выбор влияет на
              развитие истории. Искусственный интеллект создаёт уникальное повествование,
              адаптируясь к вашим решениям и стилю игры.
            </p>
            <p className="text-white/80 leading-relaxed">
              Выберите рассказчика, который будет вести вас через историю, и отправляйтесь
              в путешествие, полное приключений, тайн и неожиданных поворотов.
            </p>
          </div>

          <Separator className="bg-white/10" />

          {/* How to Play */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Как играть
            </h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-1">•</span>
                <span>Читайте текст и делайте выбор, когда появляются варианты</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-1">•</span>
                <span>Каждое решение влияет на сюжет и отношения с персонажами</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-1">•</span>
                <span>Сохраняйте прогресс, чтобы вернуться к игре позже</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] mt-1">•</span>
                <span>Исследуйте разные пути, загружая сохранения</span>
              </li>
            </ul>
          </div>

          <Separator className="bg-white/10" />

          {/* Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Управление
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono text-xs">
                  Space
                </kbd>
                <span className="text-white/70">Продолжить</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono text-xs">
                  A
                </kbd>
                <span className="text-white/70">Автопрокрутка</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono text-xs">
                  S
                </kbd>
                <span className="text-white/70">Пропустить</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono text-xs">
                  Esc
                </kbd>
                <span className="text-white/70">Меню</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono text-xs">
                  1-4
                </kbd>
                <span className="text-white/70">Выбор</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono text-xs">
                  F
                </kbd>
                <span className="text-white/70">Полный экран</span>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Credits */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400" />
              Благодарности
            </h3>
            <div className="text-white/80 text-sm space-y-1">
              <p>
                <span className="text-white/50">Разработка:</span> Z.ai Team
              </p>
              <p>
                <span className="text-white/50">Дизайн:</span> Z.ai Team
              </p>
              <p>
                <span className="text-white/50">AI-движок:</span> Z.ai
              </p>
            </div>
            <p className="text-xs text-white/40 mt-4">
              Версия 0.1.0 • © 2024 Все права защищены
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
