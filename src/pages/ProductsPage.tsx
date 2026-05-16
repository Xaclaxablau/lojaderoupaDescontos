import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllProducts } from '@/data/products';
import { Product } from '@/types';
import { toast } from 'sonner';
import { normalizeCategory, getDisplayCategory, getCategoryFromPath } from '@/lib/categoryUtils';

const ProductsPage = () => {
  const { category: urlCategory } = useParams<{ category: string }>();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Get search query from URL if present
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Estado para armazenar todos os produtos (carregados do localStorage)
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Estado para os produtos que pertencem à categoria atual (antes de filtros)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Estado para os produtos filtrados e ordenados a serem exibidos
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState('default');
  const [carregando, setCarregando] = useState(true);
  // Função para carregar produtos
  const loadProducts = async () => {
    console.log("ProductsPage: Carregando produtos...");
    const loadedProducts = await getAllProducts();
    setCarregando(false);
    setAllProducts(loadedProducts);
  };

  // Carregar produtos na montagem inicial
  useEffect(() => {
    loadProducts();
  }, []);

  // Adicionar listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Recarregar se a chave 'products' mudar
      if (e.key === 'products') {
        console.log("ProductsPage: Detectou mudança nos produtos, recarregando...");
        loadProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Executa apenas na montagem

  // Filtrar produtos por categoria URL ou busca quando allProducts, urlCategory ou searchQuery mudar
  useEffect(() => {
    if (!allProducts.length) return;

    const urlCategoryRaw = urlCategory || '';
    let initialProducts: Product[] = [];

    console.log(`ProductsPage: Filtrando por categoria da URL: ${urlCategoryRaw}`);
    console.log(`ProductsPage: Total de produtos carregados: ${allProducts.length}`);

    // First filter by category if specified
    if (!urlCategoryRaw) {
      initialProducts = allProducts; // Nenhuma categoria na URL, mostrar todos
    } else if (urlCategoryRaw === 'off') {
      initialProducts = allProducts.filter(p => Number(p.discount) > 0);
    } else if (urlCategoryRaw === 'novidades') {
      // Filtrar produtos marcados para exibição na página de novidades
      initialProducts = allProducts.filter(p => p.showOnHomepage);
    } else if (urlCategoryRaw === 'featured') {
      // Filtrar produtos marcados como "featured" (destaque)
      initialProducts = allProducts.filter(p => !!p.featured);
    } else {
      // Aqui o tratamento para categorias personalizadas
      console.log(`Buscando produtos para categoria: ${urlCategoryRaw}`);

      // Primeiro tenta uma correspondência exata com a categoria bruta
      initialProducts = allProducts.filter(p => {
        // Tentar match direto com o valor da categoria
        if (p.category === urlCategoryRaw) {
          console.log(`Match direto encontrado para ${p.name} com categoria ${p.category}`);
          return true;
        }

        // Tentar match com normalização
        const productCategoryPath = p.category.split('/').pop() || p.category;
        const match = productCategoryPath === urlCategoryRaw;
        if (match) {
          console.log(`Match pelo caminho encontrado para ${p.name} com categoria ${p.category}`);
        }
        return match;
      });

      console.log(`Produtos encontrados para ${urlCategoryRaw}: ${initialProducts.length}`);

      // Se não encontrar produtos, tentar uma correspondência com normalização
      if (initialProducts.length === 0) {
        console.log(`Tentando correspondência com normalização para: ${urlCategoryRaw}`);
        const normalizedUrlCategory = normalizeCategory(urlCategoryRaw);

        initialProducts = allProducts.filter(p => {
          const productCategoryNormalized = normalizeCategory(p.category);
          return productCategoryNormalized === normalizedUrlCategory;
        });

        console.log(`Produtos encontrados com normalização: ${initialProducts.length}`);
      }

      // Se ainda não encontrar, tenta correspondência parcial
      if (initialProducts.length === 0) {
        console.log(`Tentando correspondência parcial para: ${urlCategoryRaw}`);
        initialProducts = allProducts.filter(p => {
          return p.category.toLowerCase().includes(urlCategoryRaw.toLowerCase()) ||
            urlCategoryRaw.toLowerCase().includes(p.category.toLowerCase());
        });

        console.log(`Produtos encontrados com correspondência parcial: ${initialProducts.length}`);
      }
    }

    // Then apply search filter if present
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      initialProducts = initialProducts.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
      console.log(`ProductsPage: Filtrando por busca: "${searchQuery}" (${initialProducts.length} resultados)`);
    }

    console.log(`ProductsPage: Encontrados ${initialProducts.length} produtos para a categoria/busca.`);
    setCategoryProducts(initialProducts);

    // Atualizar range de preço com base nos produtos da categoria
    if (initialProducts.length > 0) {
      const prices = initialProducts.map(p =>
        Number(p.discount) > 0 ? Number(p.price) * (1 - Number(p.discount) / 100) : Number(p.price)
      );
      const min = 0; // Always keep min at 0
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
      // Resetar o slider para o novo range apenas se ele estiver fora
      setPriceRange([0, max]); // Always start at 0
    } else {
      setMinPrice(0);
      setMaxPrice(500);
      setPriceRange([0, 500]);
    }
  }, [urlCategory, allProducts, searchQuery]);

  // Aplicar filtros (preço, ordenação) aos produtos da categoria
  useEffect(() => {
    let result = [...categoryProducts]; // Começa com os produtos já filtrados por categoria

    // Filtrar por preço
    result = result.filter(product => {
      const finalPrice = Number(product.discount) > 0
        ? Number(product.price) * (1 - Number(product.discount) / 100)
        : Number(product.price);
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

    // Ordenar
    if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const priceA = Number(a.discount) > 0 ? Number(a.price) * (1 - Number(a.discount) / 100) : Number(a.price);
        const priceB = Number(b.discount) > 0 ? Number(b.price) * (1 - Number(b.discount) / 100) : Number(b.price);
        return priceA - priceB;
      });
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const priceA = Number(a.discount) > 0 ? Number(a.price) * (1 - Number(a.discount) / 100) : Number(a.price);
        const priceB = Number(b.discount) > 0 ? Number(b.price) * (1 - Number(b.discount) / 100) : Number(b.price);
        return priceB - priceA;
      });
    } else if (sortBy === 'discount') {
      result.sort((a, b) => Number(b.discount) - Number(a.discount));
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    // 'default' não precisa de sort extra aqui, mantém a ordem original da categoria

    setDisplayProducts(result); // Atualiza os produtos a serem exibidos

  }, [categoryProducts, priceRange, sortBy]); // Depende dos produtos da categoria e dos filtros

  // Handlers para filtros
  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSortBy('default');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Memoizar o cálculo para mostrar botão de limpar filtros
  const showClearFilters = useMemo(() => {
    return priceRange[0] !== minPrice || priceRange[1] !== maxPrice || sortBy !== 'default';
  }, [priceRange, minPrice, maxPrice, sortBy]);

  // Título da página - update to include search query
  const pageTitle = useMemo(() => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }

    const normCat = urlCategory ? normalizeCategory(urlCategory) : '';
    if (normCat === 'off') return 'Produtos em Oferta';
    if (normCat === 'novidades') return 'Novidades';
    if (normCat === 'featured') return 'Produtos em Destaque';
    if (normCat) return normCat.charAt(0).toUpperCase() + normCat.slice(1);
    return 'Todos os Produtos';
  }, [urlCategory, searchQuery]);
  if (carregando) {
    return (
      <>
        <Header />
        <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-700">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold">Aguarde um momento...</p>
        </div>
      </>
    )
  }
  return (
    <>
      <Header />
      <main className="container px-4 mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-gray-600">{displayProducts.length} produtos encontrados</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Botão de Filtros Mobile */}
          {isMobile && (
            <Button
              variant="outline"
              className="w-full mb-4 md:hidden"
              onClick={toggleFilters}
            >
              {showFilters ? <X size={16} className="mr-2" /> : <SlidersHorizontal size={16} className="mr-2" />}
              {showFilters ? 'Fechar Filtros' : 'Mostrar Filtros'}
            </Button>
          )}

          {/* Sidebar de Filtros */}
          {(showFilters || !isMobile) && (
            <aside className={`w-full md:w-64 lg:w-72 ${isMobile ? 'mb-8' : ''}`}>
              <ProductFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                showClearFilters={showClearFilters}
                onClearFilters={resetFilters}
              />
            </aside>
          )}

          {/* Grid de Produtos */}
          <section className="flex-1">
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {displayProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>
                {showClearFilters && (
                  <Button variant="link" onClick={resetFilters} className="mt-4">
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductsPage;
