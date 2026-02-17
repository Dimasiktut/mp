import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Settings, LogOut, 
  TrendingUp, TrendingDown, Search,
  ShoppingCart, AlertTriangle, Menu, Plus, Upload, 
  FileSpreadsheet, Edit, Trash2, Save, X, ChevronRight,
  FolderTree, Loader2, Copy, FileText, Globe, Tag, SlidersHorizontal, CheckSquare, Square, FileCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMIN_STATS } from '../constants';
import { Product, ProductCategory, ProductAttribute, Order, ProductPricing, ProductDocument, GlobalAttribute } from '../types';
import { supabase, mapProductFromDB, mapProductToDB } from '../lib/supabase';

// Types for Internal State
type ViewState = 'DASHBOARD' | 'PRODUCTS' | 'ADD_PRODUCT' | 'CATEGORIES' | 'IMPORT' | 'ATTRIBUTES' | 'TAGS' | 'SEO_SETTINGS';

const chartData = [
  { name: 'Пн', sales: 4000 },
  { name: 'Вт', sales: 3000 },
  { name: 'Ср', sales: 2000 },
  { name: 'Чт', sales: 2780 },
  { name: 'Пт', sales: 1890 },
  { name: 'Сб', sales: 2390 },
  { name: 'Вс', sales: 3490 },
];

