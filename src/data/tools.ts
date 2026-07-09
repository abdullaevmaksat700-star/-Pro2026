import { Tool, FormworkRequirement, ProjectCalculation } from '../types';

export const CATALOG_TOOLS: Tool[] = [
  // Раздел: Опалубка и комплектующие
  {
    id: 'euro_600',
    name: 'Щит опалубки корейский (Euroform) 600х1200 мм',
    category: 'formwork',
    description: 'Основной щит мелкощитовой опалубки. Каркас из высокопрочной стали, палуба из ламинированной влагостойкой фанеры 12 мм. Применяется для возведения стен, фундаментов и колонн.',
    pricePerDay: 25,
    deposit: 1500,
    unit: 'шт.',
    specs: {
      'Размер': '600 х 1200 мм',
      'Площадь': '0.72 кв.м',
      'Вес': '19.0 кг',
      'Материал каркаса': 'Сталь',
      'Толщина фанеры': '12 мм (береза)'
    }
  },
  {
    id: 'euro_500',
    name: 'Щит опалубки корейский (Euroform) 500х1200 мм',
    category: 'formwork',
    description: 'Доборный щит опалубки. Удобен для подгонки размеров стен и фундаментов под проектные габариты без резки фанеры.',
    pricePerDay: 25,
    deposit: 1400,
    unit: 'шт.',
    specs: {
      'Размер': '500 х 1200 мм',
      'Площадь': '0.60 кв.м',
      'Вес': '17.0 кг',
      'Материал каркаса': 'Сталь'
    }
  },
  {
    id: 'euro_400',
    name: 'Щит опалубки корейский (Euroform) 400х1200 мм',
    category: 'formwork',
    description: 'Доборный щит опалубки средней ширины. Используется для добора длины и формирования колонн сечением 400 мм.',
    pricePerDay: 25,
    deposit: 1300,
    unit: 'шт.',
    specs: {
      'Размер': '400 х 1200 мм',
      'Площадь': '0.48 кв.м',
      'Вес': '14.5 кг',
      'Материал каркаса': 'Сталь'
    }
  },
  {
    id: 'euro_300',
    name: 'Щит опалубки корейский (Euroform) 300х1200 мм',
    category: 'formwork',
    description: 'Узкий доборный щит опалубки. Применяется для точной подгонки, угловых зон и формирования колонн сечением 300 мм.',
    pricePerDay: 25,
    deposit: 1200,
    unit: 'шт.',
    specs: {
      'Размер': '300 х 1200 мм',
      'Площадь': '0.36 кв.м',
      'Вес': '12.0 кг',
      'Материал каркаса': 'Сталь'
    }
  },
  {
    id: 'euro_in_corner',
    name: 'Угол внутренний корейский (In-Corner) 100х100х1200 мм',
    category: 'formwork',
    description: 'Угловой элемент для сборки внутреннего прямого угла опалубочной конструкции стен и ленточных фундаментов.',
    pricePerDay: 25,
    deposit: 1600,
    unit: 'шт.',
    specs: {
      'Размер': '100 х 100 х 1200 мм',
      'Вес': '6.8 кг',
      'Угол': '90 градусов'
    }
  },
  {
    id: 'euro_out_corner',
    name: 'Уголок внешний корейский (Out-Corner) 50х50х1200 мм',
    category: 'formwork',
    description: 'Жесткий угловой профиль для фиксации внешних углов щитов опалубки под углом 90 градусов.',
    pricePerDay: 25,
    deposit: 1000,
    unit: 'шт.',
    specs: {
      'Размер': '50 х 50 х 1200 мм',
      'Вес': '4.2 кг',
      'Материал': 'Оцинкованная сталь'
    }
  },
  {
    id: 'wedge_pin',
    name: 'Комплект крепежа Клин + Пин (Wedge & Pin)',
    category: 'formwork',
    description: 'Быстросъемный крепежный элемент. Клиновидный замок плотно прижимает щиты друг к другу через сквозные технологические отверстия.',
    pricePerDay: 1,
    deposit: 30,
    unit: 'компл.',
    specs: {
      'Комплектация': '1 клин + 1 штырь (пин)',
      'Вес комплекта': '0.15 кг',
      'Материал': 'Закаленная сталь'
    }
  },
  {
    id: 'flat_tie_300',
    name: 'Плоская стяжка (Flat Tie) L-300 мм',
    category: 'formwork',
    description: 'Одноразовый или многоразовый стяжной элемент для фиксации расстояния между противоположными щитами (толщина стены 300 мм).',
    pricePerDay: 2,
    deposit: 50,
    unit: 'шт.',
    specs: {
      'Длина стены': '300 мм',
      'Вес': '0.22 кг',
      'Нагрузка на разрыв': 'до 4.5 тонн'
    }
  },
  {
    id: 'pipe_hook',
    name: 'Крючок для трубы опалубочный (Pipe Hook)',
    category: 'formwork',
    description: 'Применяется для крепления горизонтальных выравнивающих круглых труб диаметром 48.6 мм к каркасу щитов Euroform.',
    pricePerDay: 2,
    deposit: 80,
    unit: 'шт.',
    specs: {
      'Назначение': 'Крепление труб к щиту',
      'Диаметр трубы': '48.6 мм',
      'Вес': '0.35 кг'
    }
  },
  {
    id: 'support_post_3m',
    name: 'Стойка телескопическая домкратная (3.0 м)',
    category: 'formwork',
    description: 'Опорный элемент для удержания вертикальности стен опалубки или в качестве временной подпорки при заливке плит перекрытий.',
    pricePerDay: 15,
    deposit: 800,
    unit: 'шт.',
    specs: {
      'Высота регулировки': '1.7 - 3.0 м',
      'Несущая способность': 'до 2.0 тонн',
      'Вес': '14.5 кг'
    }
  },

  // Раздел: Бетоносмесители и вибраторы
  {
    id: 'concrete_mixer',
    name: 'Бетономешалка электрическая 180 л',
    category: 'concrete',
    description: 'Профессиональный бетоносмеситель гравитационного типа. Идеален для замеса бетонных растворов непосредственно на стройплощадке.',
    pricePerDay: 600,
    deposit: 15000,
    unit: 'сутки',
    specs: {
      'Объем барабана': '180 л',
      'Объем готовой смеси': '115 л',
      'Мощность': '800 Вт',
      'Напряжение': '220 В',
      'Вес': '56 кг'
    }
  },
  {
    id: 'concrete_vibrator',
    name: 'Глубинный вибратор для бетона (рукав 3.0 м)',
    category: 'concrete',
    description: 'Незаменимый инструмент при заливке монолита. Удаляет пузырьки воздуха из свежеуложенного бетона, повышая прочность конструкции.',
    pricePerDay: 450,
    deposit: 8000,
    unit: 'сутки',
    specs: {
      'Мощность': '1500 Вт',
      'Диаметр вибронаконечника': '38 мм',
      'Длина вала (рукава)': '3.0 м',
      'Частота вибрации': '11000 кол/мин'
    }
  },

  // Электроинструмент
  {
    id: 'rotary_hammer',
    name: 'Перфоратор тяжелый SDS-Max',
    category: 'power',
    description: 'Мощный перфоратор для проделывания отверстий в бетоне, штробления и демонтажных работ при установке опалубки.',
    pricePerDay: 700,
    deposit: 12000,
    unit: 'сутки',
    specs: {
      'Энергия удара': '9.0 Дж',
      'Мощность': '1350 Вт',
      'Макс. диаметр бурения': '45 мм',
      'Патрон': 'SDS-Max',
      'Вес': '7.2 кг'
    }
  },
  {
    id: 'angle_grinder',
    name: 'Угловая шлифмашина (Болгарка) 230 мм',
    category: 'power',
    description: 'Предназначена для резки арматуры, зачистки металлических элементов опалубки и других тяжелых отрезных работ.',
    pricePerDay: 350,
    deposit: 5000,
    unit: 'сутки',
    specs: {
      'Диаметр диска': '230 мм',
      'Мощность': '2200 Вт',
      'Обороты': '6600 об/мин',
      'Вес': '5.4 кг'
    }
  },
  {
    id: 'generator_5kw',
    name: 'Бензиновый генератор 5.5 кВт',
    category: 'power',
    description: 'Автономный источник электроэнергии на объектах без подключения к сети. Позволяет питать бетоносмеситель, глубинный вибратор и освещение одновременно.',
    pricePerDay: 1200,
    deposit: 25000,
    unit: 'сутки',
    specs: {
      'Макс. мощность': '5.5 кВт',
      'Номин. мощность': '5.0 кВт',
      'Объем бака': '25 л',
      'Время автономной работы': 'до 9 часов',
      'Выходы': '2 x 220В, 1 x 12В'
    }
  }
];

