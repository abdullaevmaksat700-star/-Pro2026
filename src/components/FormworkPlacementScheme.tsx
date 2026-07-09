import React, { useState } from 'react';
import { FormworkRequirement } from '../types';
import { 
  Info, 
  Layers, 
  Wrench, 
  HelpCircle, 
  ChevronRight, 
  Maximize2,
  ArrowRight,
  Eye
} from 'lucide-react';

interface FormworkPlacementSchemeProps {
  structureType: 'walls' | 'foundation_strip' | 'foundation_slab' | 'columns';
  dimensions: {
    length: number;
    height: number;
    thickness: number;
    columnCount: number;
    columnSide: number;
    internalCornersCount: number;
    externalCornersCount: number;
  };
  calculatedItems: FormworkRequirement[];
}

export default function FormworkPlacementScheme({ 
  structureType, 
  dimensions, 
  calculatedItems 
}: FormworkPlacementSchemeProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>('panels');
  const [viewMode, setViewMode] = useState<'scheme' | 'manual'>('scheme');

  // Названия элементов и инструкции по монтажу
  const elementGuides: Record<string, { title: string; desc: string; tip: string; color: string; bg: string; border: string }> = {
    panels: {
      title: 'Линейные щиты (Euroform)',
      desc: 'Стандартные палубные щиты высотой 1.2 м и различной ширины (600, 500, 400, 300 мм). Они устанавливаются вплотную друг к другу, образуя ровную плоскость.',
      tip: 'Монтаж всегда начинается от углов здания к центру стен. Широкие щиты (600 мм) используются для сборки основных пролетов. Доборные щиты (500, 400, 300 мм) служат для подгонки длины под проектный размер и ставятся ближе к середине пролета или компенсационным швам.',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30'
    },
    corners_in: {
      title: 'Внутренние угловые элементы',
      desc: 'Специальные угловые щиты (обычно 100х100 мм или 150х150 мм, высотой 1.2 м), предназначенные для жесткого сопряжения стен во внутренних углах под 90 градусов.',
      tip: 'Внутренний угол монтируется первым. Он жестко крепится к двум прилегающим линейным щитам с помощью клин-пинов. Обеспечивает герметичность угла и препятствует протечке цементного молочка.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30'
    },
    corners_out: {
      title: 'Внешние угловые элементы',
      desc: 'Стальные уголки, используемые для надежного скрепления внешних ребер опалубки стен, лент или квадратных колонн.',
      tip: 'Внешние уголки стягивают наружные щиты. Они воспринимают максимальное давление бетона в углах конструкции. Тщательно фиксируйте каждый замок клин-пином на угловом сопряжении.',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30'
    },
    ties: {
      title: 'Плоские стяжки (Flat Tie)',
      desc: 'Стальные одноразовые полосы, проходящие насквозь через стену и соединяющие параллельные ряды внутренней и внешней опалубки. Удерживают проектную толщину стены.',
      tip: 'Устанавливаются в технологические пазы на стыках щитов. Шаг установки — 600 мм по горизонтали и 300-600 мм по высоте. После заливки и застывания бетона выступающие концы стяжек отламываются специальным молотком.',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30'
    },
    hardware: {
      title: 'Клиновые замки Клин-Пин (Wedge & Pin)',
      desc: 'Высокопрочный быстроразъемный крепеж, состоящий из штыря (Pin) и клина (Wedge). Скрепляет щиты между собой и фиксирует плоские стяжки.',
      tip: 'Устанавливается во все совпадающие отверстия по боковому ребру щитов. Норма расхода — от 8 до 10 комплектов на один щит. Забивается обычным молотком. Плотно осаживайте клин для минимизации зазоров между щитами.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    },
    supports: {
      title: 'Опорные стойки / Телескопические подкосы',
      desc: 'Наклонные трубчатые стойки с винтовой регулировкой, предназначенные для выставления опалубки по отвесу и удержания от заваливания во время заливки.',
      tip: 'Устанавливаются с шагом 1.2–1.5 метра. Крепятся к щитам с одной или двух сторон через крючки выравнивающей трубы, а нижним концом жестко упираются в грунт через забитую арматуру или в бетонную подготовку.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    },
    pipes: {
      title: 'Выравнивающие трубы (Walers) и крючки',
      desc: 'Стальные трубы, проходящие горизонтально вдоль всей стены, прикрепленные к щитам с помощью специальных круглых крючков (Pipe Hooks).',
      tip: 'Трубы связывают отдельные щиты в единую жесткую стену, исключая волнообразность. Устанавливаются минимум в два ряда по высоте щита (на отметках 30 см и 90 см от низа).',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    }
  };

  const getActiveGuide = () => {
    const key = selectedElement || hoveredElement || 'panels';
    return elementGuides[key] || elementGuides.panels;
  };

  const guide = getActiveGuide();

  // Количество элементов из текущей калькуляции
  const getItemQty = (idPattern: string): number => {
    if (idPattern === 'panels') {
      return calculatedItems
        .filter(item => item.id.startsWith('euro_') && !item.id.includes('corner'))
        .reduce((sum, item) => sum + item.quantity, 0);
    }
    if (idPattern === 'corners_in') {
      return calculatedItems.find(item => item.id === 'euro_in_corner')?.quantity || 0;
    }
    if (idPattern === 'corners_out') {
      return calculatedItems.find(item => item.id === 'euro_out_corner')?.quantity || 0;
    }
    if (idPattern === 'ties') {
      return calculatedItems.find(item => item.id.startsWith('flat_tie'))?.quantity || 0;
    }
    if (idPattern === 'hardware') {
      return calculatedItems.find(item => item.id === 'wedge_pin')?.quantity || 0;
    }
    if (idPattern === 'supports') {
      return calculatedItems.find(item => item.id === 'support_post_3m')?.quantity || 0;
    }
    if (idPattern === 'pipes') {
      return calculatedItems.find(item => item.id === 'pipe_hook')?.quantity || 0;
    }
    return 0;
  };

  // Пошаговые инструкции в зависимости от типа
  const getAssemblySteps = () => {
    switch (structureType) {
      case 'walls':
      case 'foundation_strip':
        return [
          {
            title: 'Подготовка основания и разметка',
            text: 'Нанесите осевую разметку будущих стен краской или мелом на бетонную подготовку. Закрепите направляющие доски или уголки по периметру заливки для фиксации нижней кромки щитов.'
          },
          {
            title: 'Установка внутренних углов',
            text: `Начните сборку с внутренних углов (${getItemQty('corners_in')} шт.). Установите внутренний угловой щит на место сопряжения осей стен. Проверьте вертикальность по уровню.`
          },
          {
            title: 'Сборка внутренней плоскости щитов',
            text: 'От выставленного внутреннего угла начните навешивать линейные щиты (600 мм и доборы). Соединяйте их между собой клин-пинами (по 3-4 комплекта на вертикальный стык 1.2 м).'
          },
          {
            title: 'Монтаж плоских стяжек (Flat Tie)',
            text: `При сборке щитов вставляйте плоские стяжки (${getItemQty('ties')} шт.) в специальные пазы на стыках. Зафиксируйте стяжки со стороны щита клиньями.`
          },
          {
            title: 'Сборка внешней плоскости и углов',
            text: `Установите внешние углы (${getItemQty('corners_out')} шт.) и смонтируйте наружный ряд щитов напротив внутреннего. Свободные концы плоских стяжек пропустите через пазы наружных щитов и зажмите клиньями Клин-Пин.`
          },
          {
            title: 'Горизонтальное выравнивание трубами',
            text: `С помощью крючков для выравнивающих труб (${getItemQty('pipes')} шт.) закрепите стальные горизонтальные трубы по наружной стороне щитов. Это соберет щиты в единую жесткую линию.`
          },
          {
            title: 'Юстировка опорными стойками',
            text: `Установите регулируемые подкосы-опоры (${getItemQty('supports')} шт.) с шагом 1.2-1.5 м. Закрепите их верхнюю пятку за выравнивающую трубу, а опорную подошву жестко зафиксируйте в грунте. С помощью винтовой муфты выведите стену в идеальный вертикальный уровень.`
          }
        ];
      case 'foundation_slab':
        return [
          {
            title: 'Геодезическая разбивка периметра плиты',
            text: 'Вынесите точные габариты плиты в натуру. Подготовьте песчано-гравийную подушку, уложите гидроизоляцию и защитную мембрану.'
          },
          {
            title: 'Сборка углов опалубки торца',
            text: `Установите внешние углы (${getItemQty('corners_out')} шт.) в четырех крайних точках плиты. Они задают строгую прямоугольность будущей конструкции.`
          },
          {
            title: 'Набор линейных панелей по периметру',
            text: `От углов соберите периметр из линейных щитов (${getItemQty('panels')} шт.). Скрепляйте панели клин-пинами. Так как высота плиты обычно меньше 1.2 м, щиты можно уложить горизонтально (высотой 0.6 м) или вертикально с заглублением.`
          },
          {
            title: 'Установка горизонтальной обвязки трубами',
            text: `Проложите по периметру трубы жесткости и закрепите их крючками (${getItemQty('pipes')} шт.) к щитам. Это защитит опалубку от выгибания наружу под весом бетона.`
          },
          {
            title: 'Монтаж наклонных упоров в грунт',
            text: `Установите подкосы-стойки (${getItemQty('supports')} шт.) по всему периметру. Нижний башмак стойки упирается в надежно забитый колышек из арматуры или бруса в грунте. Отрегулируйте соосность.`
          }
        ];
      case 'columns':
        return [
          {
            title: 'Разметка осей колонны',
            text: `Нанесите точный контур сечения колонны (${dimensions.columnSide}x${dimensions.columnSide} мм) на плиту перекрытия или фундамент. Смонтируйте рамку-ограничитель из брусков вокруг арматурного каркаса.`
          },
          {
            title: 'Сборка коробки из 4 щитов',
            text: `Окружите арматурный каркас четырьмя щитами Euroform выбранной ширины (${dimensions.columnSide} мм). Каждый ряд по высоте собирается из щитов, соответствующих стороне колонны.`
          },
          {
            title: 'Установка вертикальных угловых элементов',
            text: `Охватите 4 стыка щитов внешними угловыми элементами (${getItemQty('corners_out')} шт. на всю высоту). Это придаст колонне идеальную форму ребер.`
          },
          {
            title: 'Жесткое заклинивание замков',
            text: `Установите клин-пины (${getItemQty('hardware')} шт.) во все монтажные отверстия уголков и щитов. Плотно осадите каждый клин молотком. Это важнейший этап — давление бетона в колоннах экстремально высокое!`
          },
          {
            title: 'Раскрепление подкосами по 4 осям',
            text: `Закрепите телескопические стойки-подкосы (${getItemQty('supports')} шт.) с четырех сторон колонны. Это исключит отклонение колонны по вертикали и защитит от динамических нагрузок при подаче бетона бетононасосом.`
          }
        ];
    }
  };

  const steps = getAssemblySteps();

  return (
    <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 shadow-xl relative overflow-hidden backdrop-blur-md" id="formwork-placement-scheme-container">
      <div className="bento-glow w-96 h-96 bg-orange-500/5 -bottom-20 -left-20"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-black text-orange-500 tracking-wider font-mono block">Интерактивный чертеж сборки</span>
          <h3 className="text-base sm:text-lg font-black text-white mt-1 font-display uppercase tracking-tight">
            Схема расстановки опалубки на проекте
          </h3>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 self-start sm:self-center">
          <button
            onClick={() => setViewMode('scheme')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'scheme'
                ? 'bg-orange-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Чертеж-схема
          </button>
          <button
            onClick={() => setViewMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'manual'
                ? 'bg-orange-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Руководство СНиП
          </button>
        </div>
      </div>

      {viewMode === 'scheme' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
          
          {/* Интерактивная SVG Схема */}
          <div className="xl:col-span-7 bg-slate-950/60 border border-slate-900 rounded-2.5xl p-4 flex flex-col items-center justify-center min-h-[340px] relative group overflow-hidden">
            <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              <Info className="w-3 h-3 text-orange-500" />
              <span>Наведите на легенду для подсветки</span>
            </div>

            {/* В зависимости от типа конструкции рендерим SVG */}
            {structureType === 'walls' || structureType === 'foundation_strip' ? (
              // Схема Стен / Ленты (Вид сверху на Т-образный или угловой узел стены)
              <svg viewBox="0 0 400 280" className="w-full max-w-[380px] h-auto drop-shadow-2xl">
                {/* Сетка разметки стен */}
                <path d="M 50 150 L 220 150 L 220 280" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                <text x="35" y="140" fill="#f97316" className="text-[9px] font-mono font-bold" opacity="0.5">Ось стены</text>
                
                {/* 1. Бетонное тело стены */}
                <path d="M 30 130 L 200 130 L 200 280 L 240 280 L 240 170 L 370 170 L 370 130 Z" fill="#1e293b" opacity="0.3" />
                
                {/* 2. Опалубка - Внутренний Угол (Indigo) */}
                <path 
                  d="M 200 170 L 200 200 L 170 200" 
                  fill="none" 
                  stroke="#818cf8" 
                  strokeWidth="8" 
                  strokeLinecap="square"
                  className={`transition-all duration-300 ${
                    selectedElement === 'corners_in' || hoveredElement === 'corners_in' 
                      ? 'stroke-indigo-400 stroke-[12px] filter drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]' 
                      : 'opacity-80'
                  }`}
                />
                
                {/* 3. Опалубка - Внешний Угол (Violet) */}
                <path 
                  d="M 240 130 L 240 100 L 270 100" 
                  fill="none" 
                  stroke="#a78bfa" 
                  strokeWidth="8" 
                  strokeLinecap="square"
                  className={`transition-all duration-300 ${
                    selectedElement === 'corners_out' || hoveredElement === 'corners_out' 
                      ? 'stroke-violet-400 stroke-[12px] filter drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]' 
                      : 'opacity-80'
                  }`}
                />

                {/* 4. Линейные щиты - Внутренняя сторона (Sky) */}
                {/* Левая часть внутренней стороны */}
                <line x1="50" y1="170" x2="200" y2="170" stroke="#38bdf8" strokeWidth="6" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' ? 'stroke-sky-300 stroke-[10px]' : 'opacity-80'
                  }`}
                />
                {/* Нижняя часть внутренней стороны */}
                <line x1="170" y1="200" x2="170" y2="260" stroke="#38bdf8" strokeWidth="6" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' ? 'stroke-sky-300 stroke-[10px]' : 'opacity-80'
                  }`}
                />

                {/* 5. Линейные щиты - Внешняя сторона (Sky) */}
                {/* Левая часть внешней стороны */}
                <line x1="50" y1="130" x2="240" y2="130" stroke="#38bdf8" strokeWidth="6" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' ? 'stroke-sky-300 stroke-[10px]' : 'opacity-80'
                  }`}
                />
                {/* Правая часть внешней стороны */}
                <line x1="240" y1="100" x2="350" y2="100" stroke="#38bdf8" strokeWidth="6" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' ? 'stroke-sky-300 stroke-[10px]' : 'opacity-80'
                  }`}
                />
                <line x1="270" y1="130" x2="350" y2="130" stroke="#38bdf8" strokeWidth="6" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' ? 'stroke-sky-300 stroke-[10px]' : 'opacity-80'
                  }`}
                />
                {/* Нижняя часть внешней стороны */}
                <line x1="240" y1="170" x2="240" y2="260" stroke="#38bdf8" strokeWidth="6" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' ? 'stroke-sky-300 stroke-[10px]' : 'opacity-80'
                  }`}
                />

                {/* Разделительные черточки щитов (имитируем стыки по 600мм) */}
                <g stroke="#030712" strokeWidth="1.5" opacity="0.6">
                  <line x1="110" y1="127" x2="110" y2="133" />
                  <line x1="170" y1="127" x2="170" y2="133" />
                  <line x1="110" y1="167" x2="110" y2="173" />
                  
                  <line x1="170" y1="230" x2="173" y2="230" />
                  <line x1="240" y1="210" x2="243" y2="210" />
                </g>

                {/* 6. Плоские Стяжки Flat Tie (Orange) */}
                <g stroke="#fb923c" strokeWidth="2.5" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'ties' || hoveredElement === 'ties' 
                      ? 'stroke-orange-400 stroke-[4px] filter drop-shadow-[0_0_4px_rgba(251,146,60,0.8)]' 
                      : 'opacity-90'
                  }`}
                >
                  <line x1="80" y1="130" x2="80" y2="170" />
                  <line x1="140" y1="130" x2="140" y2="170" />
                  
                  <line x1="170" y1="230" x2="240" y2="230" />
                </g>

                {/* Клин-Пины / Wedge Pin (Amber) */}
                <g fill="#fbbf24" stroke="#000" strokeWidth="0.5"
                  className={`transition-all duration-300 ${
                    selectedElement === 'hardware' || hoveredElement === 'hardware' 
                      ? 'fill-amber-300 scale-125 transform origin-center filter drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]' 
                      : 'opacity-90'
                  }`}
                >
                  {/* Замки на стыках щитов */}
                  <circle cx="110" cy="130" r="3" />
                  <circle cx="170" cy="130" r="3" />
                  <circle cx="110" cy="170" r="3" />
                  
                  {/* Замки на стяжках */}
                  <polygon points="78,126 82,126 80,132" />
                  <polygon points="78,174 82,174 80,168" />
                  <polygon points="138,126 142,126 140,132" />
                  <polygon points="138,174 142,174 140,168" />
                </g>

                {/* 7. Выравнивающие трубы и крючки Walers (Rose) */}
                <g stroke="#fda4af" strokeWidth="2" strokeDasharray="none"
                  className={`transition-all duration-300 ${
                    selectedElement === 'pipes' || hoveredElement === 'pipes' 
                      ? 'stroke-rose-400 stroke-[3.5px] filter drop-shadow-[0_0_4px_rgba(253,164,175,0.8)]' 
                      : 'opacity-60'
                  }`}
                >
                  {/* Трубы прокладываются параллельно */}
                  <line x1="45" y1="123" x2="245" y2="123" />
                  <line x1="45" y1="177" x2="195" y2="177" />
                  
                  {/* Крючки (маленькие дуги) */}
                  <circle cx="100" cy="123" r="2.5" fill="none" stroke="#f43f5e" strokeWidth="2" />
                  <circle cx="180" cy="123" r="2.5" fill="none" stroke="#f43f5e" strokeWidth="2" />
                  <circle cx="100" cy="177" r="2.5" fill="none" stroke="#f43f5e" strokeWidth="2" />
                </g>

                {/* 8. Телескопические Подкосы-Опоры (Emerald) */}
                <g stroke="#34d399" strokeWidth="3" strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    selectedElement === 'supports' || hoveredElement === 'supports' 
                      ? 'stroke-emerald-400 stroke-[5px] filter drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]' 
                      : 'opacity-80'
                  }`}
                >
                  {/* Опоры крепятся к трубам и уходят в землю под углом */}
                  <line x1="120" y1="121" x2="120" y2="60" />
                  <line x1="170" y1="179" x2="110" y2="239" />
                  
                  {/* Пяты опор */}
                  <circle cx="120" cy="60" r="4" fill="#10b981" stroke="#000" strokeWidth="0.5" />
                  <circle cx="110" cy="239" r="4" fill="#10b981" stroke="#000" strokeWidth="0.5" />
                </g>
                
                {/* Подписи */}
                <text x="310" y="270" fill="#94a3b8" className="text-[9px] font-sans font-bold uppercase tracking-wider" opacity="0.6">Вид сверху (угол)</text>
              </svg>
            ) : structureType === 'foundation_slab' ? (
              // Схема Плитного Фундамента (Вид в разрезе с упором в грунт)
              <svg viewBox="0 0 400 280" className="w-full max-w-[380px] h-auto drop-shadow-2xl">
                {/* Грунт основания */}
                <rect x="10" y="180" width="380" height="90" fill="#1e293b" opacity="0.2" />
                <line x1="10" y1="180" x2="390" y2="180" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                
                {/* Заливаемая бетонная плита */}
                <rect x="180" y="100" width="210" height="80" fill="#334155" opacity="0.4" />
                <text x="250" y="145" fill="#f97316" className="text-[11px] font-bold uppercase tracking-wider opacity-60">Бетонная плита</text>

                {/* Линейный щит торцевой опалубки (Sky) */}
                <rect 
                  x="174" 
                  y="80" 
                  width="6" 
                  height="100" 
                  fill="#38bdf8" 
                  rx="1"
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' 
                      ? 'fill-sky-300 filter drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]' 
                      : 'opacity-90'
                  }`}
                />
                <text x="115" y="115" fill="#38bdf8" className="text-[9px] font-bold uppercase tracking-wider">Щит Euroform</text>

                {/* Выравнивающие трубы жесткости (Rose) */}
                <g stroke="#fda4af" strokeWidth="2"
                  className={`transition-all duration-300 ${
                    selectedElement === 'pipes' || hoveredElement === 'pipes' 
                      ? 'stroke-rose-400 stroke-[3px] filter drop-shadow-[0_0_4px_rgba(253,164,175,0.8)]' 
                      : 'opacity-80'
                  }`}
                >
                  <circle cx="166" cy="105" r="5" fill="#f43f5e" />
                  <circle cx="166" cy="155" r="5" fill="#f43f5e" />
                </g>
                <text x="90" y="158" fill="#fda4af" className="text-[9px] font-bold uppercase tracking-wider">Труба жесткости</text>

                {/* Наклонный Телескопический Подкос / Стойка (Emerald) */}
                <g stroke="#34d399" strokeWidth="4.5" strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    selectedElement === 'supports' || hoveredElement === 'supports' 
                      ? 'stroke-emerald-400 stroke-[6.5px] filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                      : 'opacity-90'
                  }`}
                >
                  {/* Верхнее крепление к щиту и упор в грунт */}
                  <line x1="166" y1="105" x2="60" y2="180" />
                  {/* Горизонтальная распорка в основание */}
                  <line x1="174" y1="175" x2="60" y2="180" />
                </g>
                <text x="40" y="210" fill="#34d399" className="text-[9px] font-bold uppercase tracking-wider">Подкос-Опора</text>

                {/* Забитый колышек из арматуры для фиксации опоры */}
                <line x1="60" y1="165" x2="60" y2="205" stroke="#fbbf24" strokeWidth="4" />
                <circle cx="60" cy="180" r="3" fill="#d97706" />

                {/* Внешний уголок на торце (Violet) */}
                <rect 
                  x="174" 
                  y="76" 
                  width="10" 
                  height="4" 
                  fill="#a78bfa"
                  className={`transition-all duration-300 ${
                    selectedElement === 'corners_out' || hoveredElement === 'corners_out' 
                      ? 'fill-violet-300 filter drop-shadow-[0_0_4px_rgba(167,139,250,0.8)]' 
                      : 'opacity-70'
                  }`}
                />

                <text x="310" y="270" fill="#94a3b8" className="text-[9px] font-sans font-bold uppercase tracking-wider" opacity="0.6">Поперечный разрез</text>
              </svg>
            ) : (
              // Схема Сборки Колонны (Изометрический 3D-вид)
              <svg viewBox="0 0 400 280" className="w-full max-w-[340px] h-auto drop-shadow-2xl">
                {/* Плита основания */}
                <polygon points="50,220 200,260 350,220 200,190" fill="#1e293b" opacity="0.4" stroke="#475569" strokeWidth="1" />
                
                {/* Тело арматуры (внутреннее) */}
                <line x1="195" y1="40" x2="195" y2="225" stroke="#64748b" strokeWidth="2" opacity="0.3" />
                <line x1="205" y1="40" x2="205" y2="225" stroke="#64748b" strokeWidth="2" opacity="0.3" />

                {/* Щиты колонны (Sky) - левая грань коробки */}
                <polygon 
                  points="160,80 200,95 200,225 160,210" 
                  fill="#0284c7" 
                  stroke="#0369a1" 
                  strokeWidth="1"
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' 
                      ? 'fill-sky-400 stroke-sky-300' 
                      : 'opacity-85'
                  }`}
                />
                
                {/* Щиты колонны (Sky) - правая грань коробки */}
                <polygon 
                  points="200,95 240,80 240,210 200,225" 
                  fill="#0369a1" 
                  stroke="#075985" 
                  strokeWidth="1"
                  className={`transition-all duration-300 ${
                    selectedElement === 'panels' || hoveredElement === 'panels' 
                      ? 'fill-sky-400 stroke-sky-300' 
                      : 'opacity-85'
                  }`}
                />

                {/* Внешние угловые элементы (Violet) - центральное ребро */}
                <line 
                  x1="200" y1="95" x2="200" y2="225" 
                  stroke="#a78bfa" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    selectedElement === 'corners_out' || hoveredElement === 'corners_out' 
                      ? 'stroke-violet-400 stroke-[8px] filter drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]' 
                      : 'opacity-90'
                  }`}
                />
                {/* Внешние уголки - левое ребро */}
                <line 
                  x1="160" y1="80" x2="160" y2="210" 
                  stroke="#a78bfa" 
                  strokeWidth="3.5" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'corners_out' || hoveredElement === 'corners_out' 
                      ? 'stroke-violet-400 stroke-[6px]' 
                      : 'opacity-70'
                  }`}
                />
                {/* Внешние уголки - правое ребро */}
                <line 
                  x1="240" y1="80" x2="240" y2="210" 
                  stroke="#a78bfa" 
                  strokeWidth="3.5" 
                  className={`transition-all duration-300 ${
                    selectedElement === 'corners_out' || hoveredElement === 'corners_out' 
                      ? 'stroke-violet-400 stroke-[6px]' 
                      : 'opacity-70'
                  }`}
                />

                {/* Ряды по высоте (швы на высоте 1.2м) */}
                <polygon points="160,145 200,160 240,145" fill="none" stroke="#0f172a" strokeWidth="2" opacity="0.7" />

                {/* Клин-Пины по вертикальному шву (Amber) */}
                <g fill="#fbbf24" stroke="#000" strokeWidth="0.4"
                  className={`transition-all duration-300 ${
                    selectedElement === 'hardware' || hoveredElement === 'hardware' 
                      ? 'fill-amber-300 scale-125 transform origin-center filter drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]' 
                      : 'opacity-95'
                  }`}
                >
                  <circle cx="200" cy="110" r="2.5" />
                  <circle cx="200" cy="130" r="2.5" />
                  <circle cx="200" cy="150" r="2.5" />
                  <circle cx="200" cy="175" r="2.5" />
                  <circle cx="200" cy="195" r="2.5" />
                  <circle cx="200" cy="215" r="2.5" />
                </g>

                {/* Опорные стойки-подкосы с 2-х сторон видимости (Emerald) */}
                <g stroke="#34d399" strokeWidth="3.5" strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    selectedElement === 'supports' || hoveredElement === 'supports' 
                      ? 'stroke-emerald-400 stroke-[5.5px] filter drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]' 
                      : 'opacity-80'
                  }`}
                >
                  {/* Подкос левый */}
                  <line x1="180" y1="130" x2="90" y2="225" />
                  {/* Подкос правый */}
                  <line x1="220" y1="130" x2="310" y2="225" />
                </g>

                {/* Крепления башмаков опор */}
                <circle cx="90" cy="225" r="3" fill="#10b981" />
                <circle cx="310" cy="225" r="3" fill="#10b981" />

                <text x="310" y="270" fill="#94a3b8" className="text-[9px] font-sans font-bold uppercase tracking-wider" opacity="0.6">Колонна в 3D</text>
              </svg>
            )}
          </div>

          {/* Легенда элементов и руководство */}
          <div className="xl:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Интерактивная легенда</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onMouseEnter={() => setHoveredElement('panels')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => setSelectedElement('panels')}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedElement === 'panels'
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sky-500 rounded-xs"></div>
                    <span className="text-xs font-bold">Линейные щиты Euroform</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-sky-300">
                    {getItemQty('panels')} шт.
                  </span>
                </button>

                {structureType !== 'columns' && structureType !== 'foundation_slab' && (
                  <button
                    onMouseEnter={() => setHoveredElement('corners_in')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => setSelectedElement('corners_in')}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedElement === 'corners_in'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400'
                        : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-xs"></div>
                      <span className="text-xs font-bold">Внутренние углы 1.2м</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-indigo-300">
                      {getItemQty('corners_in')} шт.
                    </span>
                  </button>
                )}

                {structureType !== 'foundation_slab' && (
                  <button
                    onMouseEnter={() => setHoveredElement('corners_out')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => setSelectedElement('corners_out')}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedElement === 'corners_out'
                        ? 'bg-violet-500/10 border-violet-500/40 text-violet-400'
                        : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-violet-500 rounded-xs"></div>
                      <span className="text-xs font-bold">Внешние углы (крепёж)</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-violet-300">
                      {getItemQty('corners_out')} шт.
                    </span>
                  </button>
                )}

                {structureType !== 'columns' && structureType !== 'foundation_slab' && (
                  <button
                    onMouseEnter={() => setHoveredElement('ties')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => setSelectedElement('ties')}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedElement === 'ties'
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                        : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-1.5 bg-orange-500 rounded-xs"></div>
                      <span className="text-xs font-bold">Стяжки Flat Tie ({dimensions.thickness}мм)</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-orange-300">
                      {getItemQty('ties')} шт.
                    </span>
                  </button>
                )}

                <button
                  onMouseEnter={() => setHoveredElement('hardware')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => setSelectedElement('hardware')}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedElement === 'hardware'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                    <span className="text-xs font-bold">Крепёж Клин-Пин (замок)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-amber-300">
                    {getItemQty('hardware')} шт.
                  </span>
                </button>

                {structureType !== 'columns' && (
                  <button
                    onMouseEnter={() => setHoveredElement('pipes')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => setSelectedElement('pipes')}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedElement === 'pipes'
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                        : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-rose-500 rounded-xs"></div>
                      <span className="text-xs font-bold">Крючки выравнивающих труб</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-rose-300">
                      {getItemQty('pipes')} шт.
                    </span>
                  </button>
                )}

                <button
                  onMouseEnter={() => setHoveredElement('supports')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => setSelectedElement('supports')}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedElement === 'supports'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rotate-45 rounded-xs"></div>
                    <span className="text-xs font-bold">Опорные подкосы 3м</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-emerald-300">
                    {getItemQty('supports')} шт.
                  </span>
                </button>
              </div>
            </div>

            {/* Текстовые инструкции для выбранного элемента */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${guide.bg} ${guide.border}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${guide.color}`}>
                  {guide.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium mb-2.5">
                {guide.desc}
              </p>
              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 italic leading-normal flex gap-1.5">
                <span className="text-amber-500 font-bold">Совет:</span>
                <span>{guide.tip}</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        // Пошаговая инструкция по сборке по СНиП
        <div className="space-y-4 relative z-10">
          <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2.5xl flex gap-3 text-xs leading-relaxed font-medium text-orange-200/90">
            <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-orange-400 uppercase tracking-wider block mb-1">Технологическая инструкция сборки опалубки Euroform</span>
              Корейская щитовая опалубка собирается вручную без использования тяжелой крановой техники, что делает её идеальным выбором для частного малоэтажного строительства. Ниже приведена точная последовательность сборки под ваш расчетный тип конструкции.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-900 p-4 rounded-2xl flex gap-3">
                <div className="w-7 h-7 bg-orange-500 text-black text-xs font-black rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/10">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-tight mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-medium">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-500 font-medium">
              * Сборка должна производиться в соответствии со СНиП 3.03.01-87 «Несущие и ограждающие конструкции».
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
