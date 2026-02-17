import { createClient } from '@supabase/supabase-js';

// Credentials from user
const supabaseUrl = 'https://tglovafhswjihpzgajvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbG92YWZoc3dqaWhwemdhanZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzAyMTIsImV4cCI6MjA4NjkwNjIxMn0.NQXEnqphYEVWaSftbODvng0uqhbwWwkbOolWbItu_NE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Хелпер для маппинга данных из БД (snake_case) в приложение (camelCase)
export const mapProductFromDB = (row: any): any => ({
  ...row,
  pricePerTon: row.price_per_ton,
  pricePerMeter: row.price_per_meter,
  steelGrade: row.steel_grade,
  // pricing, attributes и seo хранятся как JSONB и приходят как объекты
});

export const mapProductToDB = (product: any): any => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  article: product.article,
  category: product.category,
  price_per_ton: product.pricePerTon,
  price_per_meter: product.pricePerMeter,
  stock: product.stock,
  status: product.status,
  steel_grade: product.steelGrade,
  dimensions: product.dimensions,
  image: product.image,
  description: product.description,
  pricing: product.pricing,
  attributes: product.attributes,
  seo: product.seo,
  updated_at: new Date().toISOString()
});

// SEO Шаблонизатор
export const generateSEO = (product: any) => {
  // Если SEO заполнено в админке, используем его
  if (product.seo && product.seo.title) {
    return product.seo;
  }

  // Иначе генерируем по шаблону
  return {
    title: `Купить ${product.name} - цена ${product.pricePerTon} руб/тонна | MetalProm`,
    description: `Продажа ${product.name} оптом и в розницу. Характеристики: ${product.steelGrade}, ${product.dimensions}. В наличии на складе. Доставка.`,
    keywords: [product.name, 'купить металлопрокат', product.category, 'цена за тонну']
  };
};