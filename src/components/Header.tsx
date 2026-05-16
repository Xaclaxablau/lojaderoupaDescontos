import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCart } from '../contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Product } from '@/types';
import { getAllProducts } from '@/data/products';
import { useAuth } from '@/contexts/AuthContext';
import { getStoreSettings } from '@/lib/localStorage';
import { getNormalizedLink } from '@/lib/categoryUtils';
import phpserver from '@/lib/phpserver';

// Define settings interface
interface StoreSettings {
  storeName: string;
  bannerConfig: {
    imageUrl: string;
    title: string;
    subtitle: string;
    showExploreButton: boolean;
  };
  headerLinks: {
    novidades: boolean;
    masculino: boolean;
    feminino: boolean;
    kids: boolean;
    calcados: boolean;
    acessorios: boolean;
    off: boolean;
    customLinks: {
      label: string;
      enabled: boolean;
    }[];
  };
  storeNameFont?: string;
  storeNameColor?: string;
  headerColor?: string;
  headerLinkColor?: string;
  aboutUs?: {
    enabled: boolean;
    title: string;
    content: string;
    images: string[];
  };
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'TACO',
  bannerConfig: {
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop',
    title: 'Nova Coleção 2024',
    subtitle: 'Descubra as últimas tendências em roupas e calçados para todas as estações',
    showExploreButton: true,
  },
  headerLinks: {
    novidades: true,
    masculino: true,
    feminino: true,
    kids: true,
    calcados: true,
    acessorios: true,
    off: true,
    customLinks: []
  },
  storeNameFont: 'Arial',
  storeNameColor: '#000000',
  headerColor: '#FFFFFF',
  headerLinkColor: '#000000',
  aboutUs: {
    enabled: false,
    title: 'Quem Somos',
    content: '',
    images: []
  }
};

// Helper function for simple deep merging (you might already have this)
const deepMerge = (target: any, source: any): any => {
  // Implementation as added previously
  const output = { ...target };
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (isObject(targetValue) && isObject(sourceValue)) {
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
    Object.keys(source).forEach(key => {
      if (!target.hasOwnProperty(key)) {
        output[key] = source[key];
      }
    });
  }

  return output;
};

// Get settings from localStorage 
const getHeaderSettings = () => {
  try {
    return getStoreSettings();
  } catch (error) {
    console.error('Error loading header settings:', error);
    return defaultSettings;
  }
};

// Function to convert text to URL-friendly format
// const normalizeForUrl = (text: string): string => {
//   return text
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/[^a-z0-9-]/g, "");
// };

// Helper function for link styles
const getLinkStyle = (settings: StoreSettings | null) => ({
  color: settings?.headerLinkColor || defaultSettings.headerLinkColor
});

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(getHeaderSettings());
  const location = useLocation();
  const navigate = useNavigate();
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // New state for search results
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { user, signOut } = useAuth();

  useEffect(() => {
    const carregarSettings = async () => {
      const dados = await phpserver().getStoreSettings();
      localStorage.setItem('storeSettings', JSON.stringify(dados));
      setSettings(dados);
    };

    carregarSettings();
  }, []);

  // Load products on component mount
  useEffect(() => {
    const carregarAllProducts = async () => {
      const products = await getAllProducts();
      setAllProducts(products);
    }

    carregarAllProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
      setSearchResults(filteredProducts); // Mostrar todos os resultados, sem limite
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, allProducts]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchResultsRef.current &&
        searchInputRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Listen for settings changes from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeSettings') {
        console.log("Header detected settings change, reloading..."); // Debug log
        setSettings(getHeaderSettings()); // Reload settings using the robust function
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Cleanup listener on component unmount
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty dependency array ensures this runs only once on mount for the listener setup

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Em vez de navegar para uma nova página, mostrar os resultados filtrados na página atual
    if (searchQuery.trim()) {
      // Filtrar todos os produtos com base na consulta de pesquisa
      const lowercaseQuery = searchQuery.toLowerCase();
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
      setSearchResults(filteredProducts); // Mostrar todos os resultados, sem limite
      setShowSearchResults(true);

      // Focar no campo de pesquisa para mostrar os resultados
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const getLinkClass = (path: string) => {
    // Decode URI components to handle special characters like "ç" in "calçados"
    const decodedPath = decodeURIComponent(path.toLowerCase());
    const decodedLocationPath = decodeURIComponent(location.pathname.toLowerCase());

    const isActive = path === '/'
      ? decodedLocationPath === decodedPath
      : decodedLocationPath.startsWith(decodedPath);

    return isActive
      ? 'px-1 py-1 font-semibold underline-offset-4 underline' // Active style
      : 'px-1 py-1 hover:underline'; // Default style
  };

  const getMobileLinkClass = (path: string) => {
    // Decode URI components to handle special characters like "ç" in "calçados"
    const decodedPath = decodeURIComponent(path.toLowerCase());
    const decodedLocationPath = decodeURIComponent(location.pathname.toLowerCase());

    const isActive = path === '/'
      ? decodedLocationPath === decodedPath
      : decodedLocationPath.startsWith(decodedPath);

    return isActive
      ? 'block px-2 py-1 font-semibold underline-offset-4 underline' // Active mobile style
      : 'block px-2 py-1 hover:underline'; // Default mobile style
  };

  // Ensure settings and headerLinks exist before trying to access them
  const headerLinks = settings?.headerLinks || defaultSettings.headerLinks;

  // Render desktop navigation links
  const renderNavLinks = () => {
    const linkStyle = getLinkStyle(settings);
    return (
      <div className="hidden md:flex space-x-4 items-center">
        {settings?.aboutUs?.enabled && (
          <Link
            to="/about-us"
            className={getLinkClass('/about-us')}
            style={linkStyle}
          >
            {settings?.aboutUs.title || 'Quem Somos'}
          </Link>
        )}
        {headerLinks.novidades && (
          <Link
            to="/products/novidades"
            className={getLinkClass('/products/novidades')}
            style={linkStyle}
          >
            Novidades
          </Link>
        )}
        {headerLinks.masculino && (
          <Link
            to="/products/masculino"
            className={getLinkClass('/products/masculino')}
            style={linkStyle}
          >
            Masculino
          </Link>
        )}
        {headerLinks.feminino && (
          <Link
            to="/products/feminino"
            className={getLinkClass('/products/feminino')}
            style={linkStyle}
          >
            Feminino
          </Link>
        )}
        {headerLinks.kids && (
          <Link
            to="/products/kids"
            className={getLinkClass('/products/kids')}
            style={linkStyle}
          >
            Infantil
          </Link>
        )}
        {headerLinks.calcados && (
          <Link
            to="/products/calcados"
            className={getLinkClass('/products/calcados')}
            style={linkStyle}
          >
            Calçados
          </Link>
        )}
        {headerLinks.acessorios && (
          <Link
            to="/products/acessorios"
            className={getLinkClass('/products/acessorios')}
            style={linkStyle}
          >
            Acessórios
          </Link>
        )}
        {headerLinks.off && (
          <Link
            to="/products/off"
            className={getLinkClass('/products/off')}
            style={linkStyle}
          >
            Ofertas
          </Link>
        )}
        {headerLinks.customLinks?.map((link, index) =>
          link.enabled && (
            <Link
              key={`custom-${index}`}
              to={`/products/${getNormalizedLink(link.label)}`}
              className={getLinkClass(`/products/${getNormalizedLink(link.label)}`)}
              style={linkStyle}
            >
              {link.label}
            </Link>
          )
        )}
      </div>
    );
  };

  // Render mobile navigation links
  const renderMobileLinks = () => {
    const linkStyle = getLinkStyle(settings);

    return (
      <div className="flex flex-col space-y-4 p-4">
        {/* Links padrão */}
        <Link
          to="/"
          className={getMobileLinkClass('/')}
          onClick={() => setIsMenuOpen(false)}
          style={linkStyle}
        >
          Home
        </Link>

        {settings?.aboutUs?.enabled && (
          <Link
            to="/about-us"
            className={getMobileLinkClass('/about-us')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            {settings?.aboutUs.title || 'Quem Somos'}
          </Link>
        )}

        {/* Links do cabeçalho - apenas os habilitados */}
        {headerLinks.novidades && (
          <Link
            to="/products/novidades"
            className={getMobileLinkClass('/products/novidades')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Novidades
          </Link>
        )}
        {headerLinks.masculino && (
          <Link
            to="/products/masculino"
            className={getMobileLinkClass('/products/masculino')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Masculino
          </Link>
        )}
        {headerLinks.feminino && (
          <Link
            to="/products/feminino"
            className={getMobileLinkClass('/products/feminino')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Feminino
          </Link>
        )}
        {headerLinks.kids && (
          <Link
            to="/products/kids"
            className={getMobileLinkClass('/products/kids')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Infantil
          </Link>
        )}
        {headerLinks.calcados && (
          <Link
            to="/products/calcados"
            className={getMobileLinkClass('/products/calcados')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Calçados
          </Link>
        )}
        {headerLinks.acessorios && (
          <Link
            to="/products/acessorios"
            className={getMobileLinkClass('/products/acessorios')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Acessórios
          </Link>
        )}
        {headerLinks.off && (
          <Link
            to="/products/off"
            className={getMobileLinkClass('/products/off')}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            Ofertas
          </Link>
        )}

        {/* Links personalizados - apenas os habilitados */}
        {headerLinks.customLinks?.filter(link => link.enabled).map((link, index) => (
          <Link
            key={`mobile-custom-${index}`}
            to={`/products/${getNormalizedLink(link.label)}`}
            className={getMobileLinkClass(`/products/${getNormalizedLink(link.label)}`)}
            onClick={() => setIsMenuOpen(false)}
            style={linkStyle}
          >
            {link.label}
          </Link>
        ))}

        {/* Admin Panel e Login - Sempre por último */}
        {user ? (
          <>
            <div className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
              <Link
                to="/admin"
                className={`${getMobileLinkClass('/admin')} flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={18} className="mr-2" />
                Painel de Administração
              </Link>
            </div>

            <div className="flex items-center text-red-600 hover:text-red-800 font-medium">
              <button
                className="flex items-center w-full text-left"
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={18} className="mr-2" />
                Sair
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center text-gray-700 hover:text-gray-900 font-medium">
            <Link
              to="/login"
              className={`${getMobileLinkClass('/login')} flex items-center`}
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={18} className="mr-2" />
              Entrar / Login
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="sticky top-0 z-50">
        <header
          className="border-b border-gray-200"
          style={{ backgroundColor: settings?.headerColor || defaultSettings.headerColor }}
        >
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between min-h-14 md:min-h-16 py-2">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span
                  className="text-2xl md:text-3xl font-bold"
                  style={{
                    fontFamily: settings?.storeNameFont || defaultSettings.storeNameFont,
                    color: settings?.storeNameColor || defaultSettings.storeNameColor
                  }}
                >
                  {settings?.storeName || defaultSettings.storeName}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden">
                <Button
                  onClick={toggleMenu}
                  variant="ghost"
                  size="sm"
                  className="p-1 mr-2"
                  style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
                <Link to="/cart" className="relative p-1" style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>
                  <ShoppingCart size={24} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 text-xs text-white bg-shop-red rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex md:flex-1 md:justify-center">
                {renderNavLinks()}
              </nav>

              {/* Desktop Account, Admin, and Cart */}
              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Link to="/admin">
                        <Settings size={20} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={signOut}
                      className="text-red-600 hover:text-red-800"
                    >
                      <LogOut size={20} />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/login">
                      <User size={20} />
                    </Link>
                  </Button>
                )}
                <Link to="/cart" className="p-1 relative hover:text-shop-red" style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white bg-shop-red rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu - Directly below header, still within sticky container */}
        <div
          className={`md:hidden overflow-y-auto transition-all duration-300 border-b border-gray-200 ${isMenuOpen ? 'max-h-[80vh]' : 'max-h-0'}`}
          style={{ backgroundColor: settings?.headerColor || defaultSettings.headerColor }}
        >
          {renderMobileLinks()}
        </div>
      </div>

      {/* Search Bar - Below Header for Desktop and Mobile */}
      <div className="bg-gray-100 py-2 border-b border-gray-200">
        <div className="container px-4 mx-auto">
          <form onSubmit={handleSearch} className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="O que você procura?"
                className="pl-3 pr-10 py-1 rounded-full border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              />
              {searchQuery.trim() && (
                <button
                  type="button"
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </button>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-gray-50 p-2 border-b border-gray-200">
                    <p className="text-sm font-medium">
                      {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                      para "{searchQuery}"
                    </p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map(product => (
                      <li
                        key={product.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="flex items-center p-3">
                          <div className="w-16 h-16 rounded bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160?text=Imagem+não+encontrada';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 truncate">{product.category}</p>
                            <div className="flex items-center mt-1">
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-xs font-medium text-shop-red">
                                    R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through ml-2">
                                    R$ {product.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-medium">
                                  R$ {product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No results message */}
              {showSearchResults && searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 p-4 text-center"
                >
                  <p className="text-sm text-gray-500">Nenhum produto encontrado para "{searchQuery}"</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Header;
