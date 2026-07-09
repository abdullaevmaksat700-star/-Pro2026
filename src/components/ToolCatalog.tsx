import React, { useState } from 'react';
import { CATALOG_TOOLS } from '../data/tools';
import { Tool } from '../types';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Check, 
  HelpCircle,
  Wrench,
  Construction,
  ShieldAlert,
  Zap,
  Tag
} from 'lucide-react';

interface ToolCatalogProps {
  onAddToCart: (tool: Tool, quantity: number, days: number) => void;
  cartItems: { tool: Tool; quantity: number; days: number }[];
}

export default function ToolCatalog({ onAddToCart, cartItems }: ToolCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rentDays, setRentDays] = useState<{ [key: string]: number }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  // Категории
  const categories = [
    { id: 'all', name: 'Все инструменты', icon: <Wrench className="w-4 h-4" /> },
    { id: 'formwork', name: 'Опалубка и крепеж', icon: <Construction className="w-4 h-4" /> },
    { id: 'concrete', name: 'Бетонные работы', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'power', name: 'Электроинструменты', icon: <Zap className="w-4 h-4" /> }
  ];

  // Фильтрация
  const filteredTools = CATALOG_TOOLS.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRentDaysForTool = (toolId: string) => rentDays[toolId] || 5;
  const getQuantityForTool = (toolId: string) => quantities[toolId] || 1;

  const handleDaysChange = (toolId: string, days: number) => {
    setRentDays(prev => ({ ...prev, [toolId]: Math.max(1, days) }));
  };

  const handleQuantityChange = (toolId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [toolId]: Math.max(1, qty) }));
  };

  const triggerAddedNotification = (toolName: string) => {
    setAddedNotification(toolName);
    setTimeout(() => {
      setAddedNotification(null);
    }, 2500);
  };

  const isInCart = (toolId: string) => {
    return cartItems.some(item => item.tool.id === toolId);
  };

  return (
    <div className="space-y-6" id="tool-catalog-section">
      {/* Уведомление об успешном добавлении */}
      {addedNotification && (
        <div className="fixed bottom-6 right-6 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-orange-500/30 z-50 flex items-center gap-3 animate-fade-in animate-duration-300">
          <div className="p-1 bg-orange-500 rounded-full">
            <Check className="w-4 h-4 text-black stroke-[3]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Добавлено в заявку</span>
            <span className="text-sm font-black text-orange-400">{addedNotification}</span>
          </div>
        </div>
      )}

      {/* Поиск и Фильтр */}
      <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-black shadow-md shadow-orange-500/10 font-black'
                  : 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-xs text-white outline-none font-medium"
          />
        </div>
      </div>

      {/* Список инструментов */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const qty = getQuantityForTool(tool.id);
          const days = getRentDaysForTool(tool.id);
          const isItemInCart = isInCart(tool.id);

          return (
            <div 
              key={tool.id} 
              className={`bg-[#090d16]/75 rounded-3xl border transition-all flex flex-col overflow-hidden group backdrop-blur-md ${
                isItemInCart 
                  ? 'border-orange-500 ring-2 ring-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                  : 'border-slate-900 hover:border-slate-800 shadow-xl'
              }`}
            >
              {/* Верхняя часть карточки */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                      <Tag className="w-3 h-3" />
                      {tool.category === 'formwork' && 'Опалубка'}
                      {tool.category === 'power' && 'Электроинструмент'}
                      {tool.category === 'concrete' && 'Бетонные работы'}
                    </span>
                    <h3 className="text-base font-black text-white mt-2 group-hover:text-orange-400 transition-colors font-display tracking-tight">
                      {tool.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 min-h-[48px] leading-relaxed font-medium">
                  {tool.description}
                </p>

                {/* Технические характеристики */}
                <div className="bg-slate-950 border border-slate-900/60 rounded-2xl p-3.5 text-xs space-y-1.5 font-medium">
                  {Object.entries(tool.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-slate-400">
                      <span>{key}:</span>
                      <span className="font-extrabold text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Стоимость */}
              <div className="px-5 py-3.5 bg-slate-950/40 border-t border-b border-slate-900/60 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider mb-0.5">Аренда в день</span>
                  <span className="text-sm font-black text-white font-mono">{tool.pricePerDay} сом <span className="text-[10px] font-bold text-slate-500">/{tool.unit}</span></span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider mb-0.5">Обеспечительный залог</span>
                  <span className="text-sm font-black text-orange-400 font-mono">{tool.deposit.toLocaleString()} сом <span className="text-[10px] font-bold text-slate-500">/шт</span></span>
                </div>
              </div>

              {/* Управление арендой */}
              <div className="p-4 bg-slate-950/20 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Выбор количества */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Кол-во:</label>
                    <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden h-9 bg-slate-950">
                      <button
                        onClick={() => handleQuantityChange(tool.id, qty - 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-white hover:bg-slate-900 border-r border-slate-800 h-full transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => handleQuantityChange(tool.id, parseInt(e.target.value) || 1)}
                        className="w-full text-center text-xs font-black text-white border-none focus:outline-none bg-transparent font-mono"
                      />
                      <button
                        onClick={() => handleQuantityChange(tool.id, qty + 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-white hover:bg-slate-900 border-l border-slate-800 h-full transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Выбор срока */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Срок (дней):</label>
                    <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden h-9 bg-slate-950">
                      <button
                        onClick={() => handleDaysChange(tool.id, days - 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-white hover:bg-slate-900 border-r border-slate-800 h-full transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={days}
                        onChange={(e) => handleDaysChange(tool.id, parseInt(e.target.value) || 1)}
                        className="w-full text-center text-xs font-black text-white border-none focus:outline-none bg-transparent font-mono"
                      />
                      <button
                        onClick={() => handleDaysChange(tool.id, days + 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-white hover:bg-slate-900 border-l border-slate-800 h-full transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Кнопка заказа */}
                <button
                  onClick={() => {
                    onAddToCart(tool, qty, days);
                    triggerAddedNotification(`${tool.name} (x${qty})`);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
                    isItemInCart
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/10'
                      : 'bg-slate-950 hover:bg-orange-500 hover:text-black border border-slate-800 hover:border-orange-500 text-white shadow-xl'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isItemInCart ? 'Добавить ещё' : 'Добавить в заявку'}</span>
                </button>
              </div>
            </div>
          );
        })}
        {filteredTools.length === 0 && (
          <div className="col-span-full bg-[#090d16]/75 rounded-3xl border border-slate-900 p-12 text-center text-slate-400 font-medium">
            Ничего не найдено по вашему запросу. Попробуйте изменить параметры поиска.
          </div>
        )}
      </div>
    </div>
  );
}
