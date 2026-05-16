import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { syncProductsFromSupabase } from '@/lib/supabaseSync';
import { normalizeCategory } from '@/lib/categoryUtils';
import phpserver from '@/lib/phpserver';

// Mock product images - in a real app, you'd use actual product images
const mockImageBase = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&auto=format&fit=crop",
];

// Mock products array (used as fallback)
export const mockProducts = [
  // Feminino
  {
    id: "f1",
    name: "Vestido Floral Midi",
    description: "Vestido floral midi com alças ajustáveis e decote em V. Perfeito para ocasiões casuais e festivas.",
    price: 129.90,
    discount: 0,
    imageUrl: mockImageBase[6],
    images: [mockImageBase[6], mockImageBase[7], mockImageBase[6]],
    category: "feminino",
    type: "clothing",
    sizes: ["PP", "P", "M", "G", "GG"],
    colors: ["Preto", "Vermelho", "Azul"],
    stock: 15,
    featured: true,
    on_sale: false,
    showOnHomepage: true
  },
  {
    id: "f2",
    name: "Blusa Cropped Decote Quadrado",
    description: "Blusa cropped com decote quadrado e mangas bufantes. Combina com saias e calças de cintura alta.",
    price: 59.90,
    discount: 10,
    imageUrl: mockImageBase[7],
    images: [mockImageBase[7], mockImageBase[6], mockImageBase[7]],
    category: "feminino",
    type: "clothing",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Branco", "Preto", "Rosa"],
    stock: 20,
    featured: true,
    on_sale: true,
    showOnHomepage: true
  },
  {
    id: "f3",
    name: "Calça Jeans Skinny Cintura Alta",
    description: "Calça jeans skinny de cintura alta com acabamento premium. Modelagem perfeita para valorizar a silhueta.",
    price: 119.90,
    discount: 5,
    imageUrl: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop", mockImageBase[6], "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop"],
    category: "feminino",
    type: "clothing",
    sizes: ["34", "36", "38", "40", "42", "44"],
    colors: ["Azul", "Preto"],
    stock: 25,
    featured: false,
    on_sale: true
  },
  {
    id: "f4",
    name: "Sandália Salto Bloco",
    description: "Sandália com salto bloco de 7cm e tiras delicadas. Confortável para uso durante todo o dia.",
    price: 149.90,
    discount: 20,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop"],
    category: "feminino",
    type: "shoes",
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Nude", "Preto", "Vermelho"],
    stock: 12,
    featured: true,
    on_sale: true
  },

  // Masculino
  {
    id: "m1",
    name: "Camiseta Básica Gola V",
    description: "Camiseta básica com gola V, confeccionada em algodão premium. Confortável para uso diário.",
    price: 49.90,
    discount: 0,
    imageUrl: mockImageBase[1],
    images: [mockImageBase[1], mockImageBase[2], mockImageBase[1]],
    category: "masculino",
    type: "clothing",
    sizes: ["P", "M", "G", "GG", "XG"],
    colors: ["Branco", "Preto", "Cinza", "Azul Marinho"],
    stock: 30,
    featured: true,
    on_sale: false,
    showOnHomepage: true
  },
  {
    id: "m2",
    name: "Calça Jeans Reta",
    description: "Calça jeans de modelagem reta, confortável e durável. Combina com diversos tipos de looks.",
    price: 129.90,
    discount: 10,
    imageUrl: mockImageBase[2],
    images: [mockImageBase[2], mockImageBase[1], mockImageBase[2]],
    category: "masculino",
    type: "clothing",
    sizes: ["38", "40", "42", "44", "46", "48"],
    colors: ["Azul", "Preto", "Azul Escuro"],
    stock: 20,
    featured: false,
    on_sale: true
  },
  {
    id: "m3",
    name: "Camisa Social Slim",
    description: "Camisa social de modelagem slim, confeccionada em tecido premium com acabamento em detalhes.",
    price: 89.90,
    discount: 0,
    imageUrl: mockImageBase[3],
    images: [mockImageBase[3], mockImageBase[2], mockImageBase[3]],
    category: "masculino",
    type: "clothing",
    sizes: ["1", "2", "3", "4", "5"],
    colors: ["Branco", "Azul Claro", "Listrado"],
    stock: 15,
    featured: true,
    on_sale: false,
    showOnHomepage: true
  },
  {
    id: "m4",
    name: "Tênis Casual Couro",
    description: "Tênis casual em couro legítimo, solado em borracha antiderrapante e forro acolchoado.",
    price: 179.90,
    discount: 15,
    imageUrl: mockImageBase[4],
    images: [mockImageBase[4], mockImageBase[5], mockImageBase[4]],
    category: "masculino",
    type: "shoes",
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Preto", "Marrom", "Branco"],
    stock: 10,
    featured: true,
    on_sale: true
  },

  // Kids
  {
    id: "k1",
    name: "Conjunto Infantil Menina",
    description: "Conjunto infantil para menina com blusa estampada e short confortável. Ideal para dias quentes.",
    price: 79.90,
    discount: 5,
    imageUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop"],
    category: "kids",
    type: "clothing",
    sizes: ["2", "4", "6", "8", "10"],
    colors: ["Rosa", "Lilás", "Azul"],
    stock: 20,
    featured: true,
    on_sale: false
  },
  {
    id: "k2",
    name: "Camiseta Infantil Estampada",
    description: "Camiseta infantil com estampa divertida, confeccionada em algodão. Perfeita para o dia a dia.",
    price: 39.90,
    discount: 0,
    imageUrl: "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800&auto=format&fit=crop"],
    category: "kids",
    type: "clothing",
    sizes: ["2", "4", "6", "8", "10", "12"],
    colors: ["Azul", "Vermelho", "Verde"],
    stock: 25,
    featured: false,
    on_sale: false
  },
  {
    id: "k3",
    name: "Tênis Infantil Velcro",
    description: "Tênis infantil com fechamento em velcro para facilitar o calçar. Solado confortável e seguro.",
    price: 99.90,
    discount: 10,
    imageUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"],
    category: "kids",
    type: "shoes",
    sizes: ["24", "25", "26", "27", "28", "29", "30"],
    colors: ["Vermelho", "Azul", "Preto"],
    stock: 15,
    featured: true,
    on_sale: false
  },

  // Acessórios
  {
    id: "a1",
    name: "Bolsa Transversal Média",
    description: "Bolsa transversal média com acabamento em couro ecológico e detalhe em metal dourado.",
    price: 89.90,
    discount: 0,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop"],
    category: "acessórios",
    type: "accessory",
    sizes: ["Único"],
    colors: ["Preto", "Caramelo", "Vermelho"],
    stock: 10,
    featured: true,
    on_sale: false
  },
  {
    id: "a2",
    name: "Cinto Couro Fivela Clássica",
    description: "Cinto em couro legítimo com fivela clássica em metal. Perfeito para looks formais e casuais.",
    price: 59.90,
    discount: 5,
    imageUrl: "https://images.unsplash.com/photo-1625591342274-013d1e8c1c1a?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1625591342274-013d1e8c1c1a?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1625591342274-013d1e8c1c1a?w=800&auto=format&fit=crop"],
    category: "acessórios",
    type: "accessory",
    sizes: ["85", "90", "95", "100", "105"],
    colors: ["Preto", "Marrom"],
    stock: 20,
    featured: false,
    on_sale: false
  },
  {
    id: "a3",
    name: "Óculos de Sol Retrô",
    description: "Óculos de sol com design retrô, armação em acetato e lentes com proteção UV.",
    price: 119.90,
    discount: 15,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop"],
    category: "acessórios",
    type: "accessory",
    sizes: ["Único"],
    colors: ["Preto", "Tartaruga", "Transparente"],
    stock: 8,
    featured: true,
    on_sale: false
  },

  // Calçados extras
  {
    id: "s1",
    name: "Tênis Running Performance",
    description: "Tênis para corrida com tecnologia de amortecimento e suporte para treinos de alta intensidade.",
    price: 249.90,
    discount: 10,
    imageUrl: mockImageBase[5],
    images: [mockImageBase[5], mockImageBase[4], mockImageBase[5]],
    category: "calçados",
    type: "shoes",
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Verde", "Azul/Laranja", "Cinza/Vermelho"],
    stock: 10,
    featured: true,
    on_sale: false
  },
  {
    id: "s2",
    name: "Bota Chelsea Tratorada",
    description: "Bota estilo Chelsea com solado tratorado, elástico nas laterais e puxador traseiro.",
    price: 199.90,
    discount: 25, // Example discount
    imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&auto=format&fit=crop"],
    category: "calçados",
    type: "shoes",
    sizes: ["35", "36", "37", "38", "39"],
    colors: ["Preto", "Marrom Escuro"],
    stock: 5,
    featured: false,
    on_sale: false
  },
  {
    id: "s3",
    name: "Bota Cano Curto Feminina",
    description: "Bota feminina de cano curto em couro sintético com zíper lateral e salto bloco de 5cm.",
    price: 179.90,
    discount: 20,
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop"],
    category: "calçados",
    type: "shoes",
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto", "Caramelo"],
    stock: 8,
    featured: true,
    on_sale: false
  },
];

// Função para carregar produtos do localStorage
export const getProductsFromLocalStorage = async () => {
  try {

    const storedProducts = await phpserver().getProducts();
    if (storedProducts) {
      const parsedProducts = storedProducts;
      console.log(`✅ ${parsedProducts.length} produtos carregados do localStorage`);
      return parsedProducts;
    }
  } catch (error) {
    console.error('Erro ao carregar produtos do localStorage:', error);
  }
  return mockProducts; // Fallback para produtos mockados
};

// Função mais robusta para salvar produtos no localStorage
export const saveProductsToLocalStorage = (products: Product[]) => {
  try {
    if (!Array.isArray(products)) {
      console.error('Tentativa de salvar produtos inválidos no localStorage:', products);
      return false;
    }

    // Garantir que todos os objetos são do tipo Product com validação
    const validProducts = products.filter(p => {
      if (!p || typeof p !== 'object' || !p.id || !p.name) {
        console.warn('Produto inválido ignorado:', p);
        return false;
      }
      return true;
    });

    localStorage.setItem('products', JSON.stringify(validProducts));

    // Disparar evento para notificar outras partes da aplicação
    window.dispatchEvent(new Event('storage'));

    // Registrar ação para debug
    console.log(`✅ ${validProducts.length} produtos salvos no localStorage`);

    // Registrar timestamp da última sincronização
    localStorage.setItem('products_last_sync', Date.now().toString());

    return true;
  } catch (error) {
    console.error('Erro ao salvar produtos no localStorage:', error);
    return false;
  }
};

// Função para verificar se os dados precisam ser sincronizados
export const shouldSyncProducts = (): boolean => {
  try {
    const lastSync = localStorage.getItem('products_last_sync');
    if (!lastSync) return true;

    const lastSyncTime = parseInt(lastSync);
    const now = Date.now();

    // Sincronizar se a última sincronização foi há mais de 5 minutos
    const fiveMinutes = 5 * 60 * 1000;
    return (now - lastSyncTime) > fiveMinutes;
  } catch (error) {
    console.error('Erro ao verificar tempo de sincronização:', error);
    return true; // Em caso de erro, melhor sincronizar
  }
};

// Função para buscar todos os produtos (com verificação de sincronização)
export const getAllProducts = () => {
  // Verifique se há dados no localStorage primeiro
  const localProducts = getProductsFromLocalStorage();
  return localProducts;
};

/**
 * Retrieves products filtered by category.
 * Uses the current product list (localStorage or mock).
 */
export const getProductsByCategory = (category: string) => {
  const allProducts = getAllProducts();
  const normalizedTargetCategory = normalizeCategory(category);

  if (!normalizedTargetCategory) return allProducts; // Return all if category is empty/invalid

  return allProducts.filter(product => normalizeCategory(product.category) === normalizedTargetCategory);
};

/**
 * Retrieves products marked as featured.
 * Uses the current product list (localStorage or mock).
 */
export const getFeaturedProducts = () => {
  const allProducts = getAllProducts();
  // Filtrar por featured === true (produtos marcados como destaque na admin)
  return allProducts.filter(product => !!product.featured);
};

/**
 * Retrieves a single product by its ID.
 * Uses the current product list (localStorage or mock).
 */
export const getProductById = (id: string) => {
  const allProducts = getAllProducts();
  return allProducts.find(product => product.id === id);
};

/**
 * Retrieves products filtered by type (e.g., 'clothing', 'shoes').
 * Uses the current product list (localStorage or mock).
 */
export const getProductsByType = (type: string) => {
  const allProducts = getAllProducts();
  return allProducts.filter(product => product.type === type);
};

/**
 * Retrieves products that have a discount greater than 0.
 * Uses the current product list (localStorage or mock).
 */
export const getDiscountedProducts = () => {
  const allProducts = getAllProducts();
  // Ensure product.discount is treated as a number
  return allProducts.filter(product => Number(product.discount) > 0);
};

/**
 * Retrieves the newest products (implementation might vary - here using first few).
 * Uses the current product list (localStorage or mock).
 * In a real app, this might use a creation date field.
 */
export const getNewArrivals = () => {
  const allProducts = getAllProducts();
  // Simple mock implementation: return the first few products
  return allProducts.slice(0, 4);
};
