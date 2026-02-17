import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Phone, User, Search, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  // The header should appear "scrolled" (white bg, dark text) if we are actually scrolled OR if we are not on the home page.
  const isHeaderWhite = scrolled || !isHomePage;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-primary-50">
      
      {/* Modern Header */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isHeaderWhite 
            ? 'bg-white/90 backdrop-blur-lg border-gray-200 py-3 shadow-soft' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <span className="text-brand-500 font-extrabold text-xl">M</span>
                </div>
                <span className={`font-bold text-2xl tracking-tight transition-colors ${isHeaderWhite ? 'text-primary-900' : 'text-primary-900 md:text-white'}`}>
                  METAL<span className="text-brand-500">PROM</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className={`hidden md:flex items-center space-x-1 px-2 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${isHeaderWhite ? 'bg-white/50 border-gray-100' : 'bg-white/10 backdrop-blur-sm border-white/20'}`}>
              {[
                { name: 'Главная', path: '/' },
                { name: 'Каталог', path: '/catalog' },
                { name: 'Калькулятор', path: '/#calculator' },
                { name: 'О компании', path: '/#about' },
              ].map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    location.pathname === item.path && item.path !== '/#calculator' && item.path !== '/#about'
                      ? 'bg-white text-primary-900 shadow-sm' 
                      : isHeaderWhite ? 'text-slate-600 hover:text-brand-500' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <div className={`flex flex-col items-end mr-4 transition-colors ${isHeaderWhite ? 'text-primary-900' : 'text-white'}`}>
                <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Поддержка 24/7</span>
                <span className="font-bold text-lg leading-none">+7 (999) 123-45-67</span>
              </div>
              
              <Link to="/cart" className={`relative p-3 rounded-full transition-all ${isHeaderWhite ? 'bg-gray-100 text-primary-900 hover:bg-brand-50 hover:text-brand-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <ShoppingCart size={20} />
                <span className="absolute top-0 right-0 h-4 w-4 bg-brand-500 border-2 border-white text-white text-[9px] flex items-center justify-center rounded-full">2</span>
              </Link>
              
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full font-bold transition-all shadow-glow flex items-center gap-2 transform hover:-translate-y-0.5">
                <span>Кабинет</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`p-2 rounded-lg ${isHeaderWhite ? 'text-primary-900' : 'text-white'}`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 animate-fade-in-down">
            <div className="px-4 space-y-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-primary-900 bg-gray-50 rounded-xl">Главная</Link>
              <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-slate-600 hover:bg-gray-50 rounded-xl">Каталог</Link>
              <a href="#calculator" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-slate-600 hover:bg-gray-50 rounded-xl">Калькулятор</a>
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-brand-600 hover:bg-brand-50 rounded-xl">Админ Панель</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-0">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="bg-primary-900 text-white pt-20 pb-10 rounded-t-[3rem] mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-xl">M</span>
                </div>
                <span className="font-bold text-2xl tracking-tight">METAL<span className="text-brand-500">PROM</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
                Мы создаем надежную основу для вашего будущего. Ведущий поставщик металлопроката с инновационным подходом к логистике и сервису.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all duration-300">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-2 md:col-start-6">
              <h4 className="text-white font-bold mb-6">Продукция</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {['Арматура', 'Трубы', 'Листовой прокат', 'Балки', 'Профнастил'].map(item => (
                  <li key={item}><a href="#" className="hover:text-brand-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-bold mb-6">Компания</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {['О нас', 'Сертификаты', 'Карьера', 'Блог', 'Контакты'].map(item => (
                  <li key={item}><a href="#" className="hover:text-brand-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-3">
              <h4 className="text-white font-bold mb-6">Свяжитесь с нами</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-primary-800 flex items-center justify-center flex-shrink-0 text-brand-500">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="block text-white text-sm font-medium">Центральный офис</span>
                    <span className="text-slate-400 text-xs">Москва, ул. Индустриальная, 45, корп. 2, оф. 104</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-primary-800 flex items-center justify-center flex-shrink-0 text-brand-500">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="block text-white text-sm font-medium">Горячая линия</span>
                    <span className="text-slate-400 text-xs">+7 (495) 999-00-00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2024 MetalProm. Все права защищены.</p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-white">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};