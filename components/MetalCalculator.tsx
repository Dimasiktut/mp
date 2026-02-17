import React, { useState } from 'react';
import { Calculator, ArrowRight, Info } from 'lucide-react';
import { ProductCategory } from '../types';

export const MetalCalculator: React.FC = () => {
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.REBAR);
  const [length, setLength] = useState<number>(100);
  const [diameter, setDiameter] = useState<number>(12);
  
  // Real-time calculation
  const calculate = () => {
    const density = 7850;
    const radius = (diameter / 1000) / 2;
    const volume = Math.PI * Math.pow(radius, 2) * length;
    const weightKg = volume * density;
    const price = weightKg * 85; 
    return { weight: weightKg.toFixed(2), price: Math.round(price) };
  };

  const result = calculate();

  return (
    <div id="calculator" className="bg-white rounded-3xl shadow-card overflow-hidden border border-gray-100 relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

      <div className="p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-primary-900 rounded-2xl flex items-center justify-center text-brand-500 shadow-lg transform -rotate-3">
            <Calculator size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-primary-900">Калькулятор металла</h3>
            <p className="text-slate-500 text-sm">Точный расчет веса и стоимости онлайн</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Выберите тип продукции</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(ProductCategory).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      category === cat
                        ? 'bg-primary-900 text-white border-primary-900 shadow-md'
                        : 'bg-white text-slate-600 border-gray-200 hover:border-brand-300 hover:text-primary-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-primary-900 mb-2 flex justify-between">
                  Длина (м)
                  <span className="text-brand-500 text-xs bg-brand-50 px-2 py-0.5 rounded-md font-bold">{length} м</span>
                </label>
                <div className="relative">
                   <input 
                    type="range" 
                    min="1" 
                    max="1000" 
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="mt-4 flex gap-2">
                    <input 
                      type="number"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-primary-900 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-primary-900 mb-2">Диаметр / Толщина (мм)</label>
                <input 
                  type="number" 
                  value={diameter}
                  onChange={(e) => setDiameter(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-primary-900 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  placeholder="12" 
                />
                <div className="flex gap-2 mt-3">
                  {[8, 10, 12, 16, 20].map(d => (
                    <button 
                      key={d} 
                      onClick={() => setDiameter(d)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${diameter === d ? 'bg-brand-500 text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-5">
            <div className="bg-primary-900 rounded-2xl p-8 text-white h-full flex flex-col justify-between shadow-2xl shadow-primary-900/20 relative overflow-hidden">
               {/* Decorative circles */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

               <div>
                 <div className="flex items-start justify-between mb-8 opacity-80">
                   <span className="text-sm font-medium uppercase tracking-wider">Результат</span>
                   <Info size={20} />
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                      <div className="text-3xl font-extrabold mb-1">{result.weight} <span className="text-lg opacity-50 font-medium">кг</span></div>
                      <div className="text-sm text-slate-400">Расчетный вес</div>
                    </div>
                    
                    <div className="w-full h-px bg-white/10"></div>
                    
                    <div>
                      <div className="text-4xl font-extrabold text-brand-500 mb-1">{result.price.toLocaleString()} <span className="text-lg opacity-50 font-medium text-white">₽</span></div>
                      <div className="text-sm text-slate-400">Ориентировочная стоимость</div>
                    </div>
                 </div>
               </div>

               <button className="w-full mt-8 bg-white text-primary-900 py-4 rounded-xl font-bold hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 group">
                 Добавить в заказ <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};