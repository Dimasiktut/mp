export enum ProductCategory {
  REBAR = 'Арматура',
  PIPES = 'Трубы',
  SHEET = 'Лист',
  ANGLE = 'Уголок',
  CHANNEL = 'Швеллер',
  BEAM = 'Балка',
  DECKING = 'Профнастил'
}

export interface ProductAttribute {
  id: string;
  name: string; // e.g., "Steel Grade", "Diameter"
  value: string; // e.g., "A500C", "12mm"
  type: 'text' | 'number' | 'select';
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface ProductPricing {
  retail: number; // per ton
  wholesale: number; // per ton
  dealer: number; // per ton
  pricePerMeter: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  article: string; // SKU
  category: ProductCategory | string;
  
  // Pricing & Stock
  pricePerTon: number; // Base retail price (legacy support)
  pricePerMeter: number; // Base retail price (legacy support)
  pricing: ProductPricing;
  
  stock: number; // in tons
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'hidden';
  
  // Specs
  steelGrade: string;
  dimensions: string;
  attributes: ProductAttribute[];
  
  // Media & Info
  image: string;
  description?: string;
  
  // SEO
  seo?: ProductSEO;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number; // in meters or units
  totalWeight: number; // tons
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'Ожидает' | 'В обработке' | 'Отгружен' | 'Доставлен';
  date: string;
}

export interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  count: number;
}