/**
 * Расчет требуемого количества элементов корейской опалубки (Euroform)
 * по заданным параметрам проекта.
 */
export function calculateFormwork(
  structureType: 'walls' | 'foundation_strip' | 'foundation_slab' | 'columns',
  dims: {
    length: number; // длина стен / периметра в метрах
    height: number; // высота стен / фундамента в метрах
    width?: number;  // толщина стен / ширина плиты в метрах
    thickness?: number; // толщина стен в мм (для выбора стяжек)
    columnCount?: number; // количество колонн
    columnSide?: number;  // сторона колонны в мм
    internalCornersCount: number;
    externalCornersCount: number;
  },
  days: number
): FormworkRequirement[] {
  const requirements: { [key: string]: number } = {};

  // Вспомогательная функция округления вверх
  const up = (val: number) => Math.ceil(val);

  // Инициализируем расчет
  let contactArea = 0; // Площадь контакта щитов
  const heightRows = up(dims.height / 1.2); // Количество рядов щитов по высоте (один ряд = 1.2м)

  if (structureType === 'walls' || structureType === 'foundation_strip') {
    // Для стен и ленточного фундамента опалубка ставится с двух сторон
    const doubleLength = dims.length * 2;
    contactArea = doubleLength * dims.height;

    // Расчет количества щитов:
    // Длина периметра в метрах делится на ширину стандартного щита (0.6м)
    // Учитываем, что часть длины перекрывается углами.
    const columnsCount = up(doubleLength / 0.6);
    const totalPanelsCount = columnsCount * heightRows;

    // Распределение размеров:
    // Обычно 80% - стандартные широкие щиты 600х1200, остальные - доборные (500, 400, 300) для подгонки углов и простенков
    requirements['euro_600'] = up(totalPanelsCount * 0.80);
    requirements['euro_500'] = up(totalPanelsCount * 0.08);
    requirements['euro_400'] = up(totalPanelsCount * 0.06);
    requirements['euro_300'] = up(totalPanelsCount * 0.06);

    // Угловые элементы
    requirements['euro_in_corner'] = dims.internalCornersCount * heightRows;
    requirements['euro_out_corner'] = dims.externalCornersCount * heightRows;

    // Крепеж: Клин-пин (Wedge & Pin)
    // На каждый стык щитов требуется крепление. С боковых сторон щита отверстия каждые 150 мм.
    // На вертикальное ребро щита 1.2м ставится по 3-4 клина с пином.
    // На горизонтальный стык между рядами — по 2 на щит.
    // В среднем на один щит опалубки требуется около 8-10 комплектов клин-пина для жесткого скрепления со всеми соседями.
    const estimatedJoints = totalPanelsCount * 8 + (requirements['euro_in_corner'] + requirements['euro_out_corner']) * 6;
    requirements['wedge_pin'] = up(estimatedJoints * 1.05); // +5% запас

    // Плоские стяжки (Flat Tie)
    // Соединяют противоположные щиты стен. Располагаются каждые 600 мм горизонтально и каждые 300-600 мм вертикально.
    // Примерно 3.5 стяжки на 1 кв.м. стены (с одной стороны), или ~2.5 стяжки на щит.
    // Выбираем стяжку нужной длины. По умолчанию 300 мм.
    const wallThick = dims.thickness || 300;
    const tieKey = `flat_tie_${wallThick}` || 'flat_tie_300';
    // Для простоты расчета используем плоскую стяжку в зависимости от толщины стены.
    // Если толщина другая, мы все равно выдаем standard flat tie, но с соответствующей пометкой в описании.
    const estimatedTies = (dims.length / 0.6) * (dims.height / 0.4);
    requirements['flat_tie_300'] = up(estimatedTies * 1.1); // +10% запас

    // Крючки для выравнивающих труб (Pipe Hooks)
    // Для выравнивания стены используются горизонтальные трубы. Крючки крепят их через щит.
    // На каждый щит приходится примерно 2-3 крючка.
    requirements['pipe_hook'] = up(totalPanelsCount * 2.2);

    // Опорные стойки / Подкосы (Support posts / Diagonal bracing)
    // Ставятся с шагом 1.2 - 1.5 метра с двух сторон стены для обеспечения вертикальности во время заливки
    const bracesCount = up(doubleLength / 1.5);
    requirements['support_post_3m'] = up(bracesCount);

  } else if (structureType === 'foundation_slab') {
    // Плитный фундамент — опалубка ставится по внешнему периметру
    contactArea = dims.length * dims.height; // dims.length - это периметр плиты

    // Считаем по внешнему периметру щиты
    const panelsInRow = up(dims.length / 0.6);
    const totalPanelsCount = panelsInRow * heightRows;

    requirements['euro_600'] = up(totalPanelsCount * 0.85);
    requirements['euro_400'] = up(totalPanelsCount * 0.15); // доборы

    // Для плиты обычно нужны только внешние углы
    requirements['euro_out_corner'] = dims.externalCornersCount * heightRows;
    requirements['euro_in_corner'] = dims.internalCornersCount * heightRows;

    // Крепеж
    const estimatedJoints = totalPanelsCount * 6 + (requirements['euro_out_corner']) * 4;
    requirements['wedge_pin'] = up(estimatedJoints * 1.05);

    // Стяжки для плиты НЕ требуются, так как заливается плоскость. 
    // Вместо этого прочность обеспечивается упорами и стойками в землю.
    requirements['flat_tie_300'] = 0;
    requirements['pipe_hook'] = up(totalPanelsCount * 1.5); // для горизонтальной обвязки

    // Подпорные стойки для упора опалубки в землю (под углом)
    // На каждые 1.2 метра периметра по одному упору
    requirements['support_post_3m'] = up(dims.length / 1.2);

  } else if (structureType === 'columns') {
    // Колонны:Dims.columnCount - количество колонн, dims.columnSide - сторона квадратной колонны в мм
    const count = dims.columnCount || 1;
    const sideMeters = (dims.columnSide || 400) / 1000;
    
    // Колонна имеет 4 стороны. Каждая сторона имеет ширину sideMeters
    // Для сборки колонны используются щиты соответствующего размера.
    // Например, для колонны 400х400 используются щиты 400х1200.
    // На один ряд по высоте требуется 4 щита выбранного номинала.
    const side = dims.columnSide || 400;
    let panelId = 'euro_600';
    if (side <= 300) panelId = 'euro_300';
    else if (side <= 400) panelId = 'euro_400';
    else if (side <= 500) panelId = 'euro_500';

    const panelsPerColumn = 4 * heightRows;
    const totalPanelsCount = panelsPerColumn * count;
    contactArea = 4 * sideMeters * dims.height * count;

    requirements[panelId] = totalPanelsCount;

    // Внешние углы — на каждую колонну идет 4 внешних угла по всей высоте
    requirements['euro_out_corner'] = 4 * heightRows * count;

    // Клин-пины: соединение внешних углов со щитами. 
    // По 4 клина на каждое соединение внешнего угла со щитом по высоте 1.2м.
    // 4 угла * 2 стыка * 4 клина = 32 комплекта на одну колонну высотой 1.2м.
    requirements['wedge_pin'] = 32 * heightRows * count;

    requirements['flat_tie_300'] = 0; // для стандартных колонн до 600мм стяжки не используются (держат внешние уголки и клинья)
    requirements['pipe_hook'] = 0;

    // Каждую колонну нужно зафиксировать вертикально с 4-х сторон с помощью стоек-упоров
    // По 2-4 упора на колонну
    requirements['support_post_3m'] = 4 * count;
  }

  // Преобразуем рассчитанные количества в массив детальных требований с ценами
  const results: FormworkRequirement[] = [];

  Object.entries(requirements).forEach(([id, qty]) => {
    if (qty <= 0) return;

    const toolInfo = CATALOG_TOOLS.find((t) => t.id === id);
    if (!toolInfo) return;

    const weightPerUnit = parseFloat(toolInfo.specs['Вес'] || '0');
    const weight = weightPerUnit * qty;
    const dailyPrice = toolInfo.pricePerDay * qty;
    const rentPrice = dailyPrice * days;
    const deposit = toolInfo.deposit * qty;

    results.push({
      id: toolInfo.id,
      name: toolInfo.name,
      russianName: toolInfo.name,
      quantity: qty,
      unit: toolInfo.unit,
      weightPerUnit: weightPerUnit,
      pricePerDay: toolInfo.pricePerDay,
      depositPerUnit: toolInfo.deposit,
      totalPrice: rentPrice,
      totalDeposit: deposit,
      totalWeight: weight
    });
  });

  return results;
}
