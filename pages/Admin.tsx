import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Settings, 
  TrendingUp, Plus, Edit, Trash2, X, ChevronRight,
  FolderTree, Loader2, Copy, Globe, SlidersHorizontal,
  Megaphone, Eye, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMIN_STATS } from '../constants';
import { Product, ProductCategory, Order, ProductPricing, GlobalAttribute, PromoSlide, Category } from '../types';
import { supabase, mapProductFromDB, mapProductToDB, mapCategoryFromDB } from '../lib/supabase';

// Types for Internal State
type ViewState = 'DASHBOARD' | 'PRODUCTS' | 'ADD_PRODUCT' | 'CATEGORIES' | 'IMPORT' | 'ATTRIBUTES' | 'TAGS' | 'SEO_SETTINGS' | 'PROMO';

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
  const [categories, setCategories] = useState<Category[]>([]); 
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    // 1. Load Products (Simplified for debugging)
    try {
      // Убрали сортировку, чтобы исключить ошибку отсутствия колонки created_at
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Supabase products error:', error);
        setErrorMsg(`Ошибка загрузки товаров: ${error.message} (код: ${error.code})`);
      } else if (data) {
        console.log('Loaded products:', data);
        setProducts(data.map(mapProductFromDB));
      }
    } catch (e: any) {
      console.error("Critical error loading products:", e);
      setErrorMsg(`Критическая ошибка: ${e.message}`);
    }

    // 2. Load Orders
    try {
      const { data } = await supabase.from('orders').select('*').limit(20);
      if (data) {
        setOrders(data.map((o: any) => ({
           id: o.id,
           customerName: o.customer_name,
           total: o.total,
           status: o.status,
           date: new Date(o.created_at || Date.now()).toLocaleDateString()
        })));
      }
    } catch (e) { console.error(e); }

    // 3. Load Attributes
    try {
      const { data } = await supabase.from('attributes').select('*');
      if (data) setGlobalAttributes(data);
    } catch (e) { console.error(e); }

    // 4. Load Categories
    try {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data.map(mapCategoryFromDB));
    } catch (e) { console.error(e); }

    // 5. Load Slides
    try {
      const { data } = await supabase.from('promo_slides').select('*');
      if (data) {
         setPromoSlides(data.map((s: any) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            image: s.image,
            link: s.link,
            buttonText: s.button_text,
            isActive: s.is_active,
            order: s.order
         })));
      }
    } catch (e) { console.error(e); }

    setLoading(false);
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
      id: undefined 
    };
    await saveProduct(newProduct);
  };

  const saveProduct = async (productData: any) => {
     const dbData = mapProductToDB(productData);
     if (!productData.id) delete dbData.id;

     const { data, error } = await supabase.from('products').upsert(dbData).select().single();
     
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

  // --- UI Components ---

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

  const ProductList = () => (
    <div className="space-y-6 animate-fade-in-up">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
             <AlertCircle className="shrink-0 mt-0.5" size={20} />
             <div>
               <h4 className="font-bold">Ошибка загрузки данных</h4>
               <p className="text-sm mt-1">{errorMsg}</p>
               <p className="text-xs mt-2 text-red-500">Проверьте права доступа (RLS) в Supabase или наличие таблицы 'products'.</p>
             </div>
          </div>
        )}

        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary-900">Товары ({products.length})</h2>
            <button 
              onClick={() => { setEditingProduct(null); setActiveView('ADD_PRODUCT'); }} 
              className="bg-brand-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-600 transition"
            >
                <Plus size={18} /> Добавить товар
            </button>
        </div>

        <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4">Фото</th>
                        <th className="p-4">Название / Артикул</th>
                        <th className="p-4">Категория</th>
                        <th className="p-4">Цена / Остаток</th>
                        <th className="p-4">Статус</th>
                        <th className="p-4 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition">
                            <td className="p-4 w-20">
                                <img src={product.image || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-primary-900">{product.name}</div>
                                <div className="text-xs text-slate-400">{product.article}</div>
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-600">
                                {product.category}
                            </td>
                            <td className="p-4">
                                <div className="font-bold">{(product.pricePerTon || 0).toLocaleString()} ₽</div>
                                <div className="text-xs text-slate-400">{product.stock} т.</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    product.status === 'in_stock' ? 'bg-green-100 text-green-700' : 
                                    product.status === 'out_of_stock' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {product.status === 'in_stock' ? 'В наличии' : product.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => { setEditingProduct(product); setActiveView('ADD_PRODUCT'); }} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition"><Edit size={16}/></button>
                                    <button onClick={() => duplicateProduct(product)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"><Copy size={16}/></button>
                                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length === 0 && !errorMsg && (
                <div className="p-12 text-center text-slate-400">
                   <Package size={48} className="mx-auto mb-4 opacity-20" />
                   <p>Список товаров пуст.</p>
                   <p className="text-xs mt-2">Возможно, база данных пуста или настроен RLS.</p>
                </div>
            )}
        </div>
    </div>
  );

  const ProductEditor = () => {
    const [form, setForm] = useState<Partial<Product>>(editingProduct || {
        name: '',
        article: '',
        category: ProductCategory.REBAR,
        pricePerTon: 0,
        pricePerMeter: 0,
        stock: 0,
        status: 'in_stock',
        steelGrade: '',
        dimensions: '',
        image: '',
        description: '',
        attributes: [],
        seo: { title: '', description: '', keywords: [] },
        pricing: { retail: 0, wholesale: 0, dealer: 0, pricePerMeter: 0, vatIncluded: true }
    });

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveForm = () => {
        if (!form.name || !form.category) return alert('Название и категория обязательны');
        if (!form.slug) {
            form.slug = form.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        saveProduct(form);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveView('PRODUCTS')} className="p-2 hover:bg-white rounded-full transition"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-2xl font-bold text-primary-900">{editingProduct ? 'Редактирование товара' : 'Новый товар'}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                        <h3 className="font-bold text-lg mb-2">Основная информация</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="label text-xs font-bold text-slate-400">Название</label>
                                <input className="w-full border p-3 rounded-xl bg-gray-50" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label className="label text-xs font-bold text-slate-400">Артикул</label>
                                <input className="w-full border p-3 rounded-xl bg-gray-50" value={form.article} onChange={e => handleChange('article', e.target.value)} />
                            </div>
                            <div>
                                <label className="label text-xs font-bold text-slate-400">Категория</label>
                                <select className="w-full border p-3 rounded-xl bg-gray-50" value={form.category as string} onChange={e => handleChange('category', e.target.value)}>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    {categories.length === 0 && Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                         <h3 className="font-bold text-lg mb-2">Описание</h3>
                         <textarea className="w-full border p-3 rounded-xl bg-gray-50 h-32" value={form.description} onChange={e => handleChange('description', e.target.value)} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                        <h3 className="font-bold text-lg mb-2">Цена и склад</h3>
                        <div>
                            <label className="label text-xs font-bold text-slate-400">Цена за тонну (₽)</label>
                            <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 text-lg font-bold" value={form.pricePerTon} onChange={e => handleChange('pricePerTon', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="label text-xs font-bold text-slate-400">Остаток (т)</label>
                            <input type="number" className="w-full border p-3 rounded-xl bg-gray-50" value={form.stock} onChange={e => handleChange('stock', Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                        <h3 className="font-bold text-lg mb-2">Медиа</h3>
                        <div>
                            <label className="label text-xs font-bold text-slate-400">URL Изображения</label>
                            <input className="w-full border p-3 rounded-xl bg-gray-50 text-sm" value={form.image} onChange={e => handleChange('image', e.target.value)} />
                        </div>
                        {form.image && (
                            <div className="rounded-xl overflow-hidden h-40 bg-gray-100">
                                <img src={form.image} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button onClick={handleSaveForm} className="bg-brand-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 flex-1">Сохранить товар</button>
                <button onClick={() => setActiveView('PRODUCTS')} className="bg-gray-100 text-primary-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Отмена</button>
            </div>
        </div>
    );
  };

  const CategoryManager = () => {
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

    const handleSave = async () => {
       if (!editingCategory?.name) return alert('Введите название');
       
       const dbData = {
          name: editingCategory.name,
          slug: editingCategory.slug || editingCategory.name.toLowerCase().replace(/\s/g, '-'),
          image: editingCategory.image,
          description: editingCategory.description,
          seo: editingCategory.seo,
       };

       let result;
       if (editingCategory.id) {
          result = await supabase.from('categories').update(dbData).eq('id', editingCategory.id).select();
       } else {
          result = await supabase.from('categories').insert(dbData).select();
       }

       if (result.data) {
          const newCat = mapCategoryFromDB(result.data[0]);
          if (editingCategory.id) {
             setCategories(categories.map(c => c.id === newCat.id ? newCat : c));
          } else {
             setCategories([...categories, newCat]);
          }
          setEditingCategory(null);
       } else {
          alert('Ошибка: ' + result.error?.message);
       }
    };

    const handleDelete = async (id: string) => {
        if(!confirm('Удалить категорию?')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if(!error) setCategories(categories.filter(c => c.id !== id));
    };

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-900">Категории</h2>
                <button 
                onClick={() => setEditingCategory({ name: '', slug: '', seo: { title: '', description: '', h1: '', seoText: '' } })}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold"
                >
                <Plus size={18} /> Новая категория
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
                    <ul className="space-y-2">
                        {categories.map(cat => (
                            <li key={cat.id} 
                                onClick={() => setEditingCategory(cat)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${editingCategory?.id === cat.id ? 'bg-primary-900 text-white' : 'hover:bg-gray-50'}`}
                            >
                                <FolderTree size={16}/>
                                <span className="font-medium flex-1">{cat.name}</span>
                                <button onClick={(e) => {e.stopPropagation(); handleDelete(cat.id)}} className="hover:text-red-500"><Trash2 size={14} /></button>
                            </li>
                        ))}
                    </ul>
                </div>

                {editingCategory && (
                    <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8 space-y-4">
                        <h3 className="font-bold">Редактирование</h3>
                        <input className="w-full border p-2 rounded" placeholder="Название" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Slug" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Image URL" value={editingCategory.image || ''} onChange={e => setEditingCategory({...editingCategory, image: e.target.value})} />
                        <button onClick={handleSave} className="w-full bg-brand-500 text-white py-2 rounded font-bold">Сохранить</button>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const PromoManager = () => {
    const [editingSlide, setEditingSlide] = useState<Partial<PromoSlide> | null>(null);

    const saveSlide = async () => {
         if (!editingSlide) return;
         const dbData = {
             id: editingSlide.id,
             title: editingSlide.title,
             description: editingSlide.description,
             image: editingSlide.image,
             link: editingSlide.link,
             button_text: editingSlide.buttonText,
             is_active: editingSlide.isActive,
             order: editingSlide.order
         };
         if (!dbData.id) delete dbData.id;

         const { data, error } = await supabase.from('promo_slides').upsert(dbData).select().single();
         if (!error && data) {
             const mappedData = {
                id: data.id,
                title: data.title,
                description: data.description,
                image: data.image,
                link: data.link,
                buttonText: data.button_text,
                isActive: data.is_active,
                order: data.order
             };
             setPromoSlides(prev => {
                 const idx = prev.findIndex(s => s.id === mappedData.id);
                 if (idx >= 0) { const n = [...prev]; n[idx] = mappedData; return n; }
                 return [...prev, mappedData];
             });
             setEditingSlide(null);
         }
    };

    const deleteSlide = async (id: string) => {
        if (!confirm('Удалить?')) return;
        const { error } = await supabase.from('promo_slides').delete().eq('id', id);
        if (!error) setPromoSlides(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-900">Слайдер</h2>
                <button onClick={() => setEditingSlide({ order: promoSlides.length + 1, isActive: true, title: '', description: '', image: '', buttonText: 'Подробнее', link: '/catalog' })} className="bg-brand-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"><Plus size={18}/> Добавить</button>
            </div>
            
            {editingSlide && (
                <div className="bg-white p-6 rounded-3xl shadow-card mb-6 grid gap-4">
                    <input placeholder="Заголовок" value={editingSlide.title} onChange={e => setEditingSlide({...editingSlide, title: e.target.value})} className="border p-2 rounded" />
                    <input placeholder="Текст кнопки" value={editingSlide.buttonText} onChange={e => setEditingSlide({...editingSlide, buttonText: e.target.value})} className="border p-2 rounded" />
                    <div className="flex gap-2">
                        <button onClick={saveSlide} className="bg-brand-500 text-white px-4 py-2 rounded">Сохранить</button>
                        <button onClick={() => setEditingSlide(null)} className="bg-gray-200 px-4 py-2 rounded">Отмена</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promoSlides.map(slide => (
                    <div key={slide.id} className="bg-white rounded-2xl shadow p-4 relative">
                        <img src={slide.image} className="h-32 w-full object-cover rounded mb-2" />
                        <h4 className="font-bold">{slide.title}</h4>
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button onClick={() => setEditingSlide(slide)} className="p-1 bg-white rounded shadow"><Edit size={14}/></button>
                            <button onClick={() => deleteSlide(slide.id)} className="p-1 bg-white rounded shadow text-red-500"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <SidebarItem view="PROMO" icon={Megaphone} label="Слайдер" />
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
           {loading ? (
             <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-brand-500" size={48} /></div>
           ) : (
             <>
               {activeView === 'DASHBOARD' && <Dashboard />}
               {activeView === 'PRODUCTS' && <ProductList />}
               {activeView === 'ADD_PRODUCT' && <ProductEditor />}
               {activeView === 'CATEGORIES' && <CategoryManager />}
               {activeView === 'PROMO' && <PromoManager />}
             </>
           )}
        </main>
      </div>
    </div>
  );
};