export const Admin: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [globalAttributes, setGlobalAttributes] = useState<GlobalAttribute[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Dynamic categories
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
      // 1. Products
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodData) setProducts(prodData.map(mapProductFromDB));

      // 2. Orders
      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10);
      if (orderData) {
        setOrders(orderData.map((o: any) => ({
           id: o.id,
           customerName: o.customer_name,
           total: o.total,
           status: o.status,
           date: new Date(o.created_at).toLocaleDateString()
        })));
      }

      // 3. Attributes (Try fetch, if table exists)
      const { data: attrData } = await supabase.from('attributes').select('*');
      if (attrData) setGlobalAttributes(attrData);

      // 4. Categories (Try fetch, if table exists)
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Вы уверены? Это действие необратимо.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
       setProducts(products.filter(p => p.id !== id));
    } else {
      alert('Ошибка удаления: ' + error.message);
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
     
     // If new, remove ID so Supabase generates it
     if (!productData.id) {
       delete dbData.id;
     }

     const { data, error } = await supabase
        .from('products')
        .upsert(dbData)
        .select()
        .single();
     
     if (!error && data) {
       const mapped = mapProductFromDB(data);
       if (editingProduct?.id) {
         setProducts(products.map(p => p.id === mapped.id ? mapped : p));
       } else {
         setProducts([mapped, ...products]);
       }
       setActiveView('PRODUCTS');
       setEditingProduct(null);
     } else {
       console.error(error);
       alert('Ошибка сохранения: ' + (error?.message || 'Неизвестная ошибка'));
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
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.article?.includes(searchTerm)) &&
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

    // Use categories from DB or fallback to Enum
    const categoryOptions = categories.length > 0 
      ? categories.map(c => c.name) 
      : Object.values(ProductCategory);

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">Товары</h2>
            <p className="text-slate-500 text-sm">Управление каталогом ({products.length} позиций)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveView('IMPORT')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-primary-900 rounded-xl font-bold hover:bg-gray-50 transition">
              <FileSpreadsheet size={18} /> Импорт
            </button>
            <button onClick={() => { setEditingProduct(null); setActiveView('ADD_PRODUCT'); }} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20">
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
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                      {/* SAFE ACCESS TO NUMERIC PROPERTIES */}
                      <div className="text-primary-900">{(product.pricePerTon || 0).toLocaleString()} ₽</div>
                      <div className="text-xs text-slate-400">Опт: {(product.pricing?.wholesale || 0).toLocaleString()} ₽</div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {product.stock || 0} т
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
            // Sync legacy fields
            pricePerTon: field === 'retail' ? value : (prev.pricePerTon || 0),
            pricePerMeter: field === 'pricePerMeter' ? value : (prev.pricePerMeter || 0)
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

    const categoryOptions = categories.length > 0 
      ? categories.map(c => c.name) 
      : Object.values(ProductCategory);

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
                         {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
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
                  </div>
                </div>
              )}
              {/* Other tabs mostly static UI, kept safe */}
              {tab === 'pricing' && (
                 <div className="space-y-6">
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
                                className="w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-lg" 
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Цена за метр (₽)</label>
                              <input 
                                type="number" 
                                value={formState.pricing?.pricePerMeter} 
                                onChange={(e) => handlePricingChange('pricePerMeter', Number(e.target.value))}
                                className="w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-lg" 
                              />
                           </div>
                        </div>
                      </div>
                   </div>
                 </div>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 space-y-6">
             <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
                <h3 className="font-bold text-primary-900 mb-4">Статус</h3>
                <select 
                  value={formState.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium"
                >
                  <option value="in_stock">В наличии</option>
                  <option value="low_stock">Мало</option>
                  <option value="out_of_stock">Нет в наличии</option>
                  <option value="hidden">Скрыт</option>
                </select>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Остаток (т)</label>
                  <input 
                    type="number" 
                    value={formState.stock}
                    onChange={(e) => handleChange('stock', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" 
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const AttributeManager = () => {
    const [newAttr, setNewAttr] = useState({ name: '', slug: '', type: 'text' });
    const [localAttrs, setLocalAttrs] = useState<GlobalAttribute[]>(globalAttributes);

    const handleCreate = async () => {
      const attr = { ...newAttr, id: undefined }; // DB generates ID
      const { data, error } = await supabase.from('attributes').insert(attr).select().single();
      if (data) {
        const newEntry = { ...data, id: String(data.id) } as GlobalAttribute;
        setLocalAttrs([...localAttrs, newEntry]);
        setNewAttr({ name: '', slug: '', type: 'text' });
      } else {
        alert("Ошибка создания: " + (error?.message || "Неизвестная ошибка (проверьте таблицу 'attributes')"));
      }
    };

    return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-primary-900">Атрибуты</h2>
       </div>

       {/* Creation Form */}
       <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400">Название</label>
            <input 
              value={newAttr.name} 
              onChange={e => setNewAttr({...newAttr, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg mt-1" 
              placeholder="Например: Диаметр"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400">Slug (код)</label>
            <input 
              value={newAttr.slug} 
              onChange={e => setNewAttr({...newAttr, slug: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg mt-1" 
              placeholder="diameter"
            />
          </div>
          <div className="w-32">
             <label className="text-xs font-bold text-slate-400">Тип</label>
             <select 
               value={newAttr.type}
               onChange={e => setNewAttr({...newAttr, type: e.target.value})}
               className="w-full px-4 py-2 border rounded-lg mt-1"
             >
               <option value="text">Текст</option>
               <option value="number">Число</option>
               <option value="select">Список</option>
             </select>
          </div>
          <button onClick={handleCreate} className="px-6 py-2.5 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600">
            Создать
          </button>
       </div>

       <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                   <th className="px-6 py-4">Название</th>
                   <th className="px-6 py-4">Тип</th>
                   <th className="px-6 py-4">Slug</th>
                   <th className="px-6 py-4 text-right">ID</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {localAttrs.map(attr => (
                   <tr key={attr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-primary-900">{attr.name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase font-bold text-slate-500">{attr.type}</span></td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{attr.slug}</td>
                      <td className="px-6 py-4 text-right text-xs text-slate-300">{attr.id}</td>
                   </tr>
                ))}
                {localAttrs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">Нет атрибутов</td></tr>}
             </tbody>
          </table>
       </div>
    </div>
    );
  };

  const CategoryManager = () => {
    const [newCat, setNewCat] = useState('');
    
    // Simple add implementation
    const handleAdd = async () => {
      if(!newCat) return;
      const { data, error } = await supabase.from('categories').insert({ name: newCat, slug: newCat.toLowerCase().replace(/\s/g, '-') }).select();
      if(data) {
        setCategories([...categories, data[0]]);
        setNewCat('');
      } else {
         alert("Ошибка (проверьте таблицу 'categories'): " + error?.message);
      }
    };

    return (
      <div className="animate-fade-in-up space-y-6">
        <h2 className="text-2xl font-bold text-primary-900">Категории</h2>
        
        <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 flex gap-4">
           <input 
             value={newCat}
             onChange={e => setNewCat(e.target.value)}
             className="flex-1 px-4 py-2 border rounded-xl"
             placeholder="Название новой категории" 
           />
           <button onClick={handleAdd} className="px-6 py-2 bg-brand-500 text-white font-bold rounded-xl">Добавить</button>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
           <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Список</h3>
           <ul className="space-y-2">
             {categories.length > 0 ? categories.map((cat, i) => (
               <li key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
                  <div className="p-1.5 bg-gray-100 rounded-lg text-slate-400"><FolderTree size={16}/></div>
                  <span className="font-medium text-primary-900">{cat.name}</span>
               </li>
             )) : (
               <div className="text-slate-400">Категории не найдены в БД.</div>
             )}
           </ul>
        </div>
      </div>
    );
  }

  // Simplified Dashboard for stability
  const Dashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADMIN_STATS.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-card border border-gray-50">
               <p className="text-slate-400 text-xs font-bold uppercase mb-1">{stat.title}</p>
               <h3 className="text-2xl font-extrabold text-primary-900">{stat.value}</h3>
            </div>
          ))}
       </div>
       <div className="bg-white p-8 rounded-3xl shadow-card h-80">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} />
               <YAxis axisLine={false} tickLine={false} />
               <Tooltip />
               <Area type="monotone" dataKey="sales" stroke="#FF5A1F" fill="#FF5A1F" fillOpacity={0.1} />
             </AreaChart>
           </ResponsiveContainer>
       </div>
    </div>
  );

  if (loading && products.length === 0 && orders.length === 0) {
      return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-brand-500" size={48} /></div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
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
          <SidebarItem view="ATTRIBUTES" icon={SlidersHorizontal} label="Атрибуты" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="text-sm breadcrumbs text-slate-400 hidden md:block">
            Админ панель <span className="mx-2">/</span> <span className="text-primary-900 font-bold">{activeView}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
           {activeView === 'DASHBOARD' && <Dashboard />}
           {activeView === 'PRODUCTS' && <ProductList />}
           {activeView === 'ADD_PRODUCT' && <ProductEditor />}
           {activeView === 'IMPORT' && <div className="p-8 text-center text-slate-400">Импорт в разработке (требуются библиотеки парсинга)</div>}
           {activeView === 'CATEGORIES' && <CategoryManager />}
           {activeView === 'ATTRIBUTES' && <AttributeManager />}
        </main>
      </div>
    </div>
  );
};