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
  type: 'text' | 'number' | 'select' | 'checkbox';
}

export interface GlobalAttribute {
  id: string;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  options?: string[]; // For select types
}

export interface PromoSlide {
  id: string;
  title: string;
  description: string;
  image: string; // Background image URL
  buttonText: string;
  link: string;
  isActive: boolean;
  order: number;
}

export interface ProductDocument {
  id: string;
  name: string;
  url: string;
  type: 'certificate' | 'gost' | 'passport';
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
  h1?: string;
  seoText?: string;
}

export interface ProductPricing {
  retail: number; // per ton
  wholesale: number; // per ton (e.g. > 5 tons)
  dealer: number; // per ton (contract)
  pricePerMeter: number;
  vatIncluded: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  article: string; // SKU
  category: ProductCategory | string;
  tags: string[];
  
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
  documents?: ProductDocument[];
  
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
  image?: string;
  seo?: ProductSEO;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}