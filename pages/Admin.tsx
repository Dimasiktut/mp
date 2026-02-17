import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Settings, LogOut, 
  TrendingUp, TrendingDown, Bell, Search,
  ShoppingCart, AlertTriangle, Menu, Plus, Upload, 
  FileSpreadsheet, Edit, Trash2, Save, X, ChevronRight,
  FolderTree, Loader2, Copy, FileText, Globe, Tag, SlidersHorizontal, ChevronDown, CheckSquare, Square, FileCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ADMIN_STATS } from '../constants';
import { Product, ProductCategory, ProductAttribute, Order, ProductPricing, ProductDocument, GlobalAttribute } from '../types';
import { supabase, mapProductFromDB, mapProductToDB } from '../lib/supabase';

// Types for Internal State
type ViewState = 'DASHBOARD' | 'PRODUCTS' | 'ADD_PRODUCT' | 'CATEGORIES' | 'IMPORT' | 'ATTRIBUTES' | 'TAGS' | 'SEO_SETTINGS';

const data = [
  { name: 'Пн', sales: 4000, orders: 24 },
  { name: 'Вт', sales: 3000, orders: 13 },
  { name: 'Ср', sales: 2000, orders: 98 },
  { name: 'Чт', sales: 2780, orders: 39 },
  { name: 'Пт', sales: 1890, orders: 48 },
  { name: 'Сб', sales: 2390, orders: 38 },
  { name: 'Вс', sales: 3490, orders: 43 },
];

// Mock Global Attributes for demo
const MOCK_GLOBAL_ATTRIBUTES: GlobalAttribute[] = [
  { id: '1', name: 'Диаметр', slug: 'diameter', type: 'number' },
  { id: '2', name: 'Марка стали', slug: 'steel_grade', type: 'select', options: ['А500С', 'А240', 'Ст3', '09Г2С'] },
  { id: '3', name: 'Длина', slug: 'length', type: 'number' },
  { id: '4', name: 'ГОСТ', slug: 'gost', type: 'text' },
];

export const Admin: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Bulk Actions State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) setProducts(prodData.map(mapProductFromDB));

      const { data: orderData } = await supabase.from('orders').select('*');
      if (orderData) {
        setOrders(orderData.map((o: any) => ({
           id: o.id,
           customerName: o.customer_name,
           total: o.total,
           status: o.status,
           date: new Date(o.created_at).toLocaleDateString()
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Вы уверены? Это действие необратимо.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
       setProducts(products.filter(p => p.id !== id));
    }
  };

  const duplicateProduct = async (product: Product) => {
    const newProduct = {
      ...product,
      name: `${product.name} (Копия)`,
      slug: `${product.slug}-copy-${Date.now()}`,
      article: `${product.article}-COPY`,
      id: undefined // Let DB generate ID
    };
    await saveProduct(newProduct);
  };

  const saveProduct = async (productData: any) => {
     // Prepare data for DB
     const dbData = mapProductToDB(productData);
     
     // If new, remove ID
     if (!editingProduct && !productData.id) {
       delete dbData.id;
     }

     const { data, error } = await supabase
        .from('products')
        .upsert(dbData)
        .select()
        .single();
     
     if (!error && data) {
       const mapped = mapProductFromDB(data);
       if (editingProduct) {
         setProducts(products.map(p => p.id === mapped.id ? mapped : p));
       } else {
         setProducts([mapped, ...products]);
       }
       setActiveView('PRODUCTS');
       setEditingProduct(null);
     } else {
       console.error(error);
       alert('Ошибка сохранения: ' + error.message);
     }
  };

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
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const filtered = products.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.article.includes(searchTerm)) &&
      (statusFilter === 'all' || p.status === statusFilter) &&
      (categoryFilter === 'all' || p.category === categoryFilter)
    );

    const toggleSelect = (id: string) => {
      const newSelected = new Set(selectedProductIds);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      setSelectedProductIds(newSelected);
    };

    const toggleSelectAll = () => {
      if (selectedProductIds.size === filtered.length) {
        setSelectedProductIds(new Set());
      } else {
        setSelectedProductIds(new Set(filtered.map(p => p.id)));
      }
    };

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
          {/* Filters Bar */}
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
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Все категории</option>
              {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Все статусы</option>
              <option value="in_stock">В наличии</option>
              <option value="low_stock">Мало</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="hidden">Скрыт</option>
            </select>
          </div>
          
          {/* Bulk Actions Bar */}
          {selectedProductIds.size > 0 && (
            <div className="bg-brand-50 px-6 py-2 flex items-center justify-between animate-fade-in-down">
              <span className="text-brand-800 font-bold text-sm">Выбрано: {selectedProductIds.size}</span>
              <div className="flex gap-2">
                 <button className="text-xs px-3 py-1 bg-white border border-brand-200 text-brand-700 rounded hover:bg-brand-100">Скрыть</button>
                 <button className="text-xs px-3 py-1 bg-white border border-brand-200 text-brand-700 rounded hover:bg-brand-100">Изменить цену</button>
                 <button className="text-xs px-3 py-1 bg-red-100 border border-red-200 text-red-700 rounded hover:bg-red-200">Удалить</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedProductIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={16} className="text-brand-500"/> : <Square size={16}/>}
                    </button>
                  </th>
                  <th className="px-2 py-4">Фото</th>
                  <th className="px-6 py-4">Название / Артикул</th>
                  <th className="px-6 py-4">Категория</th>
                  <th className="px-6 py-4">Цены (Розница/Опт)</th>
                  <th className="px-6 py-4">Остаток</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">SEO</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition group">
                    <td className="px-6 py-3">
                      <button onClick={() => toggleSelect(product.id)}>
                        {selectedProductIds.has(product.id) ? <CheckSquare size={16} className="text-brand-500"/> : <Square size={16} className="text-slate-300"/>}
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        <img src={product.image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-primary-900 line-clamp-1">{product.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{product.article}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-slate-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-3 font-medium">
                      <div className="text-primary-900">{product.pricePerTon.toLocaleString()} ₽</div>
                      <div className="text-xs text-slate-400">Опт: {product.pricing?.wholesale.toLocaleString()} ₽</div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {product.stock} т
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit
                        ${product.status === 'in_stock' ? 'bg-green-100 text-green-700' : 
                          product.status === 'low_stock' ? 'bg-orange-100 text-orange-700' : 
                          product.status === 'hidden' ? 'bg-gray-200 text-gray-600' :
                          'bg-red-100 text-red-700'}`}>
                        {product.status === 'in_stock' ? 'В наличии' : 
                         product.status === 'low_stock' ? 'Мало' : 
                         product.status === 'hidden' ? 'Скрыт' : 'Нет'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                       {product.seo?.title ? 
                         <Globe size={16} className="text-green-500" title="SEO заполнено" /> : 
                         <Globe size={16} className="text-slate-300" title="SEO не заполнено" />
                       }
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => duplicateProduct(product)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Дублировать"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => { setEditingProduct(product); setActiveView('ADD_PRODUCT'); }}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition"
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Удалить"
                        >
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
    const [tab, setTab] = useState<'info' | 'pricing' | 'specs' | 'files' | 'seo'>('info');
    
    // Initial State
    const defaultProduct: Partial<Product> = {
      name: '', article: '', category: ProductCategory.REBAR, 
      pricePerTon: 0, stock: 0, 
      attributes: [], 
      tags: [],
      pricing: { retail: 0, wholesale: 0, dealer: 0, pricePerMeter: 0, vatIncluded: true }, 
      seo: { title: '', description: '', keywords: [], h1: '', seoText: '' },
      status: 'in_stock',
      documents: []
    };

    const [formState, setFormState] = useState<Partial<Product>>(editingProduct || defaultProduct);
    const [tagInput, setTagInput] = useState('');

    const handleChange = (field: string, value: any) => {
        setFormState(prev => ({...prev, [field]: value}));
    };

    const handlePricingChange = (field: keyof ProductPricing, value: any) => {
        setFormState(prev => ({
            ...prev, 
            pricing: { ...(prev.pricing || defaultProduct.pricing!), [field]: value },
            // Sync legacy field
            pricePerTon: field === 'retail' ? value : prev.pricePerTon,
            pricePerMeter: field === 'pricePerMeter' ? value : prev.pricePerMeter
        }));
    };

    const addTag = () => {
       if(!tagInput.trim()) return;
       const newTags = [...(formState.tags || []), tagInput.trim()];
       handleChange('tags', newTags);
       setTagInput('');
    };

    const removeTag = (tag: string) => {
       handleChange('tags', (formState.tags || []).filter(t => t !== tag));
    };

    const handleFileAdd = (type: ProductDocument['type']) => {
       // Mock file addition
       const newDoc: ProductDocument = {
          id: Math.random().toString(),
          name: `Документ ${type} ${formState.documents?.length || 0 + 1}`,
          url: '#',
          type
       };
       handleChange('documents', [...(formState.documents || []), newDoc]);
    };
    
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('PRODUCTS')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary-900">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h2>
            <p className="text-slate-500 text-sm">{editingProduct ? `ID: ${editingProduct?.id}` : 'Заполните информацию о товаре'}</p>
          </div>
          <div className="ml-auto flex gap-3">
             <button onClick={() => saveProduct(formState)} className="px-6 py-2 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition flex items-center gap-2">
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
                {id: 'files', label: 'Документы'},
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
                       <input 
                        type="text" 
                        value={formState.name} 
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition" 
                        placeholder="Например: Арматура А500С 12мм" 
                        />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Артикул (SKU)</label>
                       <input 
                        type="text" 
                        value={formState.article} 
                        onChange={(e) => handleChange('article', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition" 
                        />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Категория</label>
                       <select 
                        value={formState.category} 
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                        >
                         {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                     </div>
                     
                     <div className="col-span-2">
                        <label className="block text-sm font-bold text-primary-900 mb-2">Теги</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formState.tags?.map((tag, i) => (
                             <span key={i} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                               {tag} <button onClick={() => removeTag(tag)}><X size={12}/></button>
                             </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addTag()}
                              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                              placeholder="Введите тег и нажмите Enter"
                           />
                           <button onClick={addTag} className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200"><Plus size={18}/></button>
                        </div>
                     </div>

                     <div className="col-span-2">
                       <label className="block text-sm font-bold text-primary-900 mb-2">Описание</label>
                       <textarea 
                        rows={6} 
                        value={formState.description || ''} 
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition" 
                        placeholder="Полное описание товара..."
                        ></textarea>
                     </div>
                  </div>
                </div>
              )}

              {tab === 'pricing' && (
                 <div className="space-y-6">
                   <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={formState.pricing?.vatIncluded} 
                           onChange={(e) => handlePricingChange('vatIncluded', e.target.checked)}
                           className="w-5 h-5 accent-brand-500" 
                         />
                         <span className="font-bold text-primary-900">Цена включает НДС (20%)</span>
                      </label>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h4 className="font-bold text-primary-900 mb-4 border-b pb-2">Основные цены</h4>
                        <div className="space-y-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Розничная цена (₽/т)</label>
                              <input 
                                type="number" 
                                value={formState.pricing?.retail} 
                                onChange={(e) => handlePricingChange('retail', Number(e.target.value))}
                                className="w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:border-brand-500 outline-none" 
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Цена за метр (₽)</label>
                              <input 
                                type="number" 
                                value={formState.pricing?.pricePerMeter} 
                                onChange={(e) => handlePricingChange('pricePerMeter', Number(e.target.value))}
                                className="w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:border-brand-500 outline-none" 
                              />
                           </div>
                        </div>
                      </div>

                      <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100">
                         <h4 className="font-bold text-brand-800 mb-4 border-b border-brand-200 pb-2">Оптовые цены</h4>
                         <div className="space-y-4">
                           <div>
                              <label className="text-xs font-bold text-brand-700 uppercase">Опт (от 5т) (₽/т)</label>
                              <input 
                                type="number" 
                                value={formState.pricing?.wholesale} 
                                onChange={(e) => handlePricingChange('wholesale', Number(e.target.value))}
                                className="w-full mt-1 px-4 py-2 bg-white border border-brand-200 rounded-lg focus:border-brand-500 outline-none" 
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-brand-700 uppercase">Дилерская цена (₽/т)</label>
                              <input 
                                type="number" 
                                value={formState.pricing?.dealer} 
                                onChange={(e) => handlePricingChange('dealer', Number(e.target.value))}
                                className="w-full mt-1 px-4 py-2 bg-white border border-brand-200 rounded-lg focus:border-brand-500 outline-none" 
                              />
                           </div>
                        </div>
                      </div>
                   </div>
                 </div>
              )}

              {tab === 'specs' && (
                 <div className="space-y-6">
                    <p className="text-sm text-slate-500 bg-blue-50 p-4 rounded-xl border border-blue-100">
                       <FileText size={16} className="inline mr-2 text-blue-500"/>
                       Эти характеристики используются для фильтрации в каталоге. Выберите из глобальных атрибутов или добавьте свой.
                    </p>
                    
                    <div className="space-y-3">
                       {formState.attributes?.map((attr: ProductAttribute, idx: number) => (
                         <div key={idx} className="flex gap-4 items-center animate-fade-in-down">
                            <input type="text" defaultValue={attr.name} className="w-1/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium" />
                            <input type="text" defaultValue={attr.value} className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg" />
                            <button className="text-red-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                         </div>
                       ))}
                    </div>

                    <div className="border-t pt-4">
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Добавить глобальный атрибут</label>
                       <div className="flex gap-2">
                          <select className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                             <option>Выберите атрибут...</option>
                             {MOCK_GLOBAL_ATTRIBUTES.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                          </select>
                          <button className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600">Добавить</button>
                       </div>
                    </div>
                 </div>
              )}
              
              {tab === 'files' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {formState.documents?.map((doc, i) => (
                          <div key={i} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between group hover:border-brand-500 transition">
                             <div className="flex items-center gap-3">
                                <FileCheck className="text-brand-500" size={24} />
                                <div>
                                   <div className="font-bold text-sm text-primary-900">{doc.name}</div>
                                   <div className="text-xs text-slate-400 uppercase">{doc.type}</div>
                                </div>
                             </div>
                             <button className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                          </div>
                       ))}
                       
                       <button onClick={() => handleFileAdd('certificate')} className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 transition h-24">
                          <Plus size={20} />
                          <span className="text-xs font-bold mt-1">Сертификат</span>
                       </button>
                       <button onClick={() => handleFileAdd('gost')} className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 transition h-24">
                          <Plus size={20} />
                          <span className="text-xs font-bold mt-1">ГОСТ</span>
                       </button>
                    </div>
                 </div>
              )}

              {tab === 'seo' && (
                 <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Meta Title</label>
                       <div className="relative">
                          <input type="text" defaultValue={formState.seo?.title} className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Купить {Name} по цене {Price}..." />
                          <div className="absolute right-3 top-3 text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">56/60</div>
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">H1 Заголовок</label>
                       <input type="text" defaultValue={formState.seo?.h1} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">Meta Description</label>
                       <textarea rows={3} defaultValue={formState.seo?.description} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"></textarea>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-primary-900 mb-2">SEO Текст (внизу страницы)</label>
                       <textarea rows={5} defaultValue={formState.seo?.seoText} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Можно использовать HTML теги..."></textarea>
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
                     <select 
                        value={formState.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium"
                     >
                       <option value="in_stock">✅ В наличии</option>
                       <option value="low_stock">⚠️ Мало</option>
                       <option value="out_of_stock">❌ Нет в наличии</option>
                       <option value="hidden">🔒 Скрыт</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Остаток на складе (т)</label>
                     <input 
                        type="number" 
                        value={formState.stock}
                        onChange={(e) => handleChange('stock', Number(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" 
                     />
                   </div>
                </div>
             </div>

             {/* Media Card */}
             <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
                <h3 className="font-bold text-primary-900 mb-4">Изображение</h3>
                <div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 transition cursor-pointer mb-4 group overflow-hidden relative">
                   {formState.image ? (
                     <img src={formState.image} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <>
                       <Upload size={32} className="mb-2" />
                       <span className="text-xs font-bold">Загрузить фото</span>
                     </>
                   )}
                </div>
                <input 
                    type="text" 
                    value={formState.image || ''}
                    onChange={(e) => handleChange('image', e.target.value)}
                    placeholder="URL изображения..." 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                />
             </div>
          </div>
        </div>
      </div>
    );
  };

  const ExcelImport = () => (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <h2 className="text-2xl font-bold text-primary-900 mb-2">Импорт товаров</h2>
      <p className="text-slate-500 mb-8">Массовая загрузка товаров через Excel. Поддерживаются форматы .xlsx, .csv</p>

      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        <div className="p-12 text-center border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer border-2 border-dashed border-transparent hover:border-brand-300">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet size={40} className="text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">Перетащите файл сюда</h3>
            <p className="text-slate-400 mb-8">или нажмите для выбора файла</p>
            <button className="px-8 py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition">
            Выбрать файл
            </button>
        </div>

        <div className="p-8 bg-gray-50/50">
            <h4 className="font-bold text-primary-900 mb-4">Инструкция по импорту</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm shadow-sm">1</div>
                    <div className="text-sm">
                        <div className="font-bold text-primary-900">Скачайте шаблон</div>
                        <a href="#" className="text-brand-500 hover:underline">Download template.xlsx</a>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm shadow-sm">2</div>
                    <div className="text-sm">
                        <div className="font-bold text-primary-900">Заполните данные</div>
                        <p className="text-slate-500 text-xs">Артикул обязателен для обновления</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm shadow-sm">3</div>
                    <div className="text-sm">
                        <div className="font-bold text-primary-900">Загрузите файл</div>
                        <p className="text-slate-500 text-xs">Система проверит ошибки</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800 flex items-start gap-3">
                <AlertTriangle size={20} className="shrink-0" />
                <p>При совпадении артикула товар будет обновлен. Если артикул не найден — будет создан новый товар.</p>
            </div>
        </div>
      </div>
    </div>
  );

  const CategoryManager = () => (
    <div className="animate-fade-in-up space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-primary-900">Категории</h2>
            <p className="text-slate-500 text-sm">Структура каталога и SEO категорий</p>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20">
            <Plus size={18} /> Новая категория
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
             <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Дерево категорий</h3>
             <ul className="space-y-2">
               {Object.values(ProductCategory).map((cat, i) => (
                 <li key={i} className="group cursor-pointer">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-slate-400 group-hover:text-brand-500"><FolderTree size={16}/></div>
                        <span className="font-medium text-primary-900">{cat}</span>
                        <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-1 hover:bg-white rounded shadow-sm text-slate-500"><Plus size={14} /></button>
                            <button className="p-1 hover:bg-white rounded shadow-sm text-slate-500"><Edit size={14} /></button>
                            <button className="p-1 hover:bg-white rounded shadow-sm text-red-500"><Trash2 size={14} /></button>
                        </div>
                    </div>
                    {/* Mock Subcategory */}
                    {i === 0 && (
                        <div className="pl-8 mt-2 space-y-2">
                             <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm">
                                <span className="text-slate-400">↳</span>
                                <span>Рифленая А500С</span>
                             </div>
                             <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm">
                                <span className="text-slate-400">↳</span>
                                <span>Гладкая А240</span>
                             </div>
                        </div>
                    )}
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="bg-primary-900 rounded-3xl p-8 text-white h-fit sticky top-6">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={20}/> Настройки категории</h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">Название</label>
                   <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" defaultValue="Арматура" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">Родительская категория</label>
                   <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500">
                      <option className="text-primary-900">Нет (Верхний уровень)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">ЧПУ (Slug)</label>
                   <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" defaultValue="armatura" />
                </div>
                
                <div className="pt-4 border-t border-white/10">
                   <div className="mb-4 font-bold text-sm">SEO Настройки</div>
                   <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Meta Title</label>
                            <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm" placeholder="Купить арматуру..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Meta Description</label>
                            <textarea rows={3} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"></textarea>
                        </div>
                   </div>
                </div>
             </div>
             <button className="w-full mt-8 py-3 bg-brand-500 rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20">
               Сохранить изменения
             </button>
          </div>
       </div>
    </div>
  );

  const AttributeManager = () => (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-primary-900">Атрибуты и Фильтры</h2>
         <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition">
            <Plus size={18} /> Создать атрибут
         </button>
       </div>

       <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                   <th className="px-6 py-4">Название</th>
                   <th className="px-6 py-4">Тип</th>
                   <th className="px-6 py-4">Slug</th>
                   <th className="px-6 py-4 text-right">Действия</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {MOCK_GLOBAL_ATTRIBUTES.map(attr => (
                   <tr key={attr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-primary-900">{attr.name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase font-bold text-slate-500">{attr.type}</span></td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{attr.slug}</td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 text-slate-400 hover:text-brand-500"><Edit size={16}/></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
  
  const SEOSettings = () => (
     <div className="max-w-3xl mx-auto animate-fade-in-up space-y-6">
        <h2 className="text-2xl font-bold text-primary-900">SEO Настройки</h2>
        
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
           <h3 className="font-bold text-lg text-primary-900 mb-6">Глобальные шаблоны мета-тегов</h3>
           <p className="text-sm text-slate-500 mb-6">Эти шаблоны будут использоваться для генерации мета-тегов товаров, если они не заполнены вручную.</p>
           
           <div className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-primary-900 mb-2">Шаблон Title товара</label>
                 <input type="text" defaultValue="Купить {Name} цена {Price} руб/т | MetalProm" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                 <div className="flex gap-2 mt-2 text-xs text-slate-500">
                    <span className="bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">{'{Name}'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">{'{Price}'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">{'{Category}'}</span>
                 </div>
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-primary-900 mb-2">Шаблон Description товара</label>
                 <textarea rows={3} defaultValue="Продажа {Name} оптом и в розницу. Характеристики: {Attrs}. Доставка по Москве и области." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"></textarea>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                 <div>
                    <div className="font-bold text-primary-900">Robots.txt</div>
                    <div className="text-xs text-slate-500">Разрешить индексацию</div>
                 </div>
                 <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-brand-500">
                     <span className="absolute left-0 inline-block w-6 h-6 bg-white border border-gray-200 rounded-full shadow transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 flex justify-end">
              <button className="px-8 py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition">
                 Сохранить настройки
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
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                       <td className="px-6 py-4 font-bold text-primary-900">#{order.id.substring(0,8)}...</td>
                       <td className="px-6 py-4">{order.customerName}</td>
                       <td className="px-6 py-4 font-bold">{order.total.toLocaleString()} ₽</td>
                       <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-slate-600">{order.status}</span></td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                     <tr><td colSpan={4} className="p-6 text-center text-slate-400">Нет заказов</td></tr>
                  )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  if (loading && products.length === 0) {
      return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-brand-500" size={48} /></div>;
  }

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
          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Главное</div>
          <SidebarItem view="DASHBOARD" icon={LayoutDashboard} label="Обзор" />
          <SidebarItem view="DASHBOARD" icon={ShoppingCart} label="Заказы" badge={orders.length || undefined} />
          
          <div className="px-4 py-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Каталог</div>
          <SidebarItem view="PRODUCTS" icon={Package} label="Товары" />
          <SidebarItem view="CATEGORIES" icon={FolderTree} label="Категории" />
          <SidebarItem view="ATTRIBUTES" icon={SlidersHorizontal} label="Атрибуты" />
          <SidebarItem view="TAGS" icon={Tag} label="Теги" />

          <div className="px-4 py-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Система</div>
          <SidebarItem view="IMPORT" icon={FileSpreadsheet} label="Импорт" />
          <SidebarItem view="SEO_SETTINGS" icon={Globe} label="SEO Настройки" />
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
              activeView === 'ADD_PRODUCT' ? 'Редактор' : 
              activeView === 'CATEGORIES' ? 'Категории' : 
              activeView === 'IMPORT' ? 'Импорт' : 
              activeView === 'ATTRIBUTES' ? 'Атрибуты' : 'SEO'
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
           {activeView === 'ATTRIBUTES' && <AttributeManager />}
           {activeView === 'SEO_SETTINGS' && <SEOSettings />}
           {activeView === 'TAGS' && <div className="text-center p-12 text-slate-400">Управление тегами (В разработке)</div>}
        </main>
      </div>

    </div>
  );
};