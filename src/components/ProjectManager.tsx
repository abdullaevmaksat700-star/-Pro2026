import React, { useState } from 'react';
import { ProjectCalculation, FormworkRequirement } from '../types';
import { CATALOG_TOOLS } from '../data/tools';
import { 
  Trash2, 
  Layers, 
  Calendar, 
  Scale, 
  Coins, 
  Info, 
  Copy, 
  Printer, 
  FileSpreadsheet, 
  Truck, 
  Check, 
  ClipboardCheck,
  CornerDownRight,
  Calculator,
  Upload,
  Download,
  ArrowUpRight,
  X,
  Camera,
  Sparkles,
  FileText,
  Plus
} from 'lucide-react';

interface ProjectManagerProps {
  projects: ProjectCalculation[];
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (updatedProject: ProjectCalculation) => void;
  onAddAllProjectsToCart: () => void;
  onImportProjects: (imported: ProjectCalculation[]) => void;
  onLoadToCalculator: (project: ProjectCalculation) => void;
}

// Поиск и сопоставление строки оборудования с элементом каталога
const matchItemToCatalog = (text: string, qty: number, days: number): FormworkRequirement | null => {
  const norm = text.toLowerCase().trim();
  if (!norm) return null;
  
  // 1. Попытка прямого сопоставления по ID или полному имени
  let matchedTool = CATALOG_TOOLS.find(t => t.id === text || t.id === norm || t.name.toLowerCase() === norm);
  
  // 2. Интеллектуальный поиск по ключевым словам и весам совпадений
  if (!matchedTool) {
    let bestScore = 0;
    
    CATALOG_TOOLS.forEach(tool => {
      let score = 0;
      const toolNorm = tool.name.toLowerCase();
      
      // Специфичные признаки корейской опалубки (размеры щитов)
      if (tool.id === 'euro_600' && (norm.includes('600') || norm.includes('600х1200') || norm.includes('600x1200'))) score += 10;
      if (tool.id === 'euro_500' && (norm.includes('500') || norm.includes('500х1200') || norm.includes('500x1200'))) score += 10;
      if (tool.id === 'euro_400' && (norm.includes('400') || norm.includes('400х1200') || norm.includes('400x1200'))) score += 10;
      if (tool.id === 'euro_300' && (norm.includes('300') || norm.includes('300х1200') || norm.includes('300x1200'))) score += 10;
      
      // Общие ключевые слова для щитов
      if (tool.id.startsWith('euro_') && (norm.includes('щит') || norm.includes('euroform') || norm.includes('евроформ'))) score += 3;
      
      // Угловые корейские элементы
      if (tool.id === 'euro_in_corner' && (norm.includes('внутр') || norm.includes('in-corner') || norm.includes('внутренний угол') || norm.includes('внутренний'))) score += 12;
      if (tool.id === 'euro_out_corner' && (norm.includes('внеш') || norm.includes('наруж') || norm.includes('out-corner') || norm.includes('внешний угол') || norm.includes('уголок внешний'))) score += 12;
      
      // Крепеж
      if (tool.id === 'wedge_pin' && (norm.includes('клин') || norm.includes('пин') || norm.includes('крепеж') || norm.includes('клин+пин') || norm.includes('wedge') || norm.includes('pin'))) score += 10;
      
      // Стяжки
      if (tool.id === 'flat_tie_300' && (norm.includes('стяжк') || norm.includes('плоск') || norm.includes('flat tie') || norm.includes('tie'))) score += 10;
      
      // Крючки для труб
      if (tool.id === 'pipe_hook' && (norm.includes('крюч') || norm.includes('крюк') || norm.includes('hook') || norm.includes('труб') || norm.includes('pipe hook'))) score += 10;
      
      // Опорные стойки
      if (tool.id === 'support_post_3m' && (norm.includes('стойк') || norm.includes('домкрат') || norm.includes('опорн') || norm.includes('телескоп') || norm.includes('post'))) score += 10;
      
      // Оборудование
      if (tool.id === 'concrete_mixer' && (norm.includes('бетономешал') || norm.includes('бетоносмесител') || norm.includes('мешал') || norm.includes('mixer'))) score += 10;
      if (tool.id === 'concrete_vibrator' && (norm.includes('вибратор') || norm.includes('вибро') || norm.includes('vibrator'))) score += 10;
      if (tool.id === 'rotary_hammer' && (norm.includes('перфоратор') || norm.includes('sds') || norm.includes('hammer'))) score += 10;
      if (tool.id === 'angle_grinder' && (norm.includes('болгарка') || norm.includes('шлифмашин') || norm.includes('grinder'))) score += 10;
      if (tool.id === 'generator_5kw' && (norm.includes('генератор') || norm.includes('бензиновый') || norm.includes('generator'))) score += 10;
      
      // Поиск по пересечению токенов слов
      const words = toolNorm.split(/[\s,().]+/);
      words.forEach(w => {
        if (w.length > 3 && norm.includes(w)) {
          score += 1.5;
        }
      });
      
      if (score > bestScore) {
        bestScore = score;
        matchedTool = tool;
      }
    });
    
    // Порог соответствия, чтобы не сопоставить мусорные строки
    if (bestScore < 3.5) {
      matchedTool = undefined;
    }
  }
  
  if (!matchedTool) return null;
  
  const weightPerUnit = parseFloat(matchedTool.specs['Вес'] || '0');
  
  return {
    id: matchedTool.id,
    name: matchedTool.name,
    russianName: matchedTool.name,
    quantity: qty,
    unit: matchedTool.unit,
    weightPerUnit: weightPerUnit,
    pricePerDay: matchedTool.pricePerDay,
    depositPerUnit: matchedTool.deposit,
    totalPrice: matchedTool.pricePerDay * qty * days,
    totalDeposit: matchedTool.deposit * qty,
    totalWeight: weightPerUnit * qty
  };
};

