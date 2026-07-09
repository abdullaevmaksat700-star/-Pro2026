import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CreditCard, 
  Truck, 
  FileCheck, 
  Sparkles, 
  ThumbsUp, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function RentalTerms() {
  const [distance, setDistance] = useState<number>(15);
  const [selectedTruck, setSelectedTruck] = useState<'gazelle' | 'valday' | 'kam_az'>('gazelle');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Тарифы доставки
  const truckRates = {
    gazelle: { name: 'Газель (до 1.5 т)', basePrice: 1500, kmPrice: 40 },
    valday: { name: 'Валдай (до 5.0 т)', basePrice: 3500, kmPrice: 60 },
    kam_az: { name: 'КамАЗ Манипулятор (до 10 т)', basePrice: 6500, kmPrice: 90 }
  };

  const calculatedDeliveryPrice = truckRates[selectedTruck].basePrice + (distance * truckRates[selectedTruck].kmPrice);

  const faqs = [
    {
      q: 'Каков минимальный срок аренды опалубки и инструментов?',
      a: 'Минимальный срок аренды мелкощитовой корейской опалубки (Euroform) и электроинструмента составляет 3 календарных дня.'
    },
    {
      q: 'Как рассчитывается обеспечительный залог?',
      a: 'Залоговая стоимость зависит от типа и количества оборудования. Для постоянных клиентов или строительных компаний при предоставлении договора генерального подряда возможна индивидуальная схема снижения залога до 50% или аренда вовсе БЕЗ залога.'
    },
    {
      q: 'В каком виде необходимо возвращать опалубку?',
      a: 'Опалубка должна быть возвращена очищенной от остатков бетона и цементного молочка. В случае возврата грязной опалубки удерживается стоимость ее очистки в размере 100 сом за один щит.'
    },
    {
      q: 'Предоставляются ли скидки на длительные сроки?',
      a: 'Да! Наша сетка скидок адаптирована под строительные графики: от 7 дней — скидка 5%, от 15 дней — скидка 10%, от 30 дней (полный месяц) — оптовая скидка 20% на весь период аренды.'
    },
    {
      q: 'Можно ли заказать доставку в день обращения?',
      a: 'Да, при наличии свободного автотранспорта и оформлении заказа до 12:00 мы осуществляем доставку в тот же день. Также возможен самовывоз со склада.'
    }
  ];

  return (
    <div className="space-y-8" id="rental-terms-section">
      {/* Главные преимущества аренды */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="bento-glow w-32 h-32 bg-orange-500/5 -top-10 -left-10"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-orange-500 flex items-center justify-center font-bold text-lg relative z-10">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-black text-white text-sm font-display uppercase tracking-tight relative z-10">Быстрое оформление</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium relative z-10">
            Оформление договора аренды и выдача инструментов за 15 минут. Работаем как с физическими, так и с юридическими лицами (с НДС и без).
          </p>
        </div>

        <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="bento-glow w-32 h-32 bg-orange-500/5 -top-10 -left-10"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-orange-500 flex items-center justify-center font-bold text-lg relative z-10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-black text-white text-sm font-display uppercase tracking-tight relative z-10">Гарантия исправности</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium relative z-10">
            Каждый инструмент проходит обязательное техническое обслуживание и запуск перед выдачей клиенту. Опалубка имеет ровную палубу и жесткий каркас.
          </p>
        </div>

        <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="bento-glow w-32 h-32 bg-orange-500/5 -top-10 -left-10"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-orange-500 flex items-center justify-center font-bold text-lg relative z-10">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-black text-white text-sm font-display uppercase tracking-tight relative z-10">Прозрачные цены</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium relative z-10">
            Цены фиксируются в договоре и не меняются. Возврат залога происходит сразу после приемки оборудования на нашем складе.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Калькулятор доставки */}
        <div className="lg:col-span-6 bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 space-y-6 shadow-xl backdrop-blur-md relative">
          <div className="bento-glow w-64 h-64 bg-orange-500/5 -top-10 -left-10"></div>
          <div className="relative z-10">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-display uppercase tracking-wider">
              <Truck className="w-5 h-5 text-orange-500" />
              Калькулятор стоимости доставки
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 font-medium leading-normal">
              Рассчитайте ориентировочную стоимость доставки оборудования до вашей строительной площадки.
            </p>
          </div>

          <div className="space-y-5 relative z-10">
            {/* Выбор типа машины */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Выберите транспорт</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(truckRates).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTruck(key as any)}
                    className={`p-3 text-left rounded-2xl border text-xs transition-all duration-300 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedTruck === key
                        ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                        : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950/40'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold block text-white text-xs">{data.name.split(' ')[0]}</span>
                      <span className="text-slate-400 block text-[9px] mt-0.5 leading-tight">{data.name.substring(data.name.indexOf('('))}</span>
                    </div>
                    <span className="font-black text-orange-400 block mt-2 font-mono">{data.basePrice} сом + {data.kmPrice} сом/км</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Расстояние */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Расстояние до объекта (км)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="w-20 text-center font-black text-black bg-orange-500 py-1.5 px-3 rounded-xl text-xs font-mono">
                  {distance} км
                </span>
              </div>
            </div>

            {/* Итоговый расчет доставки */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-bold uppercase tracking-wide">Стоимость доставки:</span>
                <span className="text-[10px] text-slate-500 font-medium">Подача + расстояние {distance} км</span>
              </div>
              <span className="text-lg font-black text-orange-400 font-mono">
                {calculatedDeliveryPrice.toLocaleString()} сом
              </span>
            </div>
          </div>
        </div>

        {/* FAQ - Часто задаваемые вопросы */}
        <div className="lg:col-span-6 bg-[#090d16]/75 rounded-3xl border border-slate-900 p-6 space-y-6 shadow-xl backdrop-blur-md relative">
          <div className="bento-glow w-64 h-64 bg-orange-500/5 -top-10 -right-10"></div>
          <div className="relative z-10">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-display uppercase tracking-wider">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              Часто задаваемые вопросы
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 font-medium leading-normal">
              Ответы на самые популярные вопросы о залогах, возвратах и оформлении.
            </p>
          </div>

          <div className="space-y-3 relative z-10">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-950/40">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 hover:bg-slate-900/40 transition-colors flex items-center justify-between text-left font-extrabold text-xs text-white cursor-pointer"
                  >
                    <span className="max-w-[90%]">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-orange-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-orange-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3.5 bg-slate-950/70 text-xs text-slate-300 leading-relaxed border-t border-slate-900 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Карта самовывоза / складов */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/10 text-white rounded-3xl p-6 md:p-8 overflow-hidden relative border border-slate-900 shadow-2xl">
        <div className="bento-glow w-96 h-96 bg-orange-500/5 bottom-[-10%] right-[-10%]"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[9px] font-bold uppercase tracking-wider">Пункт выдачи</span>
            <h3 className="text-2xl font-black font-display uppercase tracking-tight">Склад самовывоза</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg font-medium">
              Вы всегда можете забрать опалубку и инструмент самостоятельно. Наш склад оборудован кран-балкой и погрузчиками, мы поможем загрузить оборудование в любой открытый или закрытый транспорт.
            </p>
            <div className="space-y-2.5 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Кыргызстан, село Тюп, ул. Осмонова 155</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Пн - Сб: с 8:00 до 20:00, Вс: выходной</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-900 rounded-3xl p-5 text-center space-y-4">
            <ThumbsUp className="w-10 h-10 text-orange-500 mx-auto" />
            <h4 className="font-black text-white text-xs uppercase tracking-wider">Нужна консультация инженера?</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Наш специалист поможет рассчитать сложный проект по вашим чертежам КЖ/АР абсолютно бесплатно.
            </p>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer uppercase tracking-wider shadow-md shadow-orange-500/10">
              Заказать консультацию
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
