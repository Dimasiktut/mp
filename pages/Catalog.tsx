import React, { useState, useEffect } from 'react';
import { ProductCategory, Product } from '../types';
import { Filter, ChevronDown, Check, Loader2, ArrowRight } from 'lucide-react';
import { supabase, mapProductFromDB } from '../lib/supabase';
import { Link } from 'react-router-dom';

export const Catalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Все', ...Object.values(ProductCategory)]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: prodData } = await supabase.from('products').select('*');
        if (prodData) setProducts(prodData.map(mapProductFromDB));

        // Fetch dynamic categories
        const { data: catData } = await supabase.from('categories').select('*');
        if (catData && catData.length > 0) {
           setCategories(['Все', ...catData.map(c => c.name)]);
        }
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'Все' || p.category === selectedCategory) &&
    p.pricePerTon <= priceRange
  );

  return (
    <div className="bg-primary-50 min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-start mb-12">
           <h1 className="text-4xl font-extrabold text-primary-900 mb-4">Каталог продукции</h1>
           <p className="text-slate-500 max-w-2xl">Актуальные цены и наличие на складе. Цены обновляются ежедневно в 09:00 МСК.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white p-8 rounded-3xl shadow-card sticky top-28 border border-gray-100">
              <div className="flex items-center gap-2 mb-8 text-primary-900 font-bold text-xl">
                <Filter size={20} className="text-brand-500" /> Фильтры
              </div>

              <div className="mb-10">
                <h4 className="font-bold text-sm mb-4 text-primary-900 uppercase tracking-wider">Категория</h4>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedCategory === cat ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-gray-50 group-hover:border-brand-300'}`}>
                         {selectedCategory === cat && <Check size={12} className="text-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="category" 
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="hidden"
                      />
                      <span className={`text-sm transition-colors ${selectedCategory === cat ? 'font-bold text-primary-900' : 'text-slate-600 group-hover:text-primary-900'}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-primary-900 uppercase tracking-wider">Цена до</h4>
                    <span className="text-brand-500 font-bold text-sm">{priceRange.toLocaleString()} ₽</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="100000" 
                   step="1000"
                   value={priceRange}
                   onChange={(e) => setPriceRange(Number(e.target.value))}
                   className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                 />
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-slate-500 text-sm font-medium">Найдено: <strong className="text-primary-900">{filteredProducts.length}</strong> позиций</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={48} className="text-brand-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <Link to={`/product/${product.slug}`} key={product.id} className="group bg-white rounded-3xl p-4 shadow-card hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col hover:-translate-y-1 relative">
                    <div className="h-56 overflow-hidden rounded-2xl relative bg-gray-100 mb-4">
                      <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
                        {product.category}
                      </div>
                    </div>
                    
                    <div className="px-2 pb-2 flex-grow flex flex-col">
                      <h3 className="font-bold text-lg text-primary-900 mb-3 leading-snug group-hover:text-brand-600 transition-colors">{product.name}</h3>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Тонна</div>
                            <div className="font-extrabold text-xl text-primary-900">{product.pricePerTon.toLocaleString()} ₽</div>
                          </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">Ничего не найдено</h3>
                <p className="text-slate-500 mb-6">Попробуйте изменить параметры фильтрации или добавить товары в админке.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};