import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Settings, LogOut, 
  TrendingUp, TrendingDown, Search,
  ShoppingCart, AlertTriangle, Menu, Plus, Upload, 
  FileSpreadsheet, Edit, Trash2, Save, X, ChevronRight,
  FolderTree, Loader2, Copy, FileText, Globe, Tag, SlidersHorizontal, CheckSquare, Square, FileCheck,
  Megaphone, Image as ImageIcon, Eye, EyeOff, ArrowUp, ArrowDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMIN_STATS } from '../constants';
import { Product, ProductCategory, ProductAttribute, Order, ProductPricing, ProductDocument, GlobalAttribute, PromoSlide, Category } from '../types';
import { supabase, mapProductFromDB, mapProductToDB, mapCategoryFromDB, transliterate } from '../lib/supabase';

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
  const [categories, setCategories] = useState<Category[]>([]); // Dynamic categories
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>([]);
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
      if (prodData) {
        setProducts(prodData.map(mapProductFromDB));
      }

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

      // 3. Attributes
      const { data: attrData } = await supabase.from('attributes').select('*');
      if (attrData) setGlobalAttributes(attrData);

      // 4. Categories
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData.map(mapCategoryFromDB));

      // 5. Promo Slides
      const { data: slideData } = await supabase.from('promo_slides').select('*').order('order', { ascending: true });
      if (slideData) {
         setPromoSlides(slideData.map((s: any) => ({
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
       setProducts(prev => prev.filter(p => p.id !== id));
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
     const dbData = mapProductToDB(productData);
     
     // Ensure ID is removed if it's undefined/null to trigger auto-increment/uuid gen
     if (!productData.id) delete dbData.id;

     const { data, error } = await supabase.from('products').upsert(dbData).select().single();
     
     if (!error && data) {
       const mapped = mapProductFromDB(data);
       if (productData.id) {
         setProducts(prev => prev.map(p => p.id === mapped.id ? mapped : p));
       } else {
         setProducts(prev => [mapped, ...prev]);
       }
       setActiveView('PRODUCTS');
       setEditingProduct(null);
     } else {
       console.error("Supabase Error:", error);
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

  const CategoryManager = () => {
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

    const handleSave = async () => {
       if (!editingCategory?.name) return alert('Введите название');
       
       const dbData = {
          name: editingCategory.name,
          slug: editingCategory.slug || transliterate(editingCategory.name),
          image: editingCategory.image,
          description: editingCategory.description,
          seo: editingCategory.seo,
          // Add updated_at if you want
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
            <div>
               <h2 className="text-2xl font-bold text-primary-900">Категории</h2>
               <p className="text-slate-500 text-sm">Управление структурой каталога и SEO</p>
            </div>
            <button 
               onClick={() => setEditingCategory({ 
                  name: '', slug: '', 
                  seo: { title: '', description: '', h1: '', seoText: '' } 
               })}
               className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
            >
               <Plus size={18} /> Новая категория
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* List */}
           <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Список категорий</h3>
              <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                 {categories.map(cat => (
                    <li key={cat.id} 
                        onClick={() => setEditingCategory(cat)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${editingCategory?.id === cat.id ? 'bg-primary-900 text-white border-primary-900' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
                    >
                        <div className={`p-1.5 rounded-lg ${editingCategory?.id === cat.id ? 'bg-white/10' : 'bg-gray-100 text-slate-400'}`}>
                           <FolderTree size={16}/>
                        </div>
                        <span className="font-medium flex-1">{cat.name}</span>
                        <div className="text-xs opacity-50 font-mono">{cat.slug}</div>
                        <button 
                           onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                           className={`p-1.5 rounded hover:bg-red-500 hover:text-white transition ${editingCategory?.id === cat.id ? 'text-white/50' : 'text-slate-300'}`}
                        >
                           <Trash2 size={14} />
                        </button>
                    </li>
                 ))}
                 {categories.length === 0 && <div className="text-slate-400 text-center py-8">Нет категорий</div>}
              </ul>
           </div>

           {/* Editor */}
           {editingCategory ? (
             <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-primary-900">
                      {editingCategory.id ? `Редактирование: ${editingCategory.name}` : 'Создание категории'}
                   </h3>
                   <button onClick={() => setEditingCategory(null)} className="p-2 text-slate-400 hover:text-red-500 bg-gray-50 rounded-lg"><X size={18}/></button>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Название</label>
                      <input 
                         className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                         value={editingCategory.name}
                         onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">ЧПУ (Slug) - Автоматически</label>
                      <input 
                         className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                         value={editingCategory.slug}
                         placeholder={editingCategory.name ? transliterate(editingCategory.name) : ''}
                         onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">URL Изображения</label>
                      <input 
                         className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                         value={editingCategory.image || ''}
                         onChange={e => setEditingCategory({...editingCategory, image: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Описание (HTML)</label>
                      <textarea 
                         rows={4}
                         className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                         value={editingCategory.description || ''}
                         onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                      />
                   </div>
                   
                   <div className="pt-4 border-t border-gray-100">
                      <div className="font-bold text-primary-900 mb-3 flex items-center gap-2"><Globe size={16}/> SEO Настройки</div>
                      <div className="space-y-3">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Meta Title</label>
                            <input 
                               className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg"
                               value={editingCategory.seo?.title || ''}
                               onChange={e => setEditingCategory({
                                  ...editingCategory, 
                                  seo: { ...editingCategory.seo, title: e.target.value } as any
                               })}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">H1 Заголовок</label>
                            <input 
                               className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg"
                               value={editingCategory.seo?.h1 || ''}
                               onChange={e => setEditingCategory({
                                  ...editingCategory, 
                                  seo: { ...editingCategory.seo, h1: e.target.value } as any
                               })}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Meta Description</label>
                            <textarea 
                               rows={3}
                               className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg"
                               value={editingCategory.seo?.description || ''}
                               onChange={e => setEditingCategory({
                                  ...editingCategory, 
                                  seo: { ...editingCategory.seo, description: e.target.value } as any
                               })}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">SEO Текст (внизу страницы)</label>
                            <textarea 
                               rows={5}
                               className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg"
                               value={editingCategory.seo?.seoText || ''}
                               onChange={e => setEditingCategory({
                                  ...editingCategory, 
                                  seo: { ...editingCategory.seo, seoText: e.target.value } as any
                               })}
                            />
                         </div>
                      </div>
                   </div>

                   <button 
                      onClick={handleSave}
                      className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 mt-4"
                   >
                      Сохранить категорию
                   </button>
                </div>
             </div>
           ) : (
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                   <Settings size={32} className="text-slate-300" />
                </div>
                <p>Выберите категорию слева<br/>или создайте новую для редактирования</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  const AttributeManager = () => {
    const [editingAttr, setEditingAttr] = useState<Partial<GlobalAttribute> | null>(null);

    const saveAttribute = async () => {
        if (!editingAttr?.name || !editingAttr?.slug) return alert('Заполните обязательные поля');
        const { data, error } = await supabase.from('attributes').upsert(editingAttr).select().single();
        if (error) return alert(error.message);
        if (data) {
            setGlobalAttributes(prev => {
                const idx = prev.findIndex(a => a.id === data.id);
                if (idx >= 0) {
                    const newArr = [...prev];
                    newArr[idx] = data;
                    return newArr;
                }
                return [...prev, data];
            });
            setEditingAttr(null);
        }
    };

    const deleteAttribute = async (id: string) => {
        if (!confirm('Удалить атрибут?')) return;
        const { error } = await supabase.from('attributes').delete().eq('id', id);
        if (!error) setGlobalAttributes(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-900">Атрибуты товаров</h2>
                <button onClick={() => setEditingAttr({ name: '', slug: '', type: 'text' })} className="flex gap-2 items-center bg-brand-500 text-white px-4 py-2 rounded-xl"><Plus size={18} /> Добавить</button>
            </div>
            
            {editingAttr && (
                <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 mb-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <input placeholder="Название (напр. Диаметр)" value={editingAttr.name} onChange={e => setEditingAttr({...editingAttr, name: e.target.value})} className="border p-2 rounded-lg" />
                        <input placeholder="Slug (напр. diameter)" value={editingAttr.slug} onChange={e => setEditingAttr({...editingAttr, slug: e.target.value})} className="border p-2 rounded-lg" />
                        <select value={editingAttr.type} onChange={e => setEditingAttr({...editingAttr, type: e.target.value as any})} className="border p-2 rounded-lg">
                            <option value="text">Текст</option>
                            <option value="number">Число</option>
                            <option value="select">Выбор</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={saveAttribute} className="bg-brand-500 text-white px-4 py-2 rounded-lg">Сохранить</button>
                        <button onClick={() => setEditingAttr(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Отмена</button>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Название</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Тип</th>
                            <th className="p-4">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {globalAttributes.map(attr => (
                            <tr key={attr.id} className="border-t">
                                <td className="p-4 font-bold">{attr.name}</td>
                                <td className="p-4 text-slate-500">{attr.slug}</td>
                                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{attr.type}</span></td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => setEditingAttr(attr)} className="text-blue-500"><Edit size={16} /></button>
                                    <button onClick={() => deleteAttribute(attr.id)} className="text-red-500"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const PromoManager = () => {
    const [editingSlide, setEditingSlide] = useState<Partial<PromoSlide> | null>(null);

    const saveSlide = async () => {
         if (!editingSlide) return;
         
         // Map to Snake Case for DB
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
             // Map back to Camel Case for Local State
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
                 if (idx >= 0) {
                     const n = [...prev]; n[idx] = mappedData; return n;
                 }
                 return [...prev, mappedData];
             });
             setEditingSlide(null);
         } else {
             alert(error?.message);
         }
    };

    const deleteSlide = async (id: string) => {
        if (!confirm('Удалить слайд?')) return;
        const { error } = await supabase.from('promo_slides').delete().eq('id', id);
        if (!error) setPromoSlides(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-900">Промо слайдер</h2>
                <button onClick={() => setEditingSlide({ order: promoSlides.length + 1, isActive: true, title: '', description: '', image: '', buttonText: 'Подробнее', link: '/catalog' })} className="bg-brand-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"><Plus size={18}/> Добавить слайд</button>
            </div>
            
            {editingSlide && (
                <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input placeholder="Заголовок" value={editingSlide.title} onChange={e => setEditingSlide({...editingSlide, title: e.target.value})} className="border p-2 rounded-lg col-span-2" />
                        <textarea placeholder="Описание" value={editingSlide.description} onChange={e => setEditingSlide({...editingSlide, description: e.target.value})} className="border p-2 rounded-lg col-span-2" rows={2} />
                        <input placeholder="URL Картинки" value={editingSlide.image} onChange={e => setEditingSlide({...editingSlide, image: e.target.value})} className="border p-2 rounded-lg" />
                        <input placeholder="Ссылка кнопки" value={editingSlide.link} onChange={e => setEditingSlide({...editingSlide, link: e.target.value})} className="border p-2 rounded-lg" />
                        <input placeholder="Текст кнопки" value={editingSlide.buttonText} onChange={e => setEditingSlide({...editingSlide, buttonText: e.target.value})} className="border p-2 rounded-lg" />
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Порядок:</label>
                            <input type="number" value={editingSlide.order} onChange={e => setEditingSlide({...editingSlide, order: Number(e.target.value)})} className="border p-2 rounded-lg w-20" />
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <input type="checkbox" checked={editingSlide.isActive} onChange={e => setEditingSlide({...editingSlide, isActive: e.target.checked})} />
                            <label>Активен</label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={saveSlide} className="bg-brand-500 text-white px-4 py-2 rounded-lg">Сохранить</button>
                        <button onClick={() => setEditingSlide(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Отмена</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promoSlides.map(slide => (
                    <div key={slide.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border group">
                        <div className="h-40 bg-gray-100 relative">
                            <img src={slide.image} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold">#{slide.order}</div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold line-clamp-1">{slide.title}</h4>
                            <div className="flex justify-between items-center mt-4">
                                <span className={`text-xs px-2 py-1 rounded ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{slide.isActive ? 'Active' : 'Draft'}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingSlide(slide)} className="p-2 hover:bg-gray-100 rounded"><Edit size={16}/></button>
                                    <button onClick={() => deleteSlide(slide.id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const ProductList = () => {
    return (
        <div className="space-y-6 animate-fade-in-up">
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
                                    <div className="font-bold">{product.pricePerTon.toLocaleString()} ₽</div>
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
                {products.length === 0 && <div className="p-8 text-center text-slate-400">Нет товаров. Добавьте первый товар.</div>}
            </div>
        </div>
    );
  };

  const ProductEditor = () => {
      const [form, setForm] = useState<Partial<Product>>(editingProduct || {
          name: '',
          article: '',
          category: categories.length > 0 ? categories[0].name : ProductCategory.REBAR,
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
      
      const handlePricingChange = (field: string, value: any) => {
          setForm(prev => ({
              ...prev,
              pricing: { ...prev.pricing, [field]: value } as ProductPricing
          }));
      };

      const handleSaveForm = () => {
          if (!form.name || !form.category) return alert('Название и категория обязательны');
          
          // Generate slug if missing or empty, using proper transliteration
          if (!form.slug) {
              form.slug = transliterate(form.name);
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
                      {/* Basic Info */}
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
                                      {categories.length > 0 
                                        ? categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                                        : Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)
                                      }
                                  </select>
                              </div>
                          </div>
                      </div>

                      {/* Specs */}
                      <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                          <h3 className="font-bold text-lg mb-2">Характеристики</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="label text-xs font-bold text-slate-400">Марка стали</label>
                                  <input className="w-full border p-3 rounded-xl bg-gray-50" value={form.steelGrade} onChange={e => handleChange('steelGrade', e.target.value)} />
                              </div>
                              <div>
                                  <label className="label text-xs font-bold text-slate-400">Размеры (Диаметр/Толщина)</label>
                                  <input className="w-full border p-3 rounded-xl bg-gray-50" value={form.dimensions} onChange={e => handleChange('dimensions', e.target.value)} />
                              </div>
                          </div>
                      </div>
                      
                      {/* Description */}
                      <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                           <h3 className="font-bold text-lg mb-2">Описание</h3>
                           <textarea className="w-full border p-3 rounded-xl bg-gray-50 h-32" value={form.description} onChange={e => handleChange('description', e.target.value)} />
                      </div>
                  </div>

                  <div className="space-y-6">
                      {/* Pricing & Stock */}
                      <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
                          <h3 className="font-bold text-lg mb-2">Цена и склад</h3>
                          <div>
                              <label className="label text-xs font-bold text-slate-400">Цена за тонну (₽)</label>
                              <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 text-lg font-bold" value={form.pricePerTon} onChange={e => handleChange('pricePerTon', Number(e.target.value))} />
                          </div>
                          <div>
                              <label className="label text-xs font-bold text-slate-400">Цена за метр (₽)</label>
                              <input type="number" className="w-full border p-3 rounded-xl bg-gray-50" value={form.pricePerMeter} onChange={e => handleChange('pricePerMeter', Number(e.target.value))} />
                          </div>
                          <div>
                              <label className="label text-xs font-bold text-slate-400">Остаток (т)</label>
                              <input type="number" className="w-full border p-3 rounded-xl bg-gray-50" value={form.stock} onChange={e => handleChange('stock', Number(e.target.value))} />
                          </div>
                          <div>
                              <label className="label text-xs font-bold text-slate-400">Статус</label>
                              <select className="w-full border p-3 rounded-xl bg-gray-50" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                                  <option value="in_stock">В наличии</option>
                                  <option value="low_stock">Мало</option>
                                  <option value="out_of_stock">Нет в наличии</option>
                                  <option value="hidden">Скрыт</option>
                              </select>
                          </div>
                      </div>

                      {/* Media */}
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
          <SidebarItem view="PROMO" icon={Megaphone} label="Акции / Слайдер" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="text-sm breadcrumbs text-slate-400 hidden md:block">
            Админ панель <span className="mx-2">/</span> <span className="text-primary-900 font-bold">{
               activeView === 'PROMO' ? 'Слайдер' : activeView
            }</span>
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
           {activeView === 'PROMO' && <PromoManager />}
        </main>
      </div>
    </div>
  );
};