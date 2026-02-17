import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, mapProductFromDB, generateSEO } from '../lib/supabase';
import { Product } from '../types';
import { Loader2, Check, Truck, ShieldCheck, ArrowRight, Home as HomeIcon } from 'lucide-react';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        const mappedProduct = mapProductFromDB(data);
        setProduct(mappedProduct);
        
        // Apply SEO
        const seo = generateSEO(mappedProduct);
        document.title = seo.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', seo.description);
        } else {
          const meta = document.createElement('meta');
          meta.name = 'description';
          meta.content = seo.description;
          document.head.appendChild(meta);
        }
      }
      setLoading(false);
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500" size={48} /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Товар не найден</div>;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-brand-500"><HomeIcon size={16} /></Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-brand-500">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog?category=${product.category}`} className="hover:text-brand-500">{product.category}</Link>
          <span>/</span>
          <span className="text-primary-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {/* Thumbnails (Mock) */}
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3].map((_, i) => (
                 <div key={i} className="aspect-square bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-brand-500 transition overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                 </div>
               ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-8">
             <div>
                <div className="inline-block px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                  {product.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                   <span className="bg-gray-100 px-2 py-1 rounded">Арт: {product.article}</span>
                   <span className="bg-gray-100 px-2 py-1 rounded">Марка: {product.steelGrade}</span>
                </div>
             </div>

             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-4xl font-extrabold text-primary-900">{product.pricePerTon.toLocaleString()} ₽</span>
                   <span className="text-lg text-slate-400 font-medium mb-1">/ тонна</span>
                </div>
                <div className="text-sm text-slate-500 mb-6">
                   Цена за метр: <span className="font-bold text-primary-900">{product.pricePerMeter} ₽</span>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Розница</span>
                      <span className="font-bold">{product.pricePerTon.toLocaleString()} ₽/т</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Опт (от 5т)</span>
                      <span className="font-bold text-brand-600">{(product.pricePerTon * 0.95).toLocaleString()} ₽/т</span>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button className="flex-1 bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-500/20">
                     В корзину
                   </button>
                   <button className="px-6 py-4 bg-white border border-gray-200 text-primary-900 rounded-xl font-bold hover:bg-gray-50 transition">
                     Купить в 1 клик
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl">
                   <Truck className="text-brand-500 shrink-0" />
                   <div>
                      <h4 className="font-bold text-primary-900 text-sm">Доставка 24/7</h4>
                      <p className="text-xs text-slate-500">По Москве и области собственным транспортом</p>
                   </div>
                </div>
                <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl">
                   <ShieldCheck className="text-brand-500 shrink-0" />
                   <div>
                      <h4 className="font-bold text-primary-900 text-sm">Гарантия ГОСТ</h4>
                      <p className="text-xs text-slate-500">Сертификаты качества на каждую партию</p>
                   </div>
                </div>
             </div>

             {/* Dynamic Attributes */}
             <div>
                <h3 className="font-bold text-primary-900 mb-4">Характеристики</h3>
                <div className="overflow-hidden border border-gray-100 rounded-xl">
                   <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-gray-100">
                         <tr className="bg-gray-50/50">
                            <td className="px-4 py-3 text-slate-500 font-medium">Марка стали</td>
                            <td className="px-4 py-3 font-bold text-primary-900">{product.steelGrade}</td>
                         </tr>
                         <tr>
                            <td className="px-4 py-3 text-slate-500 font-medium">Размер/Диаметр</td>
                            <td className="px-4 py-3 font-bold text-primary-900">{product.dimensions}</td>
                         </tr>
                         {product.attributes?.map((attr: any, i: number) => (
                           <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                              <td className="px-4 py-3 text-slate-500 font-medium">{attr.name}</td>
                              <td className="px-4 py-3 font-bold text-primary-900">{attr.value}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
             
             {/* Description */}
             <div>
               <h3 className="font-bold text-primary-900 mb-2">Описание</h3>
               <p className="text-slate-500 leading-relaxed text-sm">
                 {product.description || 'Описание товара отсутствует. Пожалуйста, свяжитесь с менеджером для уточнения деталей.'}
               </p>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};