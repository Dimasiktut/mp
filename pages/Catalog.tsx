import React, { useState, useEffect } from 'react';
import { ProductCategory, Product } from '../types';
import { ShoppingCart, Filter, Download, ChevronDown, Check, Loader2, ArrowRight } from 'lucide-react';
import { supabase, mapProductFromDB } from '../lib/supabase';
import { Link } from 'react-router-dom';

export const Catalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Все', ...Object.values(ProductCategory)];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data) {
        setProducts(data.map(mapProductFromDB));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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
          
          {/* Modern Filters Sidebar */}
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
                 <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                   <span>0 ₽</span>
                   <span>100к ₽</span>
                 </div>
              </div>

              <button className="w-full py-4 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition shadow-lg transform active:scale-95 duration-200">
                Применить
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-slate-500 text-sm font-medium">Найдено: <strong className="text-primary-900">{filteredProducts.length}</strong> позиций</span>
              <button className="flex items-center gap-2 text-sm font-bold text-primary-900 hover:text-brand-500 transition">
                Сортировка <ChevronDown size={16} />
              </button>
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
                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                         <span className="px-4 py-2 bg-white rounded-xl font-bold text-sm text-primary-900 flex items-center gap-2 hover:scale-105 transition">
                            Подробнее <ArrowRight size={16}/>
                         </span>
                      </div>
                    </div>
                    
                    <div className="px-2 pb-2 flex-grow flex flex-col">
                      <h3 className="font-bold text-lg text-primary-900 mb-3 leading-snug group-hover:text-brand-600 transition-colors">{product.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                         <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-semibold text-slate-500 border border-gray-100">{product.steelGrade}</span>
                         <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-semibold text-slate-500 border border-gray-100">{product.dimensions}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Тонна</div>
                            <div className="font-extrabold text-xl text-primary-900">{product.pricePerTon.toLocaleString()} ₽</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Метр</div>
                            <div className="font-bold text-lg text-slate-600">{product.pricePerMeter} ₽</div>
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
                <p className="text-slate-500 mb-6">Попробуйте изменить параметры фильтрации</p>
                <button 
                  onClick={() => {setSelectedCategory('Все'); setPriceRange(100000);}}
                  className="px-6 py-2 bg-white border border-gray-300 text-primary-900 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Сбросить все
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};