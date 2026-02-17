import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, mapProductFromDB, mapCategoryFromDB } from '../lib/supabase';
import { Product, Category } from '../types';
import { Filter, ChevronRight, Home, Loader2, ArrowRight } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<number>(100000);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Category Details (by slug)
        // If the slug doesn't exist in DB, we might try to match by enum or show 404.
        // For now, let's assume if not in DB, we try to find it in products or fallback.
        
        let catData = null;
        const { data: dbCat } = await supabase.from('categories').select('*').eq('slug', slug).single();
        
        if (dbCat) {
          catData = mapCategoryFromDB(dbCat);
        } else {
           // Fallback mechanism: Create a dummy category object if not in DB but we want to show products
           // This handles legacy/hardcoded links
           catData = {
             id: 'temp',
             name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Категория', // Simple cap
             slug: slug || '',
             seo: { 
                title: `${slug} купить - цена за тонну`, 
                description: `Продажа ${slug} оптом и в розницу.`,
                h1: slug, 
                seoText: ''
             }
           };
        }
        setCategory(catData);

        // Update Document Title / Meta
        if (catData?.seo) {
           document.title = catData.seo.title || `${catData.name} | MetalProm`;
        }

        // 2. Fetch Products
        // We filter by category Name usually. If we stored category_id in products it would be better.
        // Current architecture stores category NAME in `category` field of product.
        // So we need to match `catData.name`
        
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .eq('category', catData.name); // Important: Products must match Category Name

        if (prodData) {
          setProducts(prodData.map(mapProductFromDB));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const filteredProducts = products.filter(p => p.pricePerTon <= priceRange);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500" size={48} /></div>;
  if (!category) return <div className="h-screen flex items-center justify-center">Категория не найдена</div>;

  return (
    <div className="bg-primary-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-brand-500"><Home size={16} /></Link>
          <ChevronRight size={14} />
          <Link to="/catalog" className="hover:text-brand-500">Каталог</Link>
          <ChevronRight size={14} />
          <span className="text-primary-900 font-medium">{category.name}</span>
        </div>

        {/* Category Header (SEO H1 + Desc) */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card mb-12 border border-gray-100">
           <h1 className="text-3xl md:text-5xl font-extrabold text-primary-900 mb-6">{category.seo?.h1 || category.name}</h1>
           {category.description && (
             <div className="prose prose-slate max-w-none text-slate-500" dangerouslySetInnerHTML={{ __html: category.description }} />
           )}
           {!category.description && (
             <p className="text-slate-500 text-lg">
                Актуальные цены на {category.name.toLowerCase()}. Продажа оптом и в розницу с доставкой по Москве и области.
             </p>
           )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
           {/* Sidebar Filter */}
           <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white p-8 rounded-3xl shadow-card sticky top-28 border border-gray-100">
              <div className="flex items-center gap-2 mb-8 text-primary-900 font-bold text-xl">
                <Filter size={20} className="text-brand-500" /> Фильтры
              </div>
              <div className="mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-primary-900 uppercase tracking-wider">Цена до</h4>
                    <span className="text-brand-500 font-bold text-sm">{priceRange.toLocaleString()} ₽</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="200000" 
                   step="1000"
                   value={priceRange}
                   onChange={(e) => setPriceRange(Number(e.target.value))}
                   className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                 />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 text-sm font-medium">Товаров в категории: <strong className="text-primary-900">{filteredProducts.length}</strong></span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link to={`/product/${product.slug}`} key={product.id} className="group bg-white rounded-3xl p-4 shadow-card hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col hover:-translate-y-1 relative">
                    <div className="h-48 overflow-hidden rounded-2xl relative bg-gray-100 mb-4">
                      <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
                        {product.steelGrade}
                      </div>
                    </div>
                    
                    <div className="px-2 pb-2 flex-grow flex flex-col">
                      <h3 className="font-bold text-base text-primary-900 mb-3 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">{product.name}</h3>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Тонна</div>
                            <div className="font-extrabold text-lg text-primary-900">{product.pricePerTon.toLocaleString()} ₽</div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <ArrowRight size={16} />
                          </div>
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
             
             {filteredProducts.length === 0 && (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-slate-400">
                   В данной категории пока нет товаров.
                </div>
             )}
          </div>
        </div>

        {/* SEO Text Block (Bottom) */}
        {category.seo?.seoText && (
          <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
             <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: category.seo.seoText }} />
          </div>
        )}

      </div>
    </div>
  );
};