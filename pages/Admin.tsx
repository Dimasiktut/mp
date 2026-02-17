import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Settings, LogOut, 
  TrendingUp, TrendingDown, Bell, Search,
  ShoppingCart, AlertTriangle, Menu, Plus, Upload, 
  FileSpreadsheet, Edit, Trash2, Save, X, ChevronRight,
  FolderTree, MoreHorizontal, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ADMIN_STATS, MOCK_ORDERS, MOCK_PRODUCTS } from '../constants';
import { Product, ProductCategory, ProductAttribute } from '../types';

// Types for Internal State
type ViewState = 'DASHBOARD' | 'PRODUCTS' | 'ADD_PRODUCT' | 'CATEGORIES' | 'IMPORT';

const data = [
  { name: 'Пн', sales: 4000, orders: 24 },
  { name: 'Вт', sales: 3000, orders: 13 },
  { name: 'Ср', sales: 2000, orders: 98 },
  { name: 'Чт', sales: 2780, orders: 39 },
  { name: 'Пт', sales: 1890, orders: 48 },
  { name: 'Сб', sales: 2390, orders: 38 },
  { name: 'Вс', sales: 3490, orders: 43 },
];

export const Admin: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- SUB-COMPONENTS ---

  const SidebarItem = ({ view, icon: Icon, label, badge }: { view: ViewState, icon: any, label: string, badge?: number }) => (
    <button 
      onClick={() => { setActiveView(view); setEditingProduct(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition duration-200 ${
        activeView === view 
          ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/20' 
          : 'text-slate-500 hover:bg-white hover:text-primary-900'
      }`}
    >
      <Icon size={20} className={activeView === view ? 'text-brand-500' : ''} /> 
      {label}
      {badge && <span className="ml-auto bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );

  const ProductList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = products.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.article.includes(searchTerm)) &&
      (statusFilter === 'all' || p.status === statusFilter)
    );

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">Товары</h2>
            <p className="text-slate-500 text-sm">Управление каталогом ({products.length} позиций)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveView('IMPORT')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-primary-900 rounded-xl font-bold hover:bg-gray-50 transition">
              <FileSpreadsheet size={18} /> Импорт Excel
            </button>
            <button onClick={() => setActiveView('ADD_PRODUCT')} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20">
              <Plus size={18} /> Добавить товар
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50/50">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Поиск по названию или артикулу..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Все статусы</option>
              <option value="in_stock">В наличии</option>
              <option value="low_stock">Мало</option>
              <option value="out_of_stock">Нет в наличии</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Фото</th>
                  <th className="px-6 py-4">Название / Артикул</th>
                  <th className="px-6 py-4">Категория</th>
                  <th className="px-6 py-4">Цена (т)</th>
                  <th className="px-6 py-4">Остаток</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition group">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-primary-900">{product.name}</div>
                      <div className="text-xs text-slate-400">{product.article}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-slate-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {product.pricePerTon.toLocaleString()} ₽
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {product.stock} т
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit
                        ${product.status === 'in_stock' ? 'bg-green-100 text-green-700' : 
                          product.status === 'low_stock' ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          product.status === 'in_stock' ? 'bg-green-500' : 
                          product.status === 'low_stock' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                        {product.status === 'in_stock' ? 'В наличии' : product.status === 'low_stock' ? 'Мало' : 'Нет'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingProduct(product); setActiveView('ADD_PRODUCT'); }}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
             <div className="p-12 text-center text-slate-400">
               Товары не найдены
             </div>
          )}
        </div>
      </div>
    );
  };

  const ProductEditor = () => {
    const [tab, setTab] = useState<'info' | 'pricing' | 'specs' | 'seo'>('info');
    
    // Determine if we are editing or creating
    const isEdit = !!editingProduct;
    const initialData = editingProduct || {
      name: '', article: '', category: ProductCategory.REBAR, pricePerTon: 0, stock: 0, 
      attributes: [], pricing: { retail: 0, wholesale: 0, dealer: 0 }, seo: { title: '', description: '', keywords: [] }
    };
    
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('PRODUCTS')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary-900">{isEdit ? 'Редактировать товар' : 'Новый товар'}</h2>
            <p className="text-slate-500 text-sm">{isEdit ? `ID: ${editingProduct?.id}` : 'Заполните информацию о товаре'}</p>
          </div>
          <div className="ml-auto flex gap-3">
             <button className="px-6 py-2 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition flex items-center gap-2">
               <Save size={18} /> Сохранить
             </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-8 space-y-6">
            
            {/* Tabs */}
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex overflow-x-auto">
              {[
                {id: 'info', label: 'Основное'}, 
                {id: 'pricing', label: 'Цены и Налоги'}, 
                {id: 'specs', label: 'Характеристики'},
                {id: 'seo', label: 'SEO'}
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition whitespace-nowrap ${tab === t.id ? 'bg-primary-900 text-white shadow-md' : 'text-slate-500 hover:text-primary-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
              {tab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="col-span-2">
                       <label className="block text-sm font-bold text-primary-900 mb-2">Название товара</label>
                       <input type="text" defaultValue={initialData.name as string} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition" placeholder="Например: Арматура А500С 12мм" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Артикул (SKU)</label>
                       <input type="text" defaultValue={(initialData as any).article} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Категория</label>
                       <select defaultValue={(initialData as any).category} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition">
                         {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm font-bold text-primary-900 mb-2">Описание</label>
                       <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition" placeholder="Полное описание товара..."></textarea>
                     </div>
                  </div>
                </div>
              )}

              {tab === 'pricing' && (
                 <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Розница (₽/т)</label>
                        <input type="number" defaultValue={(initialData as any).pricePerTon} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <label className="block text-xs font-bold text-green-800 uppercase mb-2">Опт (₽/т)</label>
                        <input type="number" defaultValue={(initialData as any).pricing?.wholesale} className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-2">Дилер (₽/т)</label>
                        <input type="number" defaultValue={(initialData as any).pricing?.dealer} className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                      </div>
                   </div>
                   <div className="h-px bg-gray-100"></div>
                   <div>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 accent-brand-500" defaultChecked />
                        <span className="font-medium text-primary-900">Включить НДС (20%) в стоимость</span>
                      </label>
                   </div>
                 </div>
              )}

              {tab === 'specs' && (
                 <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">Добавьте технические характеристики для фильтрации.</p>
                    {(initialData as any).attributes?.map((attr: ProductAttribute, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center">
                         <input type="text" defaultValue={attr.name} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" placeholder="Название (напр. Диаметр)" />
                         <input type="text" defaultValue={attr.value} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" placeholder="Значение (напр. 12мм)" />
                         <button className="text-red-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 text-brand-500 font-bold text-sm hover:underline mt-2">
                      <Plus size={16} /> Добавить характеристику
                    </button>
                 </div>
              )}

              {tab === 'seo' && (
                 <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Meta Title</label>
                       <input type="text" defaultValue={(initialData as any).seo?.title} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                       <p className="text-xs text-slate-400 mt-1">Рекомендуемая длина: 50-60 символов</p>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Meta Description</label>
                       <textarea rows={3} defaultValue={(initialData as any).seo?.description} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"></textarea>
                       <p className="text-xs text-slate-400 mt-1">Рекомендуемая длина: 150-160 символов</p>
                    </div>
                 </div>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-6">
             {/* Status Card */}
             <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
                <h3 className="font-bold text-primary-900 mb-4">Статус и Остатки</h3>
                <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Видимость</label>
                     <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                       <option>Опубликован</option>
                       <option>Черновик</option>
                       <option>Скрыт</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Остаток на складе (т)</label>
                     <input type="number" defaultValue={(initialData as any).stock} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" />
                   </div>
                </div>
             </div>

             {/* Media Card */}
             <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
                <h3 className="font-bold text-primary-900 mb-4">Изображение</h3>
                <div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 transition cursor-pointer mb-4 group overflow-hidden relative">
                   {initialData.image ? (
                     <img src={initialData.image} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <>
                       <Upload size={32} className="mb-2" />
                       <span className="text-xs font-bold">Загрузить фото</span>
                     </>
                   )}
                </div>
                <input type="text" placeholder="Или ссылка на фото..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
             </div>
          </div>
        </div>
      </div>
    );
  };

  const ExcelImport = () => (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <h2 className="text-2xl font-bold text-primary-900 mb-2">Импорт товаров</h2>
      <p className="text-slate-500 mb-8">Загрузите Excel файл (.xlsx, .csv) для массового обновления каталога.</p>

      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-12 text-center">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
           <FileSpreadsheet size={48} className="text-brand-500" />
        </div>
        <h3 className="text-xl font-bold text-primary-900 mb-2">Перетащите файл сюда</h3>
        <p className="text-slate-400 mb-8">или нажмите для выбора файла</p>
        
        <button className="px-8 py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition">
          Выбрать файл
        </button>

        <div className="mt-12 flex justify-center gap-8 border-t border-gray-100 pt-8">
           <div className="text-left">
             <div className="font-bold text-primary-900 mb-1">Шаг 1</div>
             <a href="#" className="text-sm text-brand-500 hover:underline">Скачать шаблон Excel</a>
           </div>
           <div className="text-left">
             <div className="font-bold text-primary-900 mb-1">Шаг 2</div>
             <p className="text-sm text-slate-500">Заполнить данные</p>
           </div>
           <div className="text-left">
             <div className="font-bold text-primary-900 mb-1">Шаг 3</div>
             <p className="text-sm text-slate-500">Загрузить в админку</p>
           </div>
        </div>
      </div>
    </div>
  );

  const CategoryManager = () => (
    <div className="animate-fade-in-up space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-primary-900">Категории</h2>
         <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20">
            <Plus size={18} /> Новая категория
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
             <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Структура каталога</h3>
             <ul className="space-y-2">
               {Object.values(ProductCategory).map((cat, i) => (
                 <li key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl group cursor-pointer border border-transparent hover:border-gray-200 transition">
                    <FolderTree size={20} className="text-slate-400 group-hover:text-brand-500" />
                    <span className="font-medium text-primary-900">{cat}</span>
                    <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="p-1 hover:bg-white rounded shadow-sm"><Edit size={14} /></button>
                      <button className="p-1 hover:bg-white rounded shadow-sm text-red-500"><Trash2 size={14} /></button>
                    </div>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="bg-primary-900 rounded-3xl p-8 text-white">
             <h3 className="text-xl font-bold mb-6">SEO Настройки категории</h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">Название</label>
                   <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="Арматура" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">ЧПУ (Slug)</label>
                   <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="armatura" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">Meta Title</label>
                   <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="Купить арматуру в Москве..." />
                </div>
             </div>
             <button className="w-full mt-8 py-3 bg-brand-500 rounded-xl font-bold hover:bg-brand-600 transition">
               Сохранить изменения
             </button>
          </div>
       </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADMIN_STATS.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-card border border-gray-50 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-extrabold text-primary-900">{stat.value}</h3>
                </div>
                <span className={`flex items-center text-xs font-bold ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2.5 py-1.5 rounded-lg`}>
                  {stat.trend === 'up' ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-card border border-gray-50">
             <h3 className="text-lg font-bold text-primary-900 mb-6">Статистика продаж</h3>
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                   <defs>
                     <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#FF5A1F" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#FF5A1F" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                   <Tooltip />
                   <Area type="monotone" dataKey="sales" stroke="#FF5A1F" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-card border border-gray-50 overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary-900">Последние заказы</h3>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-slate-400 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Клиент</th>
                    <th className="px-6 py-3">Сумма</th>
                    <th className="px-6 py-3">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_ORDERS.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                       <td className="px-6 py-4 font-bold text-primary-900">#{order.id}</td>
                       <td className="px-6 py-4">{order.customerName}</td>
                       <td className="px-6 py-4 font-bold">{order.total.toLocaleString()} ₽</td>
                       <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-slate-600">{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  // --- MAIN LAYOUT ---

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-20 shadow-soft hidden md:flex">
        <div className="p-8">
           <Link to="/" className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
               <span className="text-brand-500 font-extrabold text-lg">M</span>
             </div>
             <span className="font-bold text-xl tracking-tight text-primary-900">METAL<span className="text-brand-500">ADMIN</span></span>
           </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <SidebarItem view="DASHBOARD" icon={LayoutDashboard} label="Обзор" />
          <SidebarItem view="PRODUCTS" icon={Package} label="Товары" />
          <SidebarItem view="CATEGORIES" icon={FolderTree} label="Категории" />
          <SidebarItem view="DASHBOARD" icon={ShoppingCart} label="Заказы" badge={3} />
          <SidebarItem view="DASHBOARD" icon={Users} label="Клиенты" />
          
          <div className="my-4 h-px bg-gray-100 mx-4"></div>
          <SidebarItem view="DASHBOARD" icon={Settings} label="Настройки" />
        </nav>

        <div className="p-6 border-t border-gray-100">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition font-medium">
            <LogOut size={18} /> Выйти
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="md:hidden">
            <button className="p-2 bg-gray-100 rounded-lg"><Menu size={20}/></button>
          </div>
          <div className="text-sm breadcrumbs text-slate-400 hidden md:block">
            Админ панель <span className="mx-2">/</span> <span className="text-primary-900 font-bold">{
              activeView === 'DASHBOARD' ? 'Обзор' : 
              activeView === 'PRODUCTS' ? 'Товары' : 
              activeView === 'ADD_PRODUCT' ? 'Редактирование' : 
              activeView === 'CATEGORIES' ? 'Категории' : 'Импорт'
            }</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <div className="text-right">
                 <div className="text-sm font-bold text-primary-900">Admin</div>
                 <div className="text-xs text-slate-400">Superuser</div>
               </div>
               <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold">
                 AD
               </div>
             </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
           {activeView === 'DASHBOARD' && <Dashboard />}
           {activeView === 'PRODUCTS' && <ProductList />}
           {activeView === 'ADD_PRODUCT' && <ProductEditor />}
           {activeView === 'IMPORT' && <ExcelImport />}
           {activeView === 'CATEGORIES' && <CategoryManager />}
        </main>
      </div>

    </div>
  );
};