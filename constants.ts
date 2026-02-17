import { Product, ProductCategory, Order, StatCard } from './types';

const DEFAULT_PRICING = (base: number) => ({
  retail: base,
  wholesale: base * 0.95,
  dealer: base * 0.85,
  pricePerMeter: base / 1000 // Approximate
});

const DEFAULT_SEO = (name: string) => ({
  title: `Купить ${name} в Москве`,
  description: `Продажа ${name} от производителя. Низкие цены, доставка.`,
  keywords: ['металл', 'стройка', name.toLowerCase()]
});

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Арматура стальная А500С',
    slug: 'armatura-a500c',
    article: 'ARM-001',
    category: ProductCategory.REBAR,
    pricePerTon: 45000,
    pricePerMeter: 45,
    pricing: DEFAULT_PRICING(45000),
    stock: 120,
    status: 'in_stock',
    steelGrade: 'А500С',
    dimensions: '12мм',
    attributes: [
      { id: '1', name: 'Диаметр', value: '12мм', type: 'number' },
      { id: '2', name: 'Поверхность', value: 'Рифленая', type: 'text' }
    ],
    image: 'https://images.unsplash.com/photo-1567196646506-c87d6050302b?auto=format&fit=crop&w=800&q=80',
    seo: DEFAULT_SEO('Арматура А500С'),
    updatedAt: '2023-10-25'
  },
  {
    id: '2',
    name: 'Труба профильная 40x40x2',
    slug: 'truba-prof-40-40',
    article: 'TR-040',
    category: ProductCategory.PIPES,
    pricePerTon: 52000,
    pricePerMeter: 120,
    pricing: DEFAULT_PRICING(52000),
    stock: 50,
    status: 'low_stock',
    steelGrade: 'Ст3пс',
    dimensions: '40x40x2',
    attributes: [
        { id: '1', name: 'Сечение', value: 'Квадрат', type: 'text' }
    ],
    image: 'https://images.unsplash.com/photo-1535063404245-7c2db922b95d?auto=format&fit=crop&w=800&q=80',
    seo: DEFAULT_SEO('Труба профильная 40х40'),
    updatedAt: '2023-10-24'
  },
  {
    id: '3',
    name: 'Лист горячекатаный 3мм',
    slug: 'list-gk-3mm',
    article: 'LST-003',
    category: ProductCategory.SHEET,
    pricePerTon: 48000,
    pricePerMeter: 350,
    pricing: DEFAULT_PRICING(48000),
    stock: 200,
    status: 'in_stock',
    steelGrade: 'Ст3',
    dimensions: '1250x2500',
    attributes: [],
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    seo: DEFAULT_SEO('Лист ГК 3мм'),
    updatedAt: '2023-10-20'
  },
  {
    id: '4',
    name: 'Балка двутавровая 20Б1',
    slug: 'balka-20b1',
    article: 'BLK-020',
    category: ProductCategory.BEAM,
    pricePerTon: 65000,
    pricePerMeter: 1200,
    pricing: DEFAULT_PRICING(65000),
    stock: 30,
    status: 'in_stock',
    steelGrade: '09Г2С',
    dimensions: '200мм',
    attributes: [],
    image: 'https://images.unsplash.com/photo-1533062632626-d18e9c403c94?auto=format&fit=crop&w=800&q=80',
    seo: DEFAULT_SEO('Балка 20Б1'),
    updatedAt: '2023-10-22'
  },
  {
    id: '5',
    name: 'Швеллер 10П',
    slug: 'shveller-10p',
    article: 'SHV-010',
    category: ProductCategory.CHANNEL,
    pricePerTon: 58000,
    pricePerMeter: 480,
    pricing: DEFAULT_PRICING(58000),
    stock: 45,
    status: 'out_of_stock',
    steelGrade: 'Ст3',
    dimensions: '100мм',
    attributes: [],
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    seo: DEFAULT_SEO('Швеллер 10П'),
    updatedAt: '2023-10-15'
  },
  {
    id: '6',
    name: 'Профнастил С8',
    slug: 'profnastil-c8',
    article: 'PRF-008',
    category: ProductCategory.DECKING,
    pricePerTon: 75000,
    pricePerMeter: 320,
    pricing: DEFAULT_PRICING(75000),
    stock: 500,
    status: 'in_stock',
    steelGrade: 'Цинк',
    dimensions: '0.45мм',
    attributes: [],
    image: 'https://images.unsplash.com/photo-1620808381227-2c67f074d22e?auto=format&fit=crop&w=800&q=80',
    seo: DEFAULT_SEO('Профнастил С8'),
    updatedAt: '2023-10-26'
  }
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', customerName: 'ООО СтройТех', total: 150000, status: 'Отгружен', date: '2023-10-25' },
  { id: 'ORD-002', customerName: 'Частное лицо', total: 12500, status: 'Ожидает', date: '2023-10-26' },
  { id: 'ORD-003', customerName: 'МеталлГрупп', total: 450000, status: 'В обработке', date: '2023-10-26' },
  { id: 'ORD-004', customerName: 'АО БыстроСтрой', total: 89000, status: 'Доставлен', date: '2023-10-24' },
];

export const ADMIN_STATS: StatCard[] = [
  { title: 'Выручка', value: '4.5 млн ₽', change: '+20.1%', trend: 'up' },
  { title: 'Новые заказы', value: '142', change: '+12.5%', trend: 'up' },
  { title: 'Клиенты', value: '65', change: '-2.4%', trend: 'down' },
  { title: 'Малый остаток', value: '4', change: '0%', trend: 'up' },
];

export const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  [ProductCategory.REBAR]: 'https://images.unsplash.com/photo-1626372412809-54129532822a?auto=format&fit=crop&w=600&h=400',
  [ProductCategory.PIPES]: 'https://images.unsplash.com/photo-1576082987158-b76543b5df51?auto=format&fit=crop&w=600&h=400',
  [ProductCategory.SHEET]: 'https://images.unsplash.com/photo-1564619792078-43f05dbd0e2e?auto=format&fit=crop&w=600&h=400',
  [ProductCategory.ANGLE]: 'https://images.unsplash.com/photo-1610459521360-192e22c7104d?auto=format&fit=crop&w=600&h=400',
  [ProductCategory.CHANNEL]: 'https://images.unsplash.com/photo-1590483863896-857dd8d05267?auto=format&fit=crop&w=600&h=400',
  [ProductCategory.BEAM]: 'https://images.unsplash.com/photo-1503714251644-bd475e114f08?auto=format&fit=crop&w=600&h=400',
  [ProductCategory.DECKING]: 'https://images.unsplash.com/photo-1620808381227-2c67f074d22e?auto=format&fit=crop&w=600&h=400',
};