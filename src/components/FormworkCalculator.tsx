import React, { useState, useEffect } from 'react';
import { calculateFormwork } from '../data/tools';
import { FormworkRequirement, ProjectCalculation } from '../types';
import FormworkPlacementScheme from './FormworkPlacementScheme';
import { 
  Building, 
  Layers, 
  Grid, 
  HelpCircle, 
  Save, 
  Check, 
  Truck, 
  Scale, 
  Coins, 
  Calendar,
  Settings,
  Flame,
  Info
} from 'lucide-react';

interface FormworkCalculatorProps {
  onSaveProject: (project: Omit<ProjectCalculation, 'id' | 'createdAt' | 'results'> & { results: FormworkRequirement[] }) => void;
  loadProjectData?: ProjectCalculation | null;
  onClearLoadedProject?: () => void;
}

export default function FormworkCalculator({ 
  onSaveProject,
  loadProjectData = null,
  onClearLoadedProject
}: FormworkCalculatorProps) {
  // Выбор типа конструкции
  const [structureType, setStructureType] = useState<'walls' | 'foundation_strip' | 'foundation_slab' | 'columns'>('walls');
  
  // Параметры размеров
  const [length, setLength] = useState<number>(24); // в метрах
  const [height, setHeight] = useState<number>(3);  // в метрах
  const [thickness, setThickness] = useState<number>(300); // в мм (для стен/ленты)
  const [columnCount, setColumnCount] = useState<number>(8);
  const [columnSide, setColumnSide] = useState<number>(400); // в мм
  const [internalCorners, setInternalCorners] = useState<number>(4);
  const [externalCorners, setExternalCorners] = useState<number>(4);
  const [durationDays, setDurationDays] = useState<number>(15);

  // Для сохранения проекта
  const [projectName, setProjectName] = useState<string>('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);

  // Результаты вычислений в реальном времени
  const [calculatedItems, setCalculatedItems] = useState<FormworkRequirement[]>([]);

  // При загрузке сохраненного проекта, обновляем все локальные стейты
  useEffect(() => {
    if (loadProjectData) {
      setStructureType(loadProjectData.structureType);
      
      const dims = loadProjectData.dimensions;
      if (dims) {
        if (dims.length !== undefined) setLength(dims.length);
        if (dims.height !== undefined) setHeight(dims.height);
        if (dims.thickness !== undefined) setThickness(dims.thickness);
        if (dims.columnCount !== undefined) setColumnCount(dims.columnCount);
        if (dims.columnSide !== undefined) setColumnSide(dims.columnSide);
        if (dims.internalCornersCount !== undefined) setInternalCorners(dims.internalCornersCount);
        if (dims.externalCornersCount !== undefined) setExternalCorners(dims.externalCornersCount);
      }
      
      if (loadProjectData.durationDays !== undefined) {
        setDurationDays(loadProjectData.durationDays);
      }
      
      setProjectName(loadProjectData.name);
      
      // Сбрасываем loadedProject в родительском компоненте
      if (onClearLoadedProject) {
        onClearLoadedProject();
      }
    }
  }, [loadProjectData, onClearLoadedProject]);

  // Перерасчет при изменении любого ввода
  useEffect(() => {
    const results = calculateFormwork(structureType, {
      length,
      height,
      thickness,
      columnCount,
      columnSide,
      internalCornersCount: internalCorners,
      externalCornersCount: externalCorners
    }, durationDays);
    
    setCalculatedItems(results);
  }, [structureType, length, height, thickness, columnCount, columnSide, internalCorners, externalCorners, durationDays]);

  // Общие показатели
  const totalWeight = calculatedItems.reduce((acc, item) => acc + item.totalWeight, 0);
  const totalRentPrice = calculatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalDeposit = calculatedItems.reduce((acc, item) => acc + item.totalDeposit, 0);
  const totalItemsCount = calculatedItems.reduce((acc, item) => acc + item.quantity, 0);

  // Какое транспортное средство требуется?
  const getRequiredTransport = (weightKg: number) => {
    const tons = weightKg / 1000;
    if (tons === 0) return { name: 'Нет груза', capacity: '0 т', icon: '🚗', color: 'text-gray-400' };
    if (tons <= 1.5) return { name: 'Газель Борт', capacity: 'до 1.5 т', icon: '🚛', color: 'text-emerald-500' };
    if (tons <= 5) return { name: 'Грузовик Валдай / Бычок', capacity: 'до 5.0 т', icon: '🚛', color: 'text-amber-500' };
    if (tons <= 10) return { name: 'КамАЗ / Манипулятор', capacity: 'до 10 т', icon: '🚚', color: 'text-orange-500' };
    return { name: 'Длинномер / Фура', capacity: 'до 20 т (несколько рейсов)', icon: '🚒', color: 'text-rose-500' };
  };

  const transport = getRequiredTransport(totalWeight);

  // Скидки в зависимости от срока аренды
  const getDiscount = (days: number) => {
    if (days >= 30) return { percent: 20, label: 'Оптовая скидка 20% (>30 дней)' };
    if (days >= 15) return { percent: 10, label: 'Средняя скидка 10% (>=15 дней)' };
    if (days >= 7) return { percent: 5, label: 'Начальная скидка 5% (>=7 дней)' };
    return { percent: 0, label: 'Без скидки (<7 дней)' };
  };

  const discount = getDiscount(durationDays);
  const discountedRentPrice = totalRentPrice * (1 - discount.percent / 100);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToSave = projectName.trim() || `Проект: ${
      structureType === 'walls' ? 'Стены' :
      structureType === 'foundation_strip' ? 'Ленточный фундамент' :
      structureType === 'foundation_slab' ? 'Плитный фундамент' : 'Колонны'
    } ${length}м`;

    onSaveProject({
      name: nameToSave,
      structureType,
      dimensions: {
        length,
        height,
        thickness,
        columnCount,
        columnSide,
        internalCornersCount: internalCorners,
        externalCornersCount: externalCorners
      },
      durationDays,
      results: calculatedItems
    });

    setProjectName('');
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 3000);
  };

  return (
    <div className="space-y-6" id="formwork-calculator-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Левая колонка: параметры ввода */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="bento-glow w-64 h-64 bg-orange-500/5 -top-10 -left-10"></div>
          
          <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2 relative z-10 font-display uppercase tracking-tight">
            <Settings className="w-5 h-5 text-orange-500" />
            1. Тип конструкции
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
            <button
              onClick={() => {
                setStructureType('walls');
                setInternalCorners(4);
                setExternalCorners(4);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                structureType === 'walls'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950/40'
              }`}
              id="btn-struct-walls"
            >
              <Building className="w-6 h-6 mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm">Стены</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal">Опалубка с двух сторон стен</div>
            </button>

            <button
              onClick={() => {
                setStructureType('foundation_strip');
                setInternalCorners(4);
                setExternalCorners(4);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                structureType === 'foundation_strip'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950/40'
              }`}
              id="btn-struct-strip"
            >
              <Layers className="w-6 h-6 mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm">Ленточный</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal">Для фундаментов зданий и заборов</div>
            </button>

            <button
              onClick={() => {
                setStructureType('foundation_slab');
                setInternalCorners(0);
                setExternalCorners(4);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                structureType === 'foundation_slab'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950/40'
              }`}
              id="btn-struct-slab"
            >
              <Grid className="w-6 h-6 mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm">Плитный</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal">Опалубка только по торцам плиты</div>
            </button>

            <button
              onClick={() => {
                setStructureType('columns');
                setInternalCorners(0);
                setExternalCorners(0);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                structureType === 'columns'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950/40'
              }`}
              id="btn-struct-columns"
            >
              <div className="flex gap-1 mb-2">
                <div className="w-2 h-6 bg-orange-500 rounded-xs"></div>
                <div className="w-2 h-6 bg-orange-500 rounded-xs"></div>
                <div className="w-2 h-6 bg-orange-500 rounded-xs"></div>
              </div>
              <div className="font-bold text-sm">Колонны</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal">Квадратное сечение под заливку</div>
            </button>
          </div>

          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2 relative z-10 font-display uppercase tracking-tight border-t border-slate-900 pt-5">
            <Settings className="w-5 h-5 text-orange-500" />
            2. Размеры и параметры
          </h2>

          <div className="space-y-4 relative z-10">
            {/* Динамический рендеринг полей в зависимости от типа */}
            {structureType !== 'columns' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    {structureType === 'foundation_slab' ? 'Периметр плиты (общая длина торцов, м)' : 'Общая длина стен (м)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={length}
                      onChange={(e) => setLength(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold font-mono"
                    />
                    <span className="absolute right-3 top-3 text-slate-500 text-xs font-bold uppercase">метров</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Высота заливки (м)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.3"
                      max="6"
                      value={height}
                      onChange={(e) => setHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold font-mono"
                    />
                    <span className="absolute right-3 top-3 text-slate-500 text-xs font-bold uppercase">метров</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Высота одного щита корейской опалубки — 1.2 м. Будет рассчитано {Math.ceil(height / 1.2)} ряд(ов).
                  </p>
                </div>

                {(structureType === 'walls' || structureType === 'foundation_strip') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Толщина стены / ленты (мм)
                    </label>
                    <select
                      value={thickness}
                      onChange={(e) => setThickness(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold"
                    >
                      <option value={200}>200 мм</option>
                      <option value={250}>250 мм</option>
                      <option value={300}>300 мм</option>
                      <option value={400}>400 мм</option>
                      <option value={500}>500 мм</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                      Определяет необходимую длину плоских стяжек (Flat Tie).
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Кол-во колонн (шт)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={columnCount}
                      onChange={(e) => setColumnCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Сечение колонны (мм)
                    </label>
                    <select
                      value={columnSide}
                      onChange={(e) => setColumnSide(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold"
                    >
                      <option value={300}>300 х 300 мм</option>
                      <option value={400}>400 х 400 мм</option>
                      <option value={500}>500 х 500 мм</option>
                      <option value={600}>600 х 600 мм</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Высота колонн (м)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.6"
                      max="6"
                      value={height}
                      onChange={(e) => setHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold font-mono"
                    />
                    <span className="absolute right-3 top-3 text-slate-500 text-xs font-bold uppercase">метров</span>
                  </div>
                </div>
              </>
            )}

            {structureType !== 'columns' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Внутр. углы (шт)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={internalCorners}
                    onChange={(e) => setInternalCorners(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Внешн. углы (шт)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={externalCorners}
                    onChange={(e) => setExternalCorners(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm outline-none text-white font-semibold font-mono"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-900">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Срок аренды опалубки (дней)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="3"
                  max="90"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="w-20 text-center font-black text-black bg-orange-500 py-1.5 px-3.5 rounded-xl text-xs font-mono shadow-md shadow-orange-500/10">
                  {durationDays} дн.
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center gap-1">
                <span className="bg-slate-950 border border-slate-900 py-1 rounded-md">мин. 3 дня</span>
                <span className="bg-slate-950 border border-slate-900 py-1 rounded-md text-orange-400">от 7 дн: -5%</span>
                <span className="bg-slate-950 border border-slate-900 py-1 rounded-md text-orange-400">от 15 дн: -10%</span>
                <span className="bg-slate-950 border border-slate-900 py-1 rounded-md text-orange-400">от 30 дн: -20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Форма сохранения проекта - Bento 2 */}
        <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="bento-glow w-48 h-48 bg-orange-500/5 -bottom-10 -right-10"></div>
          
          <h3 className="text-sm font-black text-white mb-2.5 flex items-center gap-1.5 font-display uppercase tracking-tight relative z-10">
            <Save className="w-4.5 h-4.5 text-orange-500" />
            Сохранить в проект
          </h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-normal relative z-10 font-medium">
            Добавьте этот расчет в список ваших проектов, чтобы объединить его с другими расчетами и сделать общий заказ.
          </p>
          <form onSubmit={handleSave} className="space-y-3 relative z-10">
            <div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Например: Фундамент дома, Стены гаража..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-xs text-white outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer uppercase tracking-wider"
              id="btn-save-project-submit"
            >
              {isSavedSuccessfully ? (
                <>
                  <Check className="w-4 h-4 text-black stroke-[3] animate-bounce" />
                  <span>Успешно сохранено!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить расчет</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Правая колонка: результаты расчета */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/10 border border-slate-900 text-white rounded-3xl shadow-2xl p-6 relative overflow-hidden">
          <div className="bento-glow w-96 h-96 bg-orange-500/5 top-[-10%] right-[-10%]"></div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-black text-orange-500 tracking-wider font-mono">Сводный расчет спецификации</span>
              <h3 className="text-lg font-black text-white mt-1 font-display">
                {structureType === 'walls' && 'Опалубка для стен Euroform'}
                {structureType === 'foundation_strip' && 'Опалубка под ленточный фундамент'}
                {structureType === 'foundation_slab' && 'Торцевая опалубка плиты'}
                {structureType === 'columns' && 'Формы под колонны квадратного сечения'}
              </h3>
            </div>
            <div className="text-right bg-slate-950/60 border border-slate-900 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Период</span>
              <span className="font-black text-orange-400 text-sm font-mono">{durationDays} дн.</span>
            </div>
          </div>

          {/* Сетка Bento-ячеек для метрик */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 relative z-10">
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Всего деталей</span>
              <span className="text-lg font-black text-white font-mono">{totalItemsCount} {calculatedItems.length > 0 ? 'шт.' : '-'}</span>
            </div>
            
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Общий вес</span>
              <div>
                <span className="text-lg font-black text-white font-mono">{(totalWeight / 1000).toFixed(2)} т</span>
                <span className="text-[9px] text-slate-500 block font-mono font-bold mt-0.5">({totalWeight.toLocaleString()} кг)</span>
              </div>
            </div>
            
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Сумма залога</span>
              <div>
                <span className="text-lg font-black text-orange-400 font-mono">{totalDeposit.toLocaleString()} сом</span>
                <span className="text-[9px] text-slate-500 block uppercase font-bold mt-0.5">Возвратный</span>
              </div>
            </div>
            
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Аренда за сутки</span>
              <div>
                <span className="text-lg font-black text-white font-mono">{(totalRentPrice / durationDays).toFixed(0)} сом</span>
                <span className="text-[9px] text-slate-500 block uppercase font-bold mt-0.5">в день</span>
              </div>
            </div>
          </div>

          {/* Рекомендации по транспорту и скидке */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800/80 relative z-10">
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-900/65">
              <div className="p-2.5 bg-slate-900 text-lg rounded-xl flex items-center justify-center">
                {transport.icon}
              </div>
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider block">Рекомендуемый транспорт:</span>
                <span className="font-extrabold text-xs text-white leading-normal block mt-0.5">{transport.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-900/65">
              <div className="p-2.5 bg-slate-900 text-orange-400 rounded-xl flex items-center justify-center">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider block">Дисконт за период:</span>
                <span className="font-extrabold text-xs text-orange-400 leading-normal block mt-0.5">{discount.label}</span>
              </div>
            </div>
          </div>

          {/* Финальная цена */}
          <div className="pt-4 flex items-center justify-between relative z-10">
            <div>
              {discount.percent > 0 && (
                <span className="text-slate-500 line-through text-xs font-mono font-bold block">
                  {totalRentPrice.toLocaleString()} сом
                </span>
              )}
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Полная стоимость аренды:</span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3.5xl font-black text-orange-400 font-mono tracking-tight">
                {discountedRentPrice.toLocaleString()} сом
              </span>
            </div>
          </div>
        </div>

        {/* Спецификация оборудования по проекту */}
        <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 overflow-hidden shadow-xl backdrop-blur-md">
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-900 flex items-center justify-between">
            <h3 className="font-black text-white text-xs flex items-center gap-2 font-display uppercase tracking-wider">
              <Info className="w-4.5 h-4.5 text-orange-500" />
              Спецификация корейской опалубки Euroform
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Детализация расчета</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900">
                  <th className="px-6 py-3.5">Наименование элемента</th>
                  <th className="px-4 py-3.5 text-center">Кол-во</th>
                  <th className="px-4 py-3.5 text-right">Вес шт / всего</th>
                  <th className="px-4 py-3.5 text-right">Аренда / день</th>
                  <th className="px-4 py-3.5 text-right">Залог шт / всего</th>
                  <th className="px-6 py-3.5 text-right">Итого аренда</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80 text-xs text-slate-300">
                {calculatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-extrabold text-white text-xs">{item.russianName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Арт: {item.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-black text-white font-mono">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[11px] font-mono">
                      <span className="text-slate-500 block">{item.weightPerUnit} кг</span>
                      <span className="font-bold text-white">{item.totalWeight.toFixed(1)} кг</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-[11px] font-mono text-slate-200">
                      {item.pricePerDay} сом
                    </td>
                    <td className="px-4 py-3.5 text-right text-[11px] font-mono">
                      <span className="text-slate-500 block">{item.depositPerUnit} сом</span>
                      <span className="font-bold text-slate-200">{item.totalDeposit.toLocaleString()} сом</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-black text-orange-400 font-mono">
                      {item.totalPrice.toLocaleString()} сом
                    </td>
                  </tr>
                ))}
                {calculatedItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Задайте параметры, чтобы получить расчет оборудования.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-orange-500/5 text-orange-200/90 text-[11px] flex gap-2 border-t border-slate-900 leading-relaxed font-medium">
            <HelpCircle className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
            <div>
              <span className="font-bold text-orange-400">Примечание:</span> Расчет корейской опалубки Euroform произведен по типовым технологическим нормам СНиП с учетом 5%-го запаса крепежных элементов (Клин-Пин). Для сборки также потребуются деревянные брусья (доска 50х100 мм) или стандартные стальные трубы диаметром 48.6 мм в качестве горизонтальных ребер жесткости (вы можете запросить их у менеджера).
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Интерактивная схема раскладки элементов по проекту */}
      {calculatedItems.length > 0 && (
        <FormworkPlacementScheme 
          structureType={structureType}
          dimensions={{
            length,
            height,
            thickness,
            columnCount,
            columnSide,
            internalCornersCount: internalCorners,
            externalCornersCount: externalCorners
          }}
          calculatedItems={calculatedItems}
        />
      )}
    </div>
  );
}