// Универсальный парсер любого текстового, табличного или JSON формата проектов
const parseAnyProjectFormat = (fileContent: string, fileName: string): ProjectCalculation[] => {
  let cleanContent = fileContent.replace(/^\uFEFF/, '').trim();
  
  // 1. Попытка стандартного JSON импорта
  try {
    let jsonContent = cleanContent;
    // Очистка комментариев и хвостовых запятых
    jsonContent = jsonContent.replace(/\/\/.*/g, '');
    jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '');
    jsonContent = jsonContent.replace(/,\s*([\]}])/g, '$1');
    
    if (jsonContent.startsWith('{') || jsonContent.startsWith('[')) {
      const parsed = JSON.parse(jsonContent);
      const rawArray = Array.isArray(parsed) ? parsed : [parsed];
      const validProjects: ProjectCalculation[] = [];
      
      rawArray.forEach((p: any) => {
        if (p && typeof p === 'object') {
          const name = p.name || p.projectName || p.title || fileName.replace(/\.[^/.]+$/, "");
          const durationDays = typeof p.durationDays === 'number' ? p.durationDays : (typeof p.days === 'number' ? p.days : parseInt(p.durationDays || p.days) || 3);
          
          let results: FormworkRequirement[] = [];
          if (Array.isArray(p.results)) {
            results = p.results.map((r: any) => {
              const qty = typeof r.quantity === 'number' ? r.quantity : parseFloat(r.quantity) || 0;
              const wUnit = typeof r.weightPerUnit === 'number' ? r.weightPerUnit : parseFloat(r.weightPerUnit) || 0;
              const pDay = typeof r.pricePerDay === 'number' ? r.pricePerDay : parseFloat(r.pricePerDay) || 0;
              const dUnit = typeof r.depositPerUnit === 'number' ? r.depositPerUnit : parseFloat(r.depositPerUnit) || 0;
              return {
                id: String(r.id || ''),
                name: String(r.name || ''),
                russianName: String(r.russianName || r.name || ''),
                quantity: qty,
                unit: String(r.unit || 'шт.'),
                weightPerUnit: wUnit,
                pricePerDay: pDay,
                depositPerUnit: dUnit,
                totalPrice: pDay * qty * durationDays,
                totalDeposit: dUnit * qty,
                totalWeight: wUnit * qty
              };
            });
          } else if (Array.isArray(p.items || p.equipment || p.tools)) {
            const itemsList = p.items || p.equipment || p.tools;
            itemsList.forEach((item: any) => {
              const parsedItem = matchItemToCatalog(item.name || item.title || item.id || '', item.quantity || item.qty || item.count || 0, durationDays);
              if (parsedItem) results.push(parsedItem);
            });
          } else {
            // Проверка плоского ассоциативного массива { toolId: quantity }
            Object.entries(p).forEach(([key, val]) => {
              if (typeof val === 'number') {
                const parsedItem = matchItemToCatalog(key, val, durationDays);
                if (parsedItem) results.push(parsedItem);
              }
            });
          }
          
          if (results.length > 0) {
            validProjects.push({
              id: p.id || 'proj_' + Math.floor(Math.random() * 1000000) + '_' + Date.now(),
              name: String(name),
              createdAt: p.createdAt || new Date().toISOString(),
              structureType: p.structureType || 'walls',
              dimensions: p.dimensions || { length: 0, height: 0, internalCornersCount: 0, externalCornersCount: 0 },
              durationDays: durationDays,
              results: results,
              photos: Array.isArray(p.photos) ? p.photos.map((u: any) => String(u)) : []
            });
          }
        }
      });
      
      if (validProjects.length > 0) {
        return validProjects;
      }
    }
  } catch (e) {
    console.log("JSON парсинг не удался или пропущен. Переходим к текстовым/табличным форматам.");
  }

  // 2. Обработка как CSV, TSV или произвольный текст (строка за строкой)
  const lines = cleanContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  let projectName = fileName.replace(/\.[^/.]+$/, "");
  let durationDays = 3;
  const results: FormworkRequirement[] = [];

  // Сначала вытаскиваем мета-параметры из всего файла
  lines.forEach((line) => {
    const nameMatch = line.match(/^(?:проект|название|имя|наименование|проектный расчет|тема|имя проекта|название проекта|project|name|title)\s*[:=]\s*(.+)$/i);
    if (nameMatch) {
      projectName = nameMatch[1].replace(/['"«»]/g, '').trim();
      return;
    }
    
    const daysMatch = line.match(/(?:срок|дни|дней|дн|период|duration|days|period|сутки|суток)\s*[:=]\s*(\d+)/i) || 
                      line.match(/(\d+)\s*(?:день|дня|дней|дн|суток|сутки|days)/i);
    if (daysMatch) {
      const parsedDays = parseInt(daysMatch[1]);
      if (parsedDays > 0) {
        durationDays = parsedDays;
      }
    }
  });

  // Теперь парсим элементы по каждой строке
  lines.forEach((line) => {
    // Пропускаем служебные строки спецификации
    if (/^(?:проект|название|имя|наименование|срок|дни|дней|период|итого|вес|залог|транспорт|рекомендуемый|======|------)/i.test(line)) {
      return;
    }

    let qty = 0;
    let textToMatch = line;

    // Специфический разбор колоночного формата (CSV/Таблица с ; или , или табуляцией)
    if (line.includes(';') || line.includes(',') || line.includes('\t')) {
      const separators = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
      const parts = line.split(separators).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length >= 2) {
        let parsedQty = 0;
        let namePart = '';
        
        parts.forEach(part => {
          const num = parseInt(part);
          // Исключаем размеры щитов из обнаружения как количества
          if (!isNaN(num) && num > 0 && num < 100000 && !['600', '1200', '500', '400', '300', '100', '50', '180', '1350', '1500', '230', '220'].includes(part)) {
            parsedQty = num;
          } else if (part.length > namePart.length && isNaN(Number(part))) {
            namePart = part;
          }
        });
        
        if (parsedQty > 0 && namePart.length > 2) {
          qty = parsedQty;
          textToMatch = namePart;
        }
      }
    }

    // Если колоночный парсинг не сработал, разбираем как естественный язык/список
    if (qty === 0) {
      // Ищем паттерны: "имя [разделители] число" или "число [разделители] имя"
      const qtyMatch = line.match(/(?:кол-во|количество|кол|qty|count|x|:|-|\s)\s*(\d+)\s*(?:шт|сутки|компл|ед|суток|pcs|units|kg|кг)?$/i) || 
                       line.match(/(?:^|\s)(\d+)\s*(?:шт|компл|ед|pcs)?\s*[-—:]?\s*(.+)$/i);

      if (qtyMatch) {
        if (line.startsWith(qtyMatch[1])) {
          qty = parseInt(qtyMatch[1]);
          textToMatch = qtyMatch[2];
        } else {
          qty = parseInt(qtyMatch[1]);
          textToMatch = line.slice(0, line.lastIndexOf(qtyMatch[1]));
        }
      } else {
        // Ищем любое число, не похожее на размеры щитов
        const numbers = line.match(/\b\d+\b/g);
        if (numbers && numbers.length > 0) {
          const nonDimNumbers = numbers.filter(num => !['600', '1200', '500', '400', '300', '100', '50', '180', '1350', '1500', '230', '220'].includes(num));
          if (nonDimNumbers.length > 0) {
            qty = parseInt(nonDimNumbers[nonDimNumbers.length - 1]);
          } else {
            qty = parseInt(numbers[numbers.length - 1]);
          }
        }
      }
    }

    // Очищаем оставшийся текст от знаков препинания в начале/конце
    textToMatch = textToMatch.replace(/^[-\s*•+]+/g, '').replace(/['"«»]/g, '').trim();
    if (textToMatch.length < 3 || qty <= 0) return;

    const matchedItem = matchItemToCatalog(textToMatch, qty, durationDays);
    if (matchedItem) {
      const existing = results.find(r => r.id === matchedItem.id);
      if (existing) {
        existing.quantity += matchedItem.quantity;
        existing.totalPrice = existing.pricePerDay * existing.quantity * durationDays;
        existing.totalDeposit = existing.depositPerUnit * existing.quantity;
        existing.totalWeight = existing.weightPerUnit * existing.quantity;
      } else {
        results.push(matchedItem);
      }
    }
  });

  if (results.length > 0) {
    return [{
      id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: projectName,
      createdAt: new Date().toISOString(),
      structureType: 'walls',
      dimensions: { length: 0, height: 0, internalCornersCount: 0, externalCornersCount: 0 },
      durationDays: durationDays,
      results: results,
      photos: []
    }];
  }

  return [];
};

// Вспомогательная функция для сжатия изображения перед сохранением
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const max_width = 1000;
        const max_height = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > max_width) {
            height = Math.round((height * max_width) / width);
            width = max_width;
          }
        } else {
          if (height > max_height) {
            width = Math.round((width * max_height) / height);
            height = max_height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function ProjectManager({ 
  projects, 
  onDeleteProject, 
  onUpdateProject,
  onAddAllProjectsToCart,
  onImportProjects,
  onLoadToCalculator
}: ProjectManagerProps) {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [cartAddedNotification, setCartAddedNotification] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  // Состояния для ручного ввода и распознавания проектов
  const [isRecognizeModalOpen, setIsRecognizeModalOpen] = useState(false);
  const [recognizeText, setRecognizeText] = useState('');
  const [recognizeProjectName, setRecognizeProjectName] = useState('Новый расчет');
  const [recognizeDays, setRecognizeDays] = useState(3);

  // Получить превью распознанных элементов в реальном времени
  const getRecognizedPreview = (): FormworkRequirement[] => {
    if (!recognizeText.trim()) return [];
    
    const lines = recognizeText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const results: FormworkRequirement[] = [];

    lines.forEach((line) => {
      if (/^(?:проект|название|имя|наименование|срок|дни|дней|период|итого|вес|залог|транспорт|рекомендуемый|======|------)/i.test(line)) {
        return;
      }

      let qty = 0;
      let textToMatch = line;

      if (line.includes(';') || line.includes(',') || line.includes('\t')) {
        const separators = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
        const parts = line.split(separators).map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length >= 2) {
          let parsedQty = 0;
          let namePart = '';
          
          parts.forEach(part => {
            const num = parseInt(part);
            if (!isNaN(num) && num > 0 && num < 100000 && !['600', '1200', '500', '400', '300', '100', '50', '180', '1350', '1500', '230', '220'].includes(part)) {
              parsedQty = num;
            } else if (part.length > namePart.length && isNaN(Number(part))) {
              namePart = part;
            }
          });
          
          if (parsedQty > 0 && namePart.length > 2) {
            qty = parsedQty;
            textToMatch = namePart;
          }
        }
      }

      if (qty === 0) {
        const qtyMatch = line.match(/(?:кол-во|количество|кол|qty|count|x|:|-|\s)\s*(\d+)\s*(?:шт|сутки|компл|ед|суток|pcs|units|kg|кг)?$/i) || 
                         line.match(/(?:^|\s)(\d+)\s*(?:шт|компл|ед|pcs)?\s*[-—:]?\s*(.+)$/i);

        if (qtyMatch) {
          if (line.startsWith(qtyMatch[1])) {
            qty = parseInt(qtyMatch[1]);
            textToMatch = qtyMatch[2];
          } else {
            qty = parseInt(qtyMatch[1]);
            textToMatch = line.slice(0, line.lastIndexOf(qtyMatch[1]));
          }
        } else {
          const numbers = line.match(/\b\d+\b/g);
          if (numbers && numbers.length > 0) {
            const nonDimNumbers = numbers.filter(num => !['600', '1200', '500', '400', '300', '100', '50', '180', '1350', '1500', '230', '220'].includes(num));
            if (nonDimNumbers.length > 0) {
              qty = parseInt(nonDimNumbers[nonDimNumbers.length - 1]);
            } else {
              qty = parseInt(numbers[numbers.length - 1]);
            }
          }
        }
      }

      textToMatch = textToMatch.replace(/^[-\s*•+]+/g, '').replace(/['"«»]/g, '').trim();
      if (textToMatch.length < 3 || qty <= 0) return;

      const matchedItem = matchItemToCatalog(textToMatch, qty, recognizeDays);
      if (matchedItem) {
        const existing = results.find(r => r.id === matchedItem.id);
        if (existing) {
          existing.quantity += matchedItem.quantity;
          existing.totalPrice = existing.pricePerDay * existing.quantity * recognizeDays;
          existing.totalDeposit = existing.depositPerUnit * existing.quantity;
          existing.totalWeight = existing.weightPerUnit * existing.quantity;
        } else {
          results.push(matchedItem);
        }
      }
    });

    return results;
  };

  const handleRecognizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results = getRecognizedPreview();
    if (results.length === 0) {
      alert("Не удалось распознать элементы. Пожалуйста, введите наименования и количества (например: 'Щит 600 - 20 шт')");
      return;
    }

    const newProject: ProjectCalculation = {
      id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: recognizeProjectName.trim() || 'Распознанный проект',
      createdAt: new Date().toISOString(),
      structureType: 'walls',
      dimensions: { length: 0, height: 0, internalCornersCount: 0, externalCornersCount: 0 },
      durationDays: recognizeDays,
      results: results,
      photos: []
    };

    onImportProjects([newProject]);
    setImportSuccess(`Успешно распознано и создано: ${results.length} наим.`);
    setTimeout(() => setImportSuccess(null), 3000);
    setIsRecognizeModalOpen(false);
    setRecognizeText('');
    setRecognizeProjectName('Новый расчет');
    setRecognizeDays(3);
  };

  // Состояния для распознавания изображения по API
  const [isRecognizingImage, setIsRecognizingImage] = useState(false);
  const [imageRecognizeError, setImageRecognizeError] = useState<string | null>(null);

  const handleImageRecognize = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRecognizingImage(true);
    setImageRecognizeError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const response = await fetch('/api/recognize-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: file.type,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось распознать изображение.');
      }

      let text = data.text || '';
      
      const projectMatch = text.match(/^Проект:\s*(.+)$/m);
      if (projectMatch) {
        setRecognizeProjectName(projectMatch[1].trim());
        text = text.replace(/^Проект:\s*(.+)$/m, '');
      }
      
      const durationMatch = text.match(/^Срок:\s*(\d+)/m);
      if (durationMatch) {
        setRecognizeDays(Math.max(1, parseInt(durationMatch[1]) || 3));
        text = text.replace(/^Срок:\s*(\d+)/m, '');
      }

      setRecognizeText(text.trim());
      setImportSuccess("Изображение успешно распознано!");
      setTimeout(() => setImportSuccess(null), 3000);

    } catch (err: any) {
      console.error(err);
      setImageRecognizeError(err.message || 'Ошибка распознавания изображения.');
      setTimeout(() => setImageRecognizeError(null), 6000);
    } finally {
      setIsRecognizingImage(false);
      e.target.value = '';
    }
  };

  const handlePhotoUpload = async (proj: ProjectCalculation, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);
      const currentPhotos = proj.photos || [];
      const updatedPhotos = [...currentPhotos, compressedBase64];
      
      const updatedProj: ProjectCalculation = {
        ...proj,
        photos: updatedPhotos
      };
      
      onUpdateProject(updatedProj);
    } catch (error) {
      console.error("Ошибка при сжатии и загрузке фото", error);
    }
    e.target.value = ''; // Сброс инпута
  };

  const handleRemovePhoto = (proj: ProjectCalculation, indexToRemove: number) => {
    const currentPhotos = proj.photos || [];
    const updatedPhotos = currentPhotos.filter((_, idx) => idx !== indexToRemove);
    
    const updatedProj: ProjectCalculation = {
      ...proj,
      photos: updatedPhotos
    };
    
    onUpdateProject(updatedProj);
  };

  // Сводный расчет оборудования по ВСЕМ проектам
  const getCombinedRequirements = (): FormworkRequirement[] => {
    const combined: { [key: string]: Omit<FormworkRequirement, 'totalPrice' | 'totalDeposit' | 'totalWeight'> & { quantity: number } } = {};

    projects.forEach((proj) => {
      proj.results.forEach((item) => {
        if (!combined[item.id]) {
          combined[item.id] = {
            id: item.id,
            name: item.name,
            russianName: item.russianName,
            quantity: 0,
            unit: item.unit,
            weightPerUnit: item.weightPerUnit,
            pricePerDay: item.pricePerDay,
            depositPerUnit: item.depositPerUnit,
          };
        }
        combined[item.id].quantity += item.quantity;
      });
    });

    return Object.values(combined).map((item) => {
      // Ищем максимальное количество дней среди проектов, содержащих этот элемент, или средневзвешенное.
      // Для простоты, берем максимальный срок аренды среди проектов, содержащих этот элемент, либо рассчитываем по каждому проекту отдельно и суммируем итоговые стоимости.
      let totalPrice = 0;
      let totalDeposit = 0;
      let totalWeight = item.quantity * item.weightPerUnit;

      projects.forEach((proj) => {
        const projItem = proj.results.find((i) => i.id === item.id);
        if (projItem) {
          totalPrice += projItem.totalPrice;
          totalDeposit += projItem.totalDeposit;
        }
      });

      return {
        ...item,
        totalPrice,
        totalDeposit,
        totalWeight,
      };
    });
  };

  const combinedItems = getCombinedRequirements();

  // Общие показатели по всем проектам
  const totalCombinedWeight = combinedItems.reduce((acc, item) => acc + item.totalWeight, 0);
  const totalCombinedRent = combinedItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalCombinedDeposit = combinedItems.reduce((acc, item) => acc + item.totalDeposit, 0);

  // Выбор транспорта
  const getRequiredTransport = (weightKg: number) => {
    const tons = weightKg / 1000;
    if (tons === 0) return { name: 'Нет груза', capacity: '0 т', icon: '🚗', desc: 'Доставка не требуется' };
    if (tons <= 1.5) return { name: 'Газель Борт', capacity: 'до 1.5 т', icon: '🚛', desc: 'Отличный вариант для небольших фундаментов и комплектующих.' };
    if (tons <= 5) return { name: 'Грузовик Валдай / ЗИЛ', capacity: 'до 5.0 т', icon: '🚛', desc: 'Подходит для средних по объему фундаментов.' };
    if (tons <= 10) return { name: 'Манипулятор КамАЗ', capacity: 'до 10 т', icon: '🚚', desc: 'Удобен тем, что сам разгрузит щиты на строительной площадке.' };
    return { name: 'Длинномер (Фура) + Кран', capacity: 'до 20 т', icon: '🚒', desc: 'Для крупных объемов. Требуется автокран для разгрузки.' };
  };

  const transport = getRequiredTransport(totalCombinedWeight);

  // Генерация текстовой спецификации для копирования
  const generateTextSpec = () => {
    let text = `==================================================\n`;
    text += `СВОДНАЯ СПЕЦИФИКАЦИЯ КОРЕЙСКОЙ ОПАЛУБКИ (EUROFORM)\n`;
    text += `==================================================\n`;
    text += `Количество сохраненных проектов: ${projects.length}\n`;
    projects.forEach((p, idx) => {
      text += `  ${idx + 1}. ${p.name} (${p.durationDays} дн.) — тип: ${p.structureType}\n`;
    });
    text += `--------------------------------------------------\n`;
    text += `ОБОРУДОВАНИЕ И КРЕПЕЖ:\n`;
    text += `--------------------------------------------------\n`;
    
    combinedItems.forEach((item) => {
      text += `- ${item.russianName}: ${item.quantity} ${item.unit} (Вес: ${item.totalWeight.toFixed(1)} кг)\n`;
    });
    
    text += `--------------------------------------------------\n`;
    text += `ФИНАНСОВЫЕ И ЛОГИСТИЧЕСКИЕ ПОКАЗАТЕЛИ:\n`;
    text += `--------------------------------------------------\n`;
    text += `Общий вес оборудования: ${totalCombinedWeight.toLocaleString()} кг (${(totalCombinedWeight / 1000).toFixed(2)} т)\n`;
    text += `Рекомендуемый транспорт: ${transport.name} (${transport.capacity})\n`;
    text += `Суммарный обеспечительный залог: ${totalCombinedDeposit.toLocaleString()} сом (возвращается)\n`;
    text += `Итоговая стоимость аренды (за все периоды): ${totalCombinedRent.toLocaleString()} сом\n`;
    text += `==================================================\n`;
    text += `Рассчитано на сервисе "Аренда инструментов и опалубки"\n`;
    
    return text;
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(generateTextSpec());
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddAll = () => {
    onAddAllProjectsToCart();
    setCartAddedNotification(true);
    setTimeout(() => setCartAddedNotification(false), 3000);
  };

  const handleExportJSON = () => {
    if (projects.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arenda_stroy_projects_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        if (!fileContent || fileContent.trim() === '') {
          throw new Error("Файл пуст.");
        }
        
        const validProjects = parseAnyProjectFormat(fileContent, file.name);

        if (validProjects.length === 0) {
          setImportError("Не удалось распознать оборудование в файле. Проверьте содержимое.");
          setTimeout(() => setImportError(null), 4000);
          return;
        }

        onImportProjects(validProjects);
        setImportSuccess(`Успешно импортировано: ${validProjects.length} прокт(ов)`);
        setTimeout(() => setImportSuccess(null), 3500);
      } catch (err) {
        setImportError("Ошибка при чтении файла. Убедитесь, что это текстовый файл, CSV или JSON.");
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-8" id="project-manager-section">
      {/* Уведомления об импорте */}
      {importSuccess && (
        <div className="fixed bottom-6 right-6 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/30 z-50 flex items-center gap-3 animate-fade-in animate-duration-300">
          <div className="p-1 bg-emerald-500 rounded-full">
            <Check className="w-4 h-4 text-black stroke-[3]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Успешный импорт</span>
            <span className="text-sm font-black text-emerald-400">{importSuccess}</span>
          </div>
        </div>
      )}

      {importError && (
        <div className="fixed bottom-6 right-6 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-red-500/30 z-50 flex items-center gap-3 animate-fade-in animate-duration-300">
          <div className="p-1 bg-red-500 rounded-full">
            <X className="w-4 h-4 text-black stroke-[3]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Ошибка импорта</span>
            <span className="text-sm font-black text-red-400">{importError}</span>
          </div>
        </div>
      )}

      {/* Список сохраненных проектов */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Левая часть: список проектов */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2 font-display uppercase tracking-tight">
              <Calculator className="w-5 h-5 text-orange-500" />
              Сохраненные расчеты ({projects.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                accept=".json,.csv,.txt,.tsv"
                id="import-projects-input"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="import-projects-input"
                className="text-xs font-black text-slate-300 border border-slate-850 hover:border-slate-700 hover:text-white bg-slate-950 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xl"
                title="Загрузить расчеты в любом формате: JSON, CSV, TSV или простой текст"
              >
                <Upload className="w-4 h-4 text-orange-500" />
                Импорт файлов
              </label>

              <button
                onClick={() => setIsRecognizeModalOpen(true)}
                className="text-xs font-black text-slate-300 border border-slate-850 hover:border-slate-700 hover:text-white bg-slate-950 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xl"
                title="Распознать и импортировать текстовый список опалубки"
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                Распознать текст
              </button>

              {projects.length > 0 && (
                <>
                  <button
                    onClick={handleExportJSON}
                    className="text-xs font-black text-slate-300 border border-slate-850 hover:border-slate-700 hover:text-white bg-slate-950 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xl"
                  >
                    <Download className="w-4 h-4 text-orange-500" />
                    Экспорт JSON
                  </button>
                  <button
                    onClick={handleAddAll}
                    className="text-xs font-black text-black bg-orange-500 hover:bg-orange-600 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-md shadow-orange-500/10"
                    id="btn-add-all-projects-to-cart"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    {cartAddedNotification ? 'Отправлено!' : 'В корзину'}
                  </button>
                </>
              )}
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 p-10 text-center text-slate-400 backdrop-blur-md relative overflow-hidden">
              <div className="bento-glow w-64 h-64 bg-orange-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="max-w-md mx-auto space-y-4 relative z-10">
                <Layers className="w-12 h-12 text-slate-700 mx-auto" />
                <h3 className="font-bold text-white text-base font-display uppercase tracking-wider">Нет сохраненных расчетов</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Вы можете загрузить проект в любом формате (JSON, CSV, таблица Excel или обычный текстовый список оборудования) или создать новый расчет в калькуляторе.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <label
                    htmlFor="import-projects-input"
                    className="inline-flex text-xs font-black text-black bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-xl transition-all items-center gap-2 cursor-pointer uppercase tracking-wider shadow-md shadow-orange-500/10"
                  >
                    <Upload className="w-4 h-4" />
                    Загрузить файл
                  </label>
                  <button
                    onClick={() => setIsRecognizeModalOpen(true)}
                    className="inline-flex text-xs font-black text-slate-300 border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:text-white px-5 py-3 rounded-xl transition-all items-center gap-2 cursor-pointer uppercase tracking-wider shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Вставить текст
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => {
                const projWeight = proj.results.reduce((sum, item) => sum + item.totalWeight, 0);
                const projRent = proj.results.reduce((sum, item) => sum + item.totalPrice, 0);
                const projDeposit = proj.results.reduce((sum, item) => sum + item.totalDeposit, 0);

                return (
                  <div key={proj.id} className="bg-[#090d16]/75 rounded-3xl border border-slate-900 overflow-hidden shadow-xl hover:border-slate-800 transition-all backdrop-blur-md">
                    {/* Шапка проекта */}
                    <div className="px-5 py-4 bg-slate-950/40 border-b border-slate-900/80 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-black text-white text-sm flex items-center gap-2 font-display uppercase tracking-wide">
                          <Layers className="w-4 h-4 text-orange-500" />
                          {proj.name}
                        </h3>
                        <div className="flex gap-4 text-[10px] text-slate-400 mt-1.5 flex-wrap font-bold uppercase tracking-wider">
                          <span>Конструкция: <strong className="text-orange-400">
                            {proj.structureType === 'walls' && 'Стены'}
                            {proj.structureType === 'foundation_strip' && 'Ленточный фундамент'}
                            {proj.structureType === 'foundation_slab' && 'Плитный фундамент'}
                            {proj.structureType === 'columns' && 'Колонны'}
                          </strong></span>
                          <span>Период: <strong className="text-orange-400">{proj.durationDays} дн.</strong></span>
                          <span>Дата расчета: <strong className="text-slate-300">{new Date(proj.createdAt).toLocaleDateString()}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onLoadToCalculator(proj)}
                          className="text-orange-400 hover:text-orange-300 p-2.5 hover:bg-orange-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-orange-500/20 flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider"
                          title="Открыть параметры в калькуляторе"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">В калькулятор</span>
                        </button>
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="text-red-400 hover:text-red-300 p-2.5 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                          title="Удалить проект"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Краткая информация по материалам проекта */}
                    <div className="p-4 grid grid-cols-3 gap-3 bg-slate-950/10 border-b border-slate-900/50">
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Вес опалубки</span>
                        <span className="text-sm font-extrabold text-white font-mono">{(projWeight / 1000).toFixed(2)} т</span>{' '}
                        <span className="text-slate-500 text-[10px] font-mono">({projWeight} кг)</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Сумма залога</span>
                        <span className="text-sm font-extrabold text-white font-mono">{projDeposit.toLocaleString()} сом</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Стоимость аренды</span>
                        <span className="text-sm font-black text-orange-400 font-mono">{projRent.toLocaleString()} сом</span>
                      </div>
                    </div>

                    {/* Таблица спецификации по этому проекту */}
                    <div className="px-5 py-3.5 bg-slate-950/30 text-xs space-y-2">
                      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Спецификация комплектующих Euroform:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 font-medium text-slate-300">
                        {proj.results.map((r) => (
                          <div key={r.id} className="flex justify-between border-b border-slate-900 pb-1.5 items-center">
                            <span className="truncate max-w-[180px] sm:max-w-xs flex items-center gap-1">
                              <CornerDownRight className="w-3.5 h-3.5 text-orange-500/60 shrink-0" />
                              {r.russianName}
                            </span>
                            <span className="font-extrabold text-white font-mono">{r.quantity} {r.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Фотографии и эскизы проекта */}
                    <div className="px-5 py-4 border-t border-slate-900/60 bg-slate-950/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-orange-500" />
                          Фотографии и эскизы ({proj.photos?.length || 0})
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Максимум 5 снимков
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                        {proj.photos && proj.photos.map((photo, pIdx) => (
                          <div 
                            key={pIdx} 
                            className="aspect-square bg-slate-950 border border-slate-900 rounded-xl overflow-hidden relative group"
                          >
                            <img 
                              src={photo} 
                              alt={`Фото объекта ${pIdx + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                              onClick={() => setActivePhotoUrl(photo)}
                              referrerPolicy="no-referrer"
                            />
                            <button
                              onClick={() => handleRemovePhoto(proj, pIdx)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md"
                              title="Удалить фото"
                            >
                              <X className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                        ))}

                        {(!proj.photos || proj.photos.length < 5) && (
                          <label className="aspect-square bg-slate-950/40 hover:bg-slate-950/80 border border-dashed border-slate-800 hover:border-orange-500/40 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group">
                            <Upload className="w-4 h-4 text-slate-500 group-hover:text-orange-500 transition-colors" />
                            <span className="text-[8px] font-extrabold text-slate-500 group-hover:text-slate-300 uppercase tracking-wider">
                              Добавить
                            </span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handlePhotoUpload(proj, e)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Правая часть: Сводная ведомость */}
        {projects.length > 0 && (
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-[#090d16]/75 rounded-3xl border border-slate-900 shadow-xl overflow-hidden backdrop-blur-md relative">
              <div className="bento-glow w-48 h-48 bg-orange-500/5 -top-10 -right-10"></div>
              
              <div className="p-5 bg-gradient-to-r from-slate-900 to-orange-950/10 border-b border-slate-900">
                <span className="text-[10px] uppercase font-black text-orange-500 tracking-wider font-mono">Сводная ведомость по объекту</span>
                <h3 className="text-lg font-black text-white mt-1 font-display">
                  Общая потребность в опалубке
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                  Объединенные данные по всем {projects.length} сохраненным проектам для заказа.
                </p>
              </div>

              {/* Детализация сводного оборудования */}
              <div className="divide-y divide-slate-900 max-h-[350px] overflow-y-auto">
                {combinedItems.map((item) => (
                  <div key={item.id} className="px-5 py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-white block">{item.russianName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Арт: {item.id}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white text-xs bg-slate-950 border border-slate-900 px-2 py-1 rounded-lg font-mono">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">Вес: {item.totalWeight.toFixed(1)} кг</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Итоговые метрики */}
              <div className="p-5 bg-slate-950/30 border-t border-slate-900 space-y-4 relative z-10">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Суммарный вес оборудования:</span>
                    <strong className="text-white font-extrabold font-mono">{(totalCombinedWeight / 1000).toFixed(2)} т ({(totalCombinedWeight).toLocaleString()} кг)</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Требуемый залог (возвратный):</span>
                    <strong className="text-white font-extrabold font-mono">{totalCombinedDeposit.toLocaleString()} сом</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Общая аренда за все дни:</span>
                    <strong className="text-orange-400 font-black font-mono text-sm">{totalCombinedRent.toLocaleString()} сом</strong>
                  </div>
                </div>

                {/* Блок доставки */}
                <div className="bg-slate-950/80 rounded-2xl border border-slate-900 p-3.5 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-xl text-orange-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="font-extrabold text-white block uppercase text-[10px] tracking-wider mb-1">Рекомендация по доставке</span>
                    <span className="leading-relaxed font-medium block">{transport.desc} Для данного объема необходим <strong className="text-orange-400 font-black">{transport.name} ({transport.capacity})</strong>.</span>
                  </div>
                </div>

                {/* Действия с ведомостью */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleCopySpec}
                    className="py-3 px-3 border border-slate-800 rounded-xl text-xs font-black text-slate-300 bg-slate-950 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    {copiedNotification ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="py-3 px-3 border border-slate-800 rounded-xl text-xs font-black text-slate-300 bg-slate-950 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Печать PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно просмотра фотографии в полном размере (Lightbox) */}
      {activePhotoUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in animate-duration-200"
          onClick={() => setActivePhotoUrl(null)}
        >
          <button 
            onClick={() => setActivePhotoUrl(null)}
            className="absolute top-6 right-6 bg-slate-900/80 hover:bg-slate-800 text-white p-3 rounded-2xl border border-slate-800 transition-all cursor-pointer z-50 shadow-2xl"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <img 
            src={activePhotoUrl} 
            alt="Просмотр фотографии" 
            className="max-w-full max-h-[90vh] object-contain rounded-3xl border border-slate-900 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Модальное окно интерактивного распознавания проекта из любого текста */}
      {isRecognizeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-[#0b101d] border border-slate-850 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модального окна */}
            <div className="px-6 py-5 bg-slate-950/60 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <div className="text-left">
                  <h3 className="font-black text-white text-base font-display uppercase tracking-wider">Умное распознавание спецификации</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Вставьте список оборудования в любом виде — система автоматически сопоставит его с каталогом</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRecognizeModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecognizeSubmit} className="p-6 space-y-6">
              {/* Параметры проекта */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Название расчета / Объекта</label>
                  <input
                    type="text"
                    required
                    value={recognizeProjectName}
                    onChange={(e) => setRecognizeProjectName(e.target.value)}
                    placeholder="Например: Жилой дом на Советской"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
                <div className="text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Период аренды (суток)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="365"
                    value={recognizeDays}
                    onChange={(e) => setRecognizeDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Две колонки: Ввод текста и Превью распознавания */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Левая колонка: текстовое поле */}
                <div className="space-y-3 text-left">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Вставьте список оборудования или загрузите JPEG</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        id="recognize-image-input"
                        className="hidden"
                        onChange={handleImageRecognize}
                        disabled={isRecognizingImage}
                      />
                      <label
                        htmlFor="recognize-image-input"
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                          isRecognizingImage
                            ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-slate-950 border-orange-500/20 text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/5"
                        }`}
                        title="Распознать спецификацию или список с фотографии/файла (JPEG/PNG)"
                      >
                        {isRecognizingImage ? (
                          <>
                            <span className="w-2.5 h-2.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                            Обработка...
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5 text-orange-500" />
                            Загрузить фото/JPEG
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {imageRecognizeError && (
                    <div className="text-[10px] font-medium text-red-400 bg-red-950/40 border border-red-900/40 px-3 py-2 rounded-xl animate-fade-in">
                      {imageRecognizeError}
                    </div>
                  )}

                  <textarea
                    rows={10}
                    value={recognizeText}
                    onChange={(e) => setRecognizeText(e.target.value)}
                    placeholder={`Пример ввода:\nЩит опалубки 600 - 45 шт\nУгол внутренний 10 шт\nКрепеж клин-пин 150 шт\nСтойка телескопическая - 25 шт`}
                    className="w-full bg-slate-950/70 border border-slate-900 rounded-2xl p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700 leading-relaxed resize-none h-[220px]"
                  />
                  <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 space-y-1.5">
                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block">Подсказка по формату:</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Вы можете написать список вручную или загрузить фотографию/скан спецификации (JPEG, PNG). Модель на базе ИИ автоматически распознает текст, выделит позиции, количества и мгновенно сопоставит их с каталогом аренды!
                    </p>
                  </div>
                </div>

                {/* Правая колонка: превью */}
                <div className="flex flex-col h-full min-h-[300px] text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Результаты распознавания в реальном времени ({getRecognizedPreview().length})
                  </span>
                  
                  <div className="flex-1 bg-slate-950/40 border border-slate-900/60 rounded-2xl overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto max-h-[320px] p-3 divide-y divide-slate-900">
                      {getRecognizedPreview().length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                          <FileText className="w-8 h-8 text-slate-800" />
                          <p className="text-[10px] leading-relaxed">
                            Начните вводить или вставьте текст слева.<br />Система мгновенно покажет найденное оборудование.
                          </p>
                        </div>
                      ) : (
                        getRecognizedPreview().map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                            <div className="min-w-0">
                              <span className="font-extrabold text-white block truncate">{item.name}</span>
                              <span className="text-[9px] text-slate-500 block font-mono">Вес: {item.weightPerUnit} кг/ед • Залог: {item.depositPerUnit} сом</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono text-orange-400 font-extrabold block">{item.quantity} {item.unit}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{(item.pricePerDay * item.quantity * recognizeDays).toLocaleString()} сом</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {getRecognizedPreview().length > 0 && (
                      <div className="bg-slate-950 p-3.5 border-t border-slate-900/80 grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider">
                        <div>
                          <span className="text-slate-500 block text-[8px]">Общий вес</span>
                          <span className="text-white font-mono text-xs font-black">
                            {(getRecognizedPreview().reduce((s, i) => s + i.totalWeight, 0) / 1000).toFixed(2)} т
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[8px]">Стоимость за {recognizeDays} дн.</span>
                          <span className="text-orange-400 font-mono text-xs font-black">
                            {getRecognizedPreview().reduce((s, i) => s + i.totalPrice, 0).toLocaleString()} сом
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Футер модального окна */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900/80">
                <button
                  type="button"
                  onClick={() => setIsRecognizeModalOpen(false)}
                  className="px-5 py-3 border border-slate-800 rounded-xl text-xs font-black text-slate-400 bg-slate-950 hover:border-slate-700 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={getRecognizedPreview().length === 0}
                  className="px-6 py-3 rounded-xl text-xs font-black text-black bg-orange-500 hover:bg-orange-600 disabled:bg-slate-900 disabled:text-slate-600 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-lg shadow-orange-500/10"
                >
                  <Sparkles className="w-4 h-4" />
                  Создать проект
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
