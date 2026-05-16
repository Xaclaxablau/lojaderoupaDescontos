import { supabase, fetchProducts as fetchProductsFromSupabase } from '@/lib/supabase';
import { Product } from '@/types';

// Função para buscar produtos do Supabase e armazená-los no localStorage
export const syncProductsFromSupabase = async (): Promise<Product[]> => {
  // Verifica se o cliente Supabase está disponível
  if (!supabase) {
    console.error('Cliente Supabase não está disponível para sincronização');
    return [];
  }
  
  try {
    console.log('🔄 Sincronizando produtos do Supabase...');
    
    // Busca todos os produtos do Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar produtos do Supabase:', error);
      return [];
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('Nenhum produto encontrado no Supabase ou formato inválido');
      return [];
    }
    
    // Converter os dados para o formato correto
    const products: Product[] = data.map(item => ({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
      discount: typeof item.discount === 'number' ? item.discount : parseInt(item.discount || '0'),
      stock: typeof item.stock === 'number' ? item.stock : parseInt(item.stock || '0'),
      imageUrl: item.imageUrl || '',
      images: Array.isArray(item.images) ? item.images : [],
      category: item.category || '',
      type: item.type || 'clothing',
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      colors: Array.isArray(item.colors) ? item.colors : [],
      featured: !!item.featured,
      on_sale: !!item.on_sale,
      showOnHomepage: !!item.showOnHomepage
    }));
    
    // Salvar no localStorage
    try {
      localStorage.setItem('products', JSON.stringify(products));
      console.log(`✅ ${products.length} produtos sincronizados do Supabase para o localStorage`);
      
      // Disparar evento para notificar a aplicação
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
    } catch (storageError) {
      console.error('Erro ao salvar produtos no localStorage:', storageError);
    }
    
    return products;
  } catch (error) {
    console.error('Erro crítico na sincronização de produtos:', error);
    return [];
  }
};

// Função para obter produtos com sincronização
export const getProductsWithSync = async (): Promise<Product[]> => {
  // Primeiro tentar buscar os produtos do localStorage
  const localProducts = getProductsFromLocalStorage();
  
  // Sincronizar com Supabase em background
  syncProductsFromSupabase().catch(error => {
    console.error('Erro na sincronização em background:', error);
  });
  
  return localProducts;
};

// Função para obter produtos do localStorage
const getProductsFromLocalStorage = (): Product[] => {
  try {
    const productsJson = localStorage.getItem('products');
    if (productsJson) {
      const products = JSON.parse(productsJson);
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.error('Erro ao ler produtos do localStorage:', error);
  }
  
  return [];
}; 