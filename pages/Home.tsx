import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Truck, Zap, Box, Star, PlayCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetalCalculator } from '../components/MetalCalculator';
import { ProductCategory } from '../types';
import { CATEGORY_IMAGES } from '../constants';
import { supabase, mapProductFromDB } from '../lib/supabase';

// Fallback items if DB is empty
const DEFAULT_FEATURED = [
  {
    name: "Арматура А500С",
    price: "45,000 ₽",
    trend: "+2.4%",
    image: "https://images.unsplash.com/photo-1626372412809-54129532822a?auto=format&fit=crop&w=600&q=80",
    chart: [40, 65, 55, 80, 70, 90, 85]
  }
];

export const Home: React.FC = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<any[]>(DEFAULT_FEATURED);

  useEffect(() => {
    const fetchFeatured = async () => {
      // Get 3 random or latest products from Supabase
      const { data } = await supabase.from('products').select('*').limit(3);
      if (data && data.length > 0) {
        setFeaturedItems(data.map(mapProductFromDB).map(p => ({
            name: p.name,
            price: `${p.pricePerTon.toLocaleString()} ₽`,
            trend: "+2.4%", // Mock trend for now
            image: p.image || "https://images.unsplash.com/photo-1626372412809-54129532822a?auto=format&fit=crop&w=600&q=80",
            chart: [40, 65, 55, 80, 70, 90, 85] // Mock chart
        })));
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentFeatureIndex((prev) => (prev + 1) % featuredItems.length);
        setIsAnimating(false);
      }, 500); // Wait for fade out
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [featuredItems]);

  const currentItem = featuredItems[currentFeatureIndex];

  return (
    <div className="pb-20 bg-primary-50">
      
      {/* Modern Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary-900 rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl mb-12">
        
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
            alt="Современный завод" 
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/90 to-primary-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-500 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                Лидер рынка 2024
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
                Стальной характер <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400">вашего бизнеса</span>
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                Комплексные поставки металлопроката напрямую от завода-производителя. 
                Инновационная логистика, точный вес и безупречное качество по ГОСТ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link to="/catalog" className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg transition shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2">
                  Открыть каталог
                </Link>
                <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3">
                  <PlayCircle size={24} />
                  Видео о нас
                </button>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white">50k+</div>
                  <div className="text-sm text-slate-400">Тонн на складе</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <div className="text-3xl font-bold text-white">24ч</div>
                  <div className="text-sm text-slate-400">Отгрузка заказа</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <div className="text-3xl font-bold text-white">ISO</div>
                  <div className="text-sm text-slate-400">Сертификация</div>
                </div>
              </div>
            </div>

            {/* Dynamic Floating Glass Card */}
            <div className="hidden md:block relative animate-float">
               <div className="absolute -inset-4 bg-brand-500/20 blur-3xl rounded-full"></div>
               
               <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] shadow-2xl w-[360px] mx-auto transition-all duration-300 hover:scale-[1.02]">
                 
                 {/* Product Image Area */}
                 <div className={`h-48 w-full rounded-2xl overflow-hidden mb-5 relative shadow-lg transition-opacity duration-500 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
                    <img 
                      src={currentItem.image} 
                      alt={currentItem.name} 
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-green-400 flex items-center gap-1 border border-white/10">
                      <TrendingUp size={12} /> {currentItem.trend}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-brand-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg">
                      Хит продаж
                    </div>
                 </div>

                 <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
                   <div className="flex justify-between items-end mb-4">
                     <div>
                       <h3 className="text-2xl font-bold text-white leading-tight">{currentItem.name}</h3>
                       <p className="text-slate-400 text-xs mt-1">В наличии на складе</p>
                     </div>
                   </div>

                   {/* Chart Line */}
                   <div className="h-12 flex items-end justify-between gap-2 mb-6">
                      {currentItem.chart?.map((h: number, i: number) => (
                        <div key={i} className="w-full bg-white/5 rounded-t-sm relative group">
                          <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-gradient-to-t from-brand-500 to-orange-400 rounded-t-sm transition-all duration-1000"></div>
                        </div>
                      ))}
                   </div>

                   <div className="flex justify-between items-center border-t border-white/10 pt-4">
                     <div>
                       <div className="text-3xl font-bold text-white tracking-tight">{currentItem.price}</div>
                       <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Цена за тонну</div>
                     </div>
                     <Link to="/catalog" className="w-12 h-12 rounded-full bg-white text-primary-900 flex items-center justify-center shadow-lg hover:bg-brand-500 hover:text-white transition-all duration-300 group">
                       <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                     </Link>
                   </div>
                 </div>

               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid - Clean & Minimal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.values(ProductCategory).map((cat) => (
             <Link to={`/catalog?category=${cat}`} key={cat} className="group bg-white p-4 rounded-2xl shadow-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center border border-gray-100">
               <div className="w-12 h-12 mx-auto bg-primary-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-500 transition-colors">
                  <Box size={20} className="text-primary-900 group-hover:text-white transition-colors" />
               </div>
               <h3 className="font-bold text-primary-900 text-sm group-hover:text-brand-600 transition-colors">{cat}</h3>
             </Link>
          ))}
        </div>
      </section>

      {/* Popular Products Slider/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="flex justify-between items-end mb-12">
           <div>
             <span className="text-brand-600 font-bold uppercase tracking-widest text-xs mb-2 block">Каталог</span>
             <h2 className="text-4xl font-extrabold text-primary-900">Популярные категории</h2>
           </div>
           <Link to="/catalog" className="hidden md:flex items-center gap-2 text-primary-900 font-bold hover:text-brand-500 transition">
             Все товары <ArrowRight size={20} />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {cat: ProductCategory.REBAR, title: 'Арматура строительная', desc: 'Для фундаментов и монолита'},
            {cat: ProductCategory.PIPES, title: 'Трубный прокат', desc: 'Профильные и круглые трубы'},
            {cat: ProductCategory.SHEET, title: 'Листовой прокат', desc: 'Г/К, Х/К и оцинкованные листы'}
          ].map((item, idx) => (
            <Link to={`/catalog?category=${item.cat}`} key={idx} className="group relative h-[400px] rounded-3xl overflow-hidden shadow-card">
              <img 
                src={CATEGORY_IMAGES[item.cat]} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-1 bg-brand-500 mb-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{item.desc}</p>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  Перейти в раздел <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-2xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-extrabold text-primary-900 mb-4">Почему выбирают нас</h2>
             <p className="text-slate-500 text-lg">Мы не просто продаем металл, мы предоставляем сервис европейского уровня с российским характером.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className="bg-primary-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-900 shadow-sm mb-6 group-hover:scale-110 transition-transform group-hover:text-brand-500">
                 <ShieldCheck size={32} />
               </div>
               <h3 className="text-xl font-bold text-primary-900 mb-3">Двойной контроль качества</h3>
               <p className="text-slate-500 leading-relaxed">Каждая партия проходит спектральный анализ и проверку геометрии. 100% соответствие ГОСТ.</p>
             </div>

             {/* Feature 2 - Highlighted */}
             <div className="bg-primary-900 p-8 rounded-3xl shadow-xl transform md:-translate-y-4">
               <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
                 <Truck size={32} />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Собственная логистика</h3>
               <p className="text-slate-400 leading-relaxed">Автопарк из 50 машин грузоподъемностью от 1.5 до 20 тонн. GPS-трекинг каждого заказа в реальном времени.</p>
             </div>

             {/* Feature 3 */}
             <div className="bg-primary-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-900 shadow-sm mb-6 group-hover:scale-110 transition-transform group-hover:text-brand-500">
                 <Zap size={32} />
               </div>
               <h3 className="text-xl font-bold text-primary-900 mb-3">Отгрузка за 24 часа</h3>
               <p className="text-slate-500 leading-relaxed">Электронный документооборот и автоматизированный склад позволяют отгружать металл в день оплаты.</p>
             </div>
           </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="max-w-6xl mx-auto px-4 mt-24 mb-24">
        <MetalCalculator />
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-500 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-500/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-900 opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8">Готовы обсудить поставку?</h2>
            <p className="text-white/90 text-xl mb-10">Получите персональное коммерческое предложение со скидкой до 15% на первый заказ.</p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="text" 
                placeholder="Ваш номер телефона" 
                className="flex-1 px-6 py-4 rounded-xl text-primary-900 font-medium focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button className="bg-primary-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-800 transition shadow-lg">
                Жду звонка
              </button>
            </form>
            <p className="text-white/60 text-xs mt-4">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
          </div>
        </div>
      </section>

    </div>
  );
};