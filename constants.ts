import { ProductCategory, StatCard } from './types';

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