import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, mapCategoryFromDB } from '../lib/supabase';
import { Category, ProductCategory } from '../types';
import { CATEGORY_IMAGES } from '../constants';
import { Loader2, ArrowRight, Box } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data && data.length > 0) {
          setCategories(data.map(mapCategoryFromDB));
        } else {
          // Fallback if DB is empty
          const defaults = Object.values(ProductCategory).map((name, idx) => ({
             id: `def-${idx}`,
             name: name,
             slug: name.toLowerCase().replace(/\s/g, '-'), // Basic slugify
             image: CATEGORY_IMAGES[name as ProductCategory],
             count: 0,
             seo: { title: '', description: '', keywords: [] }
          }));
          setCategories(defaults);
        }
      } catch (error) {
        console.error('Error loading categories', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500" size={48} /></div>;

  return (
    <div className="bg-primary-50 min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-6">Каталог металлопроката</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Выберите интересующую категорию продукции. Мы предлагаем широкий ассортимент черного и нержавеющего проката напрямую от производителя.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link 
              to={`/catalog/${cat.slug}`} 
              key={cat.id} 
              className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-[400px] border border-gray-100"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={cat.image || CATEGORY_IMAGES[cat.name as ProductCategory] || 'https://via.placeholder.com/600x400'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between relative">
                <div>
                   <h3 className="text-2xl font-bold text-primary-900 group-hover:text-brand-600 transition-colors mb-2">{cat.name}</h3>
                   <p className="text-slate-500 text-sm line-clamp-2">{cat.seo?.description || `Качественный ${cat.name.toLowerCase()} по оптовым ценам.`}</p>
                </div>
                
                <div className="flex items-center gap-2 text-primary-900 font-bold mt-4 group-hover:translate-x-2 transition-transform">
                   Перейти в раздел <ArrowRight size={20} className="text-brand-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};