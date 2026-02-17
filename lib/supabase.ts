import { createClient } from '@supabase/supabase-js';

// Credentials from user
const supabaseUrl = 'https://tglovafhswjihpzgajvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbG92YWZoc3dqaWhwemdhanZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzAyMTIsImV4cCI6MjA4NjkwNjIxMn0.NQXEnqphYEVWaSftbODvng0uqhbwWwkbOolWbItu_NE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Хелпер для маппинга данных из БД (snake_case) в приложение (camelCase)
export const mapProductFromDB = (row: any): any => {
  const defaultPricing = { 
    retail: 0, 
    wholesale: 0, 
    dealer: 0, 
    pricePerMeter: 0, 
    vatIncluded: true 
  };

  const pricing = row.pricing || defaultPricing;

  return {
    ...row,
    pricePerTon: Number(row.price_per_ton) || 0,
    pricePerMeter: Number(row.price_per_meter) || 0,
    steelGrade: row.steel_grade || '',
    stock: Number(row.stock) || 0,
    // JSONB fields are automatically parsed
    tags: Array.isArray(row.tags) ? row.tags : [],
    documents: Array.isArray(row.documents) ? row.documents : [],
    attributes: Array.isArray(row.attributes) ? row.attributes : [],
    pricing: {
      retail: Number(pricing.retail) || 0,
      wholesale: Number(pricing.wholesale) || 0,
      dealer: Number(pricing.dealer) || 0,
      pricePerMeter: Number(pricing.pricePerMeter) || 0,
      vatIncluded: pricing.vatIncluded ?? true
    },
    seo: row.seo || {}
  };
};

export const mapProductToDB = (product: any): any => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  article: product.article,
  category: product.category,
  price_per_ton: product.pricePerTon || 0,
  price_per_meter: product.pricePerMeter || 0,
  stock: product.stock || 0,
  status: product.status,
  steel_grade: product.steelGrade,
  dimensions: product.dimensions,
  image: product.image,
  description: product.description,
  // New JSONB fields
  pricing: product.pricing,
  attributes: product.attributes,
  seo: product.seo,
  tags: product.tags,
  documents: product.documents,
  updated_at: new Date().toISOString()
});

// SEO Шаблонизатор
export const generateSEO = (product: any) => {
  if (product.seo && product.seo.title) {
    return product.seo;
  }

  const price = product.pricePerTon || 0;

  return {
    title: `Купить ${product.name} - цена ${price} руб/тонна | MetalProm`,
    description: `Продажа ${product.name} оптом и в розницу. Характеристики: ${product.steelGrade}, ${product.dimensions}. В наличии на складе. Доставка по РФ.`,
    keywords: [product.name, 'купить металлопрокат', product.category, 'цена за тонну', product.steelGrade],
    h1: product.name,
    seoText: `Выгодное предложение на ${product.name} от производителя.`
  };
};