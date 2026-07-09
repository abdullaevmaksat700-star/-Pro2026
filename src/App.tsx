import React, { useState, useEffect } from 'react';
import FormworkCalculator from './components/FormworkCalculator';
import ToolCatalog from './components/ToolCatalog';
import ProjectManager from './components/ProjectManager';
import RentalTerms from './components/RentalTerms';
import { CATALOG_TOOLS } from './data/tools';
import { Tool, ProjectCalculation, FormworkRequirement } from './types';
import { 
  Building, 
  Layers, 
  Wrench, 
  ShoppingCart, 
  Truck, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  X, 
  Menu, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  PhoneCall,
  Clock,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Calculator,
  Download,
  Save,
  Plus
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'catalog' | 'projects' | 'terms'>('calculator');
  const [savedProjects, setSavedProjects] = useState<ProjectCalculation[]>([]);
  const [loadedProject, setLoadedProject] = useState<ProjectCalculation | null>(null);
  const [cart, setCart] = useState<{ tool: Tool; quantity: number; days: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Состояния для сохранения проекта из заявки (корзины)
  const [projectNameInput, setProjectNameInput] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [saveProjectStatus, setSaveProjectStatus] = useState<string | null>(null);

  // Форма заявки
  const [clientName, setClientName] = useState(() => localStorage.getItem('k_form_client_name') || '');
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem('k_form_client_phone') || '505106676');
  const [deliveryNeeded, setDeliveryNeeded] = useState(() => {
    try {
      const val = localStorage.getItem('k_form_delivery_needed');
      return val !== null ? JSON.parse(val) : true;
    } catch (e) {
      console.warn('Ошибка парсинга k_form_delivery_needed', e);
      return true;
    }
  });
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem('k_form_delivery_address') || 'село Тюп, ул. Осмонова 155');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any | null>(null);

  // Синхронизация данных клиента с LocalStorage
  useEffect(() => {
    localStorage.setItem('k_form_client_name', clientName);
  }, [clientName]);

  useEffect(() => {
    localStorage.setItem('k_form_client_phone', clientPhone);
  }, [clientPhone]);

  useEffect(() => {
    localStorage.setItem('k_form_delivery_needed', JSON.stringify(deliveryNeeded));
  }, [deliveryNeeded]);

  useEffect(() => {
    localStorage.setItem('k_form_delivery_address', deliveryAddress);
  }, [deliveryAddress]);

  // Загрузка проектов и корзины из LocalStorage при старте
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('k_form_projects');
      if (storedProjects) {
        setSavedProjects(JSON.parse(storedProjects));
      }
      
      const storedCart = localStorage.getItem('k_form_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Ошибка чтения из localStorage', e);
    }
  }, []);

  // Сохранение проектов в LocalStorage
  const saveProjectsToStorage = (updated: ProjectCalculation[]) => {
    setSavedProjects(updated);
    try {
      localStorage.setItem('k_form_projects', JSON.stringify(updated));
    } catch (e) {
      console.error('Ошибка сохранения проектов в localStorage', e);
    }
  };

  // Сохранение корзины в LocalStorage
  const saveCartToStorage = (updatedCart: typeof cart) => {
    setCart(updatedCart);
    try {
      localStorage.setItem('k_form_cart', JSON.stringify(updatedCart));
    } catch (e) {
      console.error('Ошибка сохранения корзины в localStorage', e);
    }
  };

  // Callback при сохранении нового расчета опалубки
  const handleSaveProject = (newProjData: Omit<ProjectCalculation, 'id' | 'createdAt' | 'results'> & { results: FormworkRequirement[] }) => {
    const newProject: ProjectCalculation = {
      id: 'proj_' + Date.now(),
      createdAt: new Date().toISOString(),
      ...newProjData
    };
    const updated = [newProject, ...savedProjects];
    saveProjectsToStorage(updated);
    
    // Автоматически переключаем на вкладку "Проекты", чтобы увидеть результат
    setActiveTab('projects');
  };

  // Удаление проекта
  const handleDeleteProject = (projectId: string) => {
    const updated = savedProjects.filter(p => p.id !== projectId);
    saveProjectsToStorage(updated);
  };

  // Обновление проекта (например, при добавлении фотографий)
  const handleUpdateProject = (updatedProject: ProjectCalculation) => {
    const updated = savedProjects.map(p => p.id === updatedProject.id ? updatedProject : p);
    saveProjectsToStorage(updated);
  };

  // Импорт сохраненных расчетов из внешнего JSON файла
  const handleImportProjects = (imported: ProjectCalculation[]) => {
    const validated = imported.map(p => ({
      ...p,
      id: 'proj_' + Math.floor(Math.random() * 1000000) + '_' + Date.now(),
      createdAt: p.createdAt || new Date().toISOString()
    }));
    const updated = [...validated, ...savedProjects];
    saveProjectsToStorage(updated);
  };

  // Загрузка проекта в активный калькулятор
  const handleLoadToCalculator = (project: ProjectCalculation) => {
    setLoadedProject(project);
    setActiveTab('calculator');
  };

  // Добавление инструмента из каталога в корзину
  const handleAddToCart = (tool: Tool, quantity: number, days: number) => {
    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(item => item.tool.id === tool.id);

    if (existingIndex > -1) {
      // Обновляем количество и срок
      updatedCart[existingIndex].quantity += quantity;
      updatedCart[existingIndex].days = days; // перезаписываем срок
    } else {
      updatedCart.push({ tool, quantity, days });
    }

    saveCartToStorage(updatedCart);
  };

  // Удаление позиции из корзины
  const handleRemoveFromCart = (toolId: string) => {
    const updated = cart.filter(item => item.tool.id !== toolId);
    saveCartToStorage(updated);
  };

  // Изменение количества в корзине
  const handleUpdateCartQty = (toolId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.tool.id === toolId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  // Изменение дней аренды в корзине
  const handleUpdateCartDays = (toolId: string, days: number) => {
    const updated = cart.map(item => {
      if (item.tool.id === toolId) {
        return { ...item, days: Math.max(1, days) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  // Добавление всех элементов сохраненных проектов в корзину
  const handleAddAllProjectsToCart = () => {
    const updatedCart = [...cart];

    // Собираем все щиты и крепеж из проектов
    const projectItems: { [key: string]: { quantity: number; days: number } } = {};
    
    savedProjects.forEach(proj => {
      proj.results.forEach(item => {
        if (!projectItems[item.id]) {
          projectItems[item.id] = { quantity: 0, days: proj.durationDays };
        }
        projectItems[item.id].quantity += item.quantity;
        projectItems[item.id].days = Math.max(projectItems[item.id].days, proj.durationDays);
      });
    });

    // Находим данные инструментов в каталоге и добавляем в корзину
    Object.entries(projectItems).forEach(([id, info]) => {
      const toolInfo = CATALOG_TOOLS.find(t => t.id === id);
      if (toolInfo) {
        const existingIndex = updatedCart.findIndex(item => item.tool.id === id);
        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity += info.quantity;
          updatedCart[existingIndex].days = Math.max(updatedCart[existingIndex].days, info.days);
        } else {
          updatedCart.push({ tool: toolInfo, quantity: info.quantity, days: info.days });
        }
      }
    });

    saveCartToStorage(updatedCart);
    setIsCartOpen(true);
  };

  // Очистка корзины
  const handleClearCart = () => {
    saveCartToStorage([]);
  };

  // Сохранение текущей корзины (заявки) как проекта
  const handleSaveCartAsProject = (name: string) => {
    if (cart.length === 0) return;
    
    // Вычисляем максимальную продолжительность аренды из позиций в корзине (по умолчанию 3 дня)
    const maxDays = cart.reduce((max, item) => Math.max(max, item.days), 3);
    
    // Преобразуем элементы корзины в FormworkRequirement
    const results: FormworkRequirement[] = cart.map(item => {
      const weightPerUnit = parseFloat(item.tool.specs['Вес'] || '0');
      return {
        id: item.tool.id,
        name: item.tool.name,
        russianName: item.tool.name,
        quantity: item.quantity,
        unit: item.tool.unit,
        weightPerUnit: weightPerUnit,
        pricePerDay: item.tool.pricePerDay,
        depositPerUnit: item.tool.deposit,
        totalPrice: item.tool.pricePerDay * item.quantity * item.days,
        totalDeposit: item.tool.deposit * item.quantity,
        totalWeight: weightPerUnit * item.quantity
      };
    });

    const newProject: ProjectCalculation = {
      id: 'proj_' + Date.now(),
      name: name.trim() || `Проект от ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toISOString(),
      structureType: 'walls', // дефолтный тип структуры
      dimensions: {
        length: 0,
        height: 0,
        internalCornersCount: 0,
        externalCornersCount: 0
      },
      durationDays: maxDays,
      results: results
    };

    const updatedProjects = [newProject, ...savedProjects];
    saveProjectsToStorage(updatedProjects);
  };

  // Добавление одного проекта в корзину (заявку)
  const handleAddSingleProjectToCart = (project: ProjectCalculation) => {
    const updatedCart = [...cart];
    project.results.forEach(item => {
      const toolInfo = CATALOG_TOOLS.find(t => t.id === item.id);
      if (toolInfo) {
        const existingIndex = updatedCart.findIndex(cartItem => cartItem.tool.id === item.id);
        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity += item.quantity;
          updatedCart[existingIndex].days = Math.max(updatedCart[existingIndex].days, project.durationDays);
        } else {
          updatedCart.push({ tool: toolInfo, quantity: item.quantity, days: project.durationDays });
        }
      }
    });
    saveCartToStorage(updatedCart);
  };

  // Финансовый расчет корзины
  const getCartTotals = () => {
    let rawRentTotal = 0;
    let depositTotal = 0;
    let weightTotal = 0;

    cart.forEach(item => {
      const tool = item.tool;
      const weightPerUnit = parseFloat(tool.specs['Вес'] || '0');
      
      // Скидки в зависимости от дней аренды
      let discountFactor = 1;
      if (item.days >= 30) discountFactor = 0.8;
      else if (item.days >= 15) discountFactor = 0.9;
      else if (item.days >= 7) discountFactor = 0.95;

      rawRentTotal += tool.pricePerDay * item.quantity * item.days * discountFactor;
      depositTotal += tool.deposit * item.quantity;
      weightTotal += weightPerUnit * item.quantity;
    });

    return {
      rentTotal: Math.round(rawRentTotal),
      depositTotal,
      weightTotal,
    };
  };

  const cartTotals = getCartTotals();

  // Отправка заявки (имитация)
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Симулируем отправку на сервер
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(true);
      setLastOrderDetails({
        id: 'ORDER-' + Math.floor(Math.random() * 90000 + 10000),
        clientName,
        clientPhone,
        deliveryNeeded,
        deliveryAddress,
        items: [...cart],
        totals: { ...cartTotals },
        date: new Date().toLocaleString()
      });
      // Очищаем корзину после заказа
      saveCartToStorage([]);
    }, 1500);
  };

  // Функция скачивания спецификации заказа
  const downloadOrderSpecification = () => {
    if (!lastOrderDetails) return;
    
    let spec = `СПЕЦИФИКАЦИЯ К ЗАКАЗУ ${lastOrderDetails.id}\n`;
    spec += `Дата оформления: ${lastOrderDetails.date}\n`;
    spec += `Клиент: ${lastOrderDetails.clientName}\n`;
    spec += `Телефон: ${lastOrderDetails.clientPhone}\n`;
    spec += `Доставка: ${lastOrderDetails.deliveryNeeded ? `Да, по адресу: ${lastOrderDetails.deliveryAddress}` : 'Самовывоз со склада'}\n`;
    spec += `==================================================\n\n`;
    spec += `АРЕНДУЕМОЕ ОБОРУДОВАНИЕ:\n`;
    spec += `--------------------------------------------------\n`;
    
    lastOrderDetails.items.forEach((item: any, idx: number) => {
      spec += `${idx + 1}. ${item.tool.name}\n`;
      spec += `   Количество: ${item.quantity} ${item.tool.unit} | Срок аренды: ${item.days} дней\n`;
      spec += `   Залог: ${(item.tool.deposit * item.quantity).toLocaleString()} сом | Аренда: ${(item.tool.pricePerDay * item.quantity * item.days).toLocaleString()} сом\n\n`;
    });

    spec += `==================================================\n`;
    spec += `ИТОГОВЫЕ ДАННЫЕ:\n`;
    spec += `--------------------------------------------------\n`;
    spec += `Суммарный вес оборудования: ${lastOrderDetails.totals.weightTotal.toLocaleString()} кг (${(lastOrderDetails.totals.weightTotal / 1000).toFixed(2)} т)\n`;
    spec += `Обеспечительный залог: ${lastOrderDetails.totals.depositTotal.toLocaleString()} сом (возвращается)\n`;
    spec += `Стоимость аренды: ${lastOrderDetails.totals.rentTotal.toLocaleString()} сом\n`;
    spec += `==================================================\n`;
    spec += `Спасибо за ваш заказ! Наш инженер свяжется с вами в течение 10 минут.\n`;

    const blob = new Blob([spec], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Specification-${lastOrderDetails.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200" id="main-applet-container">
      
      {/* 1. Upper Info Bar - Bento Accent */}
      <div className="bg-[#0b0f19]/80 text-slate-300 text-[11px] py-2 px-4 sm:px-6 border-b border-slate-900 flex justify-between items-center flex-wrap gap-2 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            Прием заявок: ежедневно с 08:00 до 21:00
          </span>
          <span className="hidden md:flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            Склад: Москва, ул. Строителей, д. 24, стр. 3
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:+74950000000" className="hover:text-orange-400 font-bold flex items-center gap-1 transition-colors text-slate-200">
            <PhoneCall className="w-3 h-3 text-orange-500" />
            +7 (495) 123-45-67
          </a>
        </div>
      </div>

      {/* 2. Bento Header */}
      <header className="bg-[#090d16]/70 border-b border-slate-900/80 sticky top-0 z-40 backdrop-blur-xl" id="app-header-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with bento-style look */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-black p-2.5 rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <Building className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white leading-none font-display">АРЕНДА СТРОЙ</h1>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">Опалубка & Инструменты</p>
            </div>
          </div>

          {/* Desktop Navigation - Bento segments */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-900/60">
            <button
              onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === 'calculator' 
                  ? 'bg-orange-500 text-black font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
              id="tab-btn-calculator"
            >
              Калькулятор опалубки
            </button>
            <button
              onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all relative cursor-pointer ${
                activeTab === 'projects' 
                  ? 'bg-orange-500 text-black font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
              id="tab-btn-projects"
            >
              Мои проекты
              {savedProjects.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-black font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {savedProjects.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === 'catalog' 
                  ? 'bg-orange-500 text-black font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
              id="tab-btn-catalog"
            >
              Каталог инструментов
            </button>
            <button
              onClick={() => { setActiveTab('terms'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === 'terms' 
                  ? 'bg-orange-500 text-black font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
              id="tab-btn-terms"
            >
              Условия и доставка
            </button>
          </nav>

          {/* Right Action Panel */}
          <div className="flex items-center gap-3">
            
            {/* Basket Button - Bento style */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-slate-900/90 hover:bg-orange-500 hover:text-black border border-slate-800 hover:border-orange-500 text-slate-100 p-3 rounded-2xl flex items-center gap-2 transition-all relative cursor-pointer shadow-lg group"
              id="cart-trigger-btn"
            >
              <ShoppingCart className="w-5 h-5 text-orange-500 group-hover:text-black transition-colors" />
              <span className="text-xs font-extrabold hidden sm:inline uppercase tracking-wider">Заявка</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-black font-black text-[10px] w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Mobile menu burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-900/40 cursor-pointer"
              id="mobile-menu-trigger"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#090d16] border-t border-slate-900 px-4 py-3.5 space-y-2 shadow-2xl">
            <button
              onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider ${
                activeTab === 'calculator' ? 'bg-orange-500 text-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Калькулятор опалубки
            </button>
            <button
              onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider relative ${
                activeTab === 'projects' ? 'bg-orange-500 text-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Мои проекты ({savedProjects.length})
            </button>
            <button
              onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider ${
                activeTab === 'catalog' ? 'bg-orange-500 text-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Каталог инструментов
            </button>
            <button
              onClick={() => { setActiveTab('terms'); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider ${
                activeTab === 'terms' ? 'bg-orange-500 text-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Условия и доставка
            </button>
          </div>
        )}
      </header>

      {/* 3. Основной контент */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Информационный баннер - Bento Grid Style */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-orange-950/20 text-white rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl border border-slate-900 shadow-orange-950/10">
          <div className="bento-glow w-96 h-96 bg-orange-500/5 top-[-10%] right-[-10%]"></div>
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3.5 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Калькулятор корейской мелкощитовой опалубки Euroform
            </div>
            
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight font-display">
              Профессиональный расчет и аренда опалубки для ваших проектов
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Вы можете рассчитать потребность щитов, внутренних и внешних углов, клиньев, пинов и плоских стяжек по каждому проекту отдельно, а затем объединить их в единую сводную ведомость для заказа.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 py-1.5 px-3.5 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Высокая точность раскладки щитов
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 py-1.5 px-3.5 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Учет веса и логистики
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 py-1.5 px-3.5 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Скидки до 20%
              </div>
            </div>
          </div>
        </div>

        {/* Переключатель вкладок на мобильных (быстрый доступ) */}
        <div className="flex lg:hidden bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-6 gap-1.5 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'calculator' 
                ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Расчет
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold relative cursor-pointer transition-all ${
              activeTab === 'projects' 
                ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Проекты
            {savedProjects.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {savedProjects.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'catalog' 
                ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Каталог
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'terms' 
                ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Условия
          </button>
        </div>

        {/* Секция вкладок */}
        {activeTab === 'calculator' && (
          <FormworkCalculator 
            onSaveProject={handleSaveProject} 
            loadProjectData={loadedProject}
            onClearLoadedProject={() => setLoadedProject(null)}
          />
        )}
        
        {activeTab === 'projects' && (
          <ProjectManager 
            projects={savedProjects} 
            onDeleteProject={handleDeleteProject}
            onUpdateProject={handleUpdateProject}
            onAddAllProjectsToCart={handleAddAllProjectsToCart}
            onImportProjects={handleImportProjects}
            onLoadToCalculator={handleLoadToCalculator}
          />
        )}

        {activeTab === 'catalog' && (
          <ToolCatalog 
            onAddToCart={handleAddToCart} 
            cartItems={cart}
          />
        )}

        {activeTab === 'terms' && (
          <RentalTerms />
        )}
      </main>

      {/* 4. Корзина - Боковая панель (Заявка на аренду) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#070b13] shadow-2xl flex flex-col h-full border-l border-slate-900">
              
              {/* Шапка корзины */}
              <div className="px-6 py-5 bg-[#090d16] text-white flex items-center justify-between border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-black font-display uppercase tracking-wider">Ваша заявка</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-900 hover:border-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Тело корзины */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {cart.length === 0 ? (
                  <div className="space-y-6">
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-900 flex items-center justify-center mx-auto text-slate-500">
                        <ShoppingCart className="w-7 h-7" />
                      </div>
                      <h4 className="font-black text-white text-sm uppercase tracking-wider">Ваша корзина пуста</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
                        Вы можете добавить инструменты из Каталога или рассчитать требуемое количество опалубки в Калькуляторе и нажать «Отправить все в заявку».
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => { setActiveTab('calculator'); setIsCartOpen(false); }}
                          className="bg-orange-500 hover:bg-orange-600 text-black font-black text-xs py-2.5 px-5 rounded-xl cursor-pointer uppercase tracking-wider shadow-md shadow-orange-500/10"
                        >
                          Перейти к расчету
                        </button>
                      </div>
                    </div>

                    {/* Добавление сохраненного проекта прямо в корзину */}
                    {savedProjects.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-900/60">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Загрузить сохраненный проект в заявку:
                        </span>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {savedProjects.map((project) => {
                            const totalItems = project.results.reduce((sum, item) => sum + item.quantity, 0);
                            return (
                              <div 
                                key={project.id} 
                                className="bg-slate-950 hover:bg-slate-900/60 p-3 rounded-2xl border border-slate-900 flex justify-between items-center transition-all group"
                              >
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-xs text-white group-hover:text-orange-400 transition-colors">
                                    {project.name}
                                  </h5>
                                  <span className="text-[10px] text-slate-500 block font-medium">
                                    {new Date(project.createdAt).toLocaleDateString('ru-RU')} • {totalItems} поз. • {project.durationDays} дн.
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    handleAddSingleProjectToCart(project);
                                    setSaveProjectStatus(`Проект «${project.name}» добавлен в заявку!`);
                                    setTimeout(() => setSaveProjectStatus(null), 3000);
                                  }}
                                  className="bg-orange-500/10 hover:bg-orange-500 border border-orange-500/20 hover:border-orange-500 text-orange-400 hover:text-black p-2 rounded-xl transition-all cursor-pointer"
                                  title="Добавить в заявку"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {saveProjectStatus && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-semibold text-center mt-2 animate-pulse">
                        {saveProjectStatus}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Список позиций */}
                    <div className="space-y-4">
                      {saveProjectStatus && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-semibold text-center animate-pulse">
                          {saveProjectStatus}
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Выбранное оборудование</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setIsSavingProject(!isSavingProject);
                              setProjectNameInput(`Проект от ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`);
                            }}
                            className="text-xs text-orange-400 hover:text-orange-300 font-extrabold cursor-pointer uppercase tracking-wider text-[10px] flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-1 rounded-lg border border-orange-500/20 transition-all"
                          >
                            <Save className="w-3 h-3" />
                            Сохранить проект
                          </button>
                          <button
                            onClick={handleClearCart}
                            className="text-xs text-red-400 hover:text-red-300 font-extrabold cursor-pointer uppercase tracking-wider text-[10px] bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/20 transition-all"
                          >
                            Очистить
                          </button>
                        </div>
                      </div>

                      {/* Форма сохранения проекта из корзины */}
                      {isSavingProject && (
                        <div className="bg-slate-950 border border-orange-500/30 p-3.5 rounded-2xl space-y-3 my-2">
                          <span className="block text-[9px] font-black text-orange-400 uppercase tracking-wider">
                            Сохранить заявку как новый проект:
                          </span>
                          <input
                            type="text"
                            value={projectNameInput}
                            onChange={(e) => setProjectNameInput(e.target.value)}
                            placeholder="Имя проекта..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-semibold"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleSaveCartAsProject(projectNameInput);
                                setIsSavingProject(false);
                                setSaveProjectStatus(`Проект «${projectNameInput}» сохранен в Мои проекты!`);
                                setTimeout(() => setSaveProjectStatus(null), 4000);
                              }}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] py-2 rounded-lg uppercase tracking-wider cursor-pointer text-center"
                            >
                              Сохранить
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsSavingProject(false)}
                              className="px-3 bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="divide-y divide-slate-900 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                        {cart.map((item) => {
                          const itemWeight = parseFloat(item.tool.specs['Вес'] || '0') * item.quantity;
                          
                          // Расчет скидки для вывода
                          let discountPercent = 0;
                          if (item.days >= 30) discountPercent = 20;
                          else if (item.days >= 15) discountPercent = 10;
                          else if (item.days >= 7) discountPercent = 5;

                          const originalTotal = item.tool.pricePerDay * item.quantity * item.days;
                          const discountedTotal = originalTotal * (1 - discountPercent / 100);

                          return (
                            <div key={item.tool.id} className="pt-3.5 first:pt-0">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-extrabold text-xs text-white leading-snug">{item.tool.name}</h4>
                                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                    Аренда: {item.tool.pricePerDay} сом/день | Вес: {itemWeight.toFixed(1)} кг
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveFromCart(item.tool.id)}
                                  className="text-slate-500 hover:text-red-400 p-1 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Контроллеры количества и дней */}
                              <div className="flex items-center justify-between gap-4 mt-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                  {/* Кол-во */}
                                  <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 overflow-hidden h-7">
                                    <button
                                      onClick={() => handleUpdateCartQty(item.tool.id, -1)}
                                      className="px-2 text-slate-400 hover:bg-slate-900 h-full cursor-pointer transition-colors"
                                    >
                                      -
                                    </button>
                                    <span className="px-2 text-[11px] font-black text-white font-mono">{item.quantity}</span>
                                    <button
                                      onClick={() => handleUpdateCartQty(item.tool.id, 1)}
                                      className="px-2 text-slate-400 hover:bg-slate-900 h-full cursor-pointer transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold">{item.tool.unit}</span>

                                  {/* Дни */}
                                  <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 overflow-hidden h-7 ml-1">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.days}
                                      onChange={(e) => handleUpdateCartDays(item.tool.id, parseInt(e.target.value) || 1)}
                                      className="w-10 text-center text-[11px] font-black text-white border-none outline-none focus:ring-0 bg-transparent font-mono"
                                    />
                                    <span className="pr-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">дн.</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  {discountPercent > 0 && (
                                    <span className="text-[10px] text-slate-500 line-through block leading-none font-mono">
                                      {originalTotal.toLocaleString()} сом
                                    </span>
                                  )}
                                  <span className="font-black text-xs text-orange-400 font-mono">
                                    {Math.round(discountedTotal).toLocaleString()} сом
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Сводные показатели */}
                    <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Общий вес инструментов:</span>
                        <strong className="text-white font-mono">{(cartTotals.weightTotal / 1000).toFixed(2)} т ({cartTotals.weightTotal.toLocaleString()} кг)</strong>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Залог (возвратный):</span>
                        <strong className="text-white font-mono">{cartTotals.depositTotal.toLocaleString()} сом</strong>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-white pt-2.5 border-t border-slate-900">
                        <span className="uppercase tracking-wider">Сумма аренды:</span>
                        <span className="text-base text-orange-400 font-mono font-black">{cartTotals.rentTotal.toLocaleString()} сом</span>
                      </div>
                    </div>

                    {/* Форма оформления заказа */}
                    <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-900 pb-2">
                        Оформление заказа
                      </span>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Ваше Имя / Организация *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                              type="text"
                              required
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              placeholder="Иван Петров"
                              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Номер телефона для связи *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                              type="tel"
                              required
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              placeholder="+7 (999) 123-45-67"
                              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 font-semibold"
                            />
                          </div>
                        </div>

                        {/* Доставка */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={deliveryNeeded}
                              onChange={(e) => setDeliveryNeeded(e.target.checked)}
                              className="rounded-md border-slate-800 text-orange-500 focus:ring-orange-500 w-4 h-4 bg-slate-950"
                            />
                            <span className="text-xs font-bold text-slate-200">Требуется доставка на объект</span>
                          </label>

                          {deliveryNeeded && (
                            <div className="relative">
                              <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                              <textarea
                                required
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Московская область, пос. Лесной, ул. Новая, д. 15..."
                                rows={2}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 font-semibold"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-black font-black py-3 px-4 rounded-xl text-xs transition-all uppercase tracking-wider shadow-md shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
                        id="btn-submit-order"
                      >
                        {isSubmitting ? (
                          <span>Оформление...</span>
                        ) : (
                          <>
                            <span>Отправить заявку</span>
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Экран успешного заказа */}
      {orderSuccess && lastOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090d16] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-slate-900 relative text-white">
            <button
              onClick={() => { setOrderSuccess(false); setLastOrderDetails(null); }}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white cursor-pointer border border-slate-900 hover:border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 flex items-center justify-center mx-auto text-2xl font-bold">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight">Заявка принята!</h3>
              <p className="text-xs text-slate-400">
                Заказ <strong className="text-orange-400 font-black">{lastOrderDetails.id}</strong> от {lastOrderDetails.date.split(',')[0]} оформлен.
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4.5 rounded-2xl border border-slate-900 font-medium">
              Уважаемый(ая) <strong className="text-white font-bold">{lastOrderDetails.clientName}</strong>, наш строительный инженер уже получил спецификацию вашего оборудования и делает точную схему раскладки щитов. Мы свяжемся с вами по телефону <strong className="text-orange-400 font-bold">{lastOrderDetails.clientPhone}</strong> в течение 10-15 минут.
            </p>

            {/* Итоговые данные */}
            <div className="text-left bg-slate-950 rounded-2xl p-5 space-y-2.5 border border-slate-900/60">
              <span className="text-[9px] uppercase font-bold text-orange-400 tracking-wider block mb-1">Детализация аренды</span>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Общий вес:</span>
                <span className="font-mono text-white">{(lastOrderDetails.totals.weightTotal / 1000).toFixed(2)} т</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Сумма залога (возвратная):</span>
                <span className="font-mono text-white">{lastOrderDetails.totals.depositTotal.toLocaleString()} сом</span>
              </div>
              <div className="flex justify-between text-xs pt-2.5 border-t border-slate-900 font-bold">
                <span className="uppercase tracking-wider">Итого стоимость аренды:</span>
                <span className="text-base font-black text-orange-400 font-mono">{lastOrderDetails.totals.rentTotal.toLocaleString()} сом</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={downloadOrderSpecification}
                className="py-3 px-4 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Download className="w-4 h-4 text-orange-500" />
                Скачать (.txt)
              </button>

              <button
                onClick={() => { setOrderSuccess(false); setLastOrderDetails(null); }}
                className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-xl text-xs transition-all cursor-pointer uppercase tracking-wider"
              >
                На сайт
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Подвал */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-1.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-orange-500 text-black p-2 rounded-xl flex items-center justify-center font-black text-base">
                <Building className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-sm font-black tracking-wider text-white font-display">АРЕНДА СТРОЙ</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Профессиональное монолитное оборудование и строительный инструмент. Калькуляторы высокой точности для строительных подрядчиков и частных застройщиков.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-orange-400 tracking-wider mb-4">Навигация</h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-semibold">
              <li><button onClick={() => setActiveTab('calculator')} className="hover:text-orange-400 transition-colors cursor-pointer">Калькулятор Euroform</button></li>
              <li><button onClick={() => setActiveTab('projects')} className="hover:text-orange-400 transition-colors cursor-pointer">Мои сохраненные проекты</button></li>
              <li><button onClick={() => setActiveTab('catalog')} className="hover:text-orange-400 transition-colors cursor-pointer">Каталог оборудования</button></li>
              <li><button onClick={() => setActiveTab('terms')} className="hover:text-orange-400 transition-colors cursor-pointer">Тарифы доставки</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-orange-400 tracking-wider mb-4">Контакты</h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-semibold">
              <li>Адрес: Кыргызстан, село Тюп, ул. Осмонова 155</li>
              <li>Телефон: +996 (505) 10-66-76</li>
              <li>Email: info@arenda-stroy.kg</li>
              <li>Пн - Сб: 08:00 - 20:00</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-4 font-semibold uppercase tracking-wider">
          <p>© 2026 АРЕНДА СТРОЙ — Аренда корейской опалубки и строительного инструмента. Все права защищены.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Политика</span>
            <span className="hover:text-slate-300 cursor-pointer">Оферта</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
