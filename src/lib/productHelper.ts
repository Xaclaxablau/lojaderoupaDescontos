import { Product } from '@/types';
import { supabase, saveProduct as saveProductToSupabase, fetchProducts as fetchProductsFromSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import phpserver from '@/lib/phpserver';
/**
 * Salva um produto de forma mais robusta, com melhor tratamento de erros
 * e garantindo a sincronização entre o Supabase e o localStorage
 */
export const saveProductRobust = async (product: Product): Promise<Product> => {
  // Validar campos obrigatórios antes de prosseguir
  if (!product.name || !product.name.trim()) {
    throw new Error('Nome do produto é obrigatório');
  }

  // Garantir que o produto tenha um ID
  if (!product.id) {
    product.id = crypto.randomUUID();
  }

  // Normalizar valores para evitar erros
  const normalizedProduct: Product = {
    ...product,
    price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price) || '0') || 0,
    discount: typeof product.discount === 'number' ? product.discount : parseInt(String(product.discount) || '0') || 0,
    stock: typeof product.stock === 'number' ? product.stock : parseInt(String(product.stock) || '0') || 0,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    images: Array.isArray(product.images) ? product.images : [],
    featured: !!product.featured,
    on_sale: !!product.on_sale,
    showOnHomepage: !!product.showOnHomepage,
    imageUrl: product.imageUrl || '',
    description: product.description || '',
    category: product.category || '',
    type: product.type || 'clothing'
  };

  console.log('🔄 Salvando produto normalizado:', normalizedProduct.name);

  const savedLocally = saveToLocalStorageOnly(normalizedProduct);
  return savedLocally;
};

/**
 * Verifica se o produto foi realmente salvo no Supabase
 */
const confirmProductSaved = async (productId: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    // Aguardar um pouco para garantir que os dados foram persistidos
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verificar se o produto existe no Supabase
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (error || !data) {
      console.error('Produto não encontrado após salvamento:', error);
      return false;
    }

    console.log('✅ Confirmação: Produto persistido no Supabase com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao confirmar persistência do produto:', error);
    return false;
  }
};

/**
 * Tenta salvar o produto no Supabase com tratamento de erros aprimorado
 */
const saveToSupabase = async (product: Product): Promise<Product> => {
  if (!supabase) {
    throw new Error('Cliente Supabase não disponível');
  }

  try {
    // Garantir que o produto tenha uma estrutura adequada para o Supabase
    const supabaseProduct = {
      ...product,
      // Garantir que arrays vazios sejam enviados como arrays vazios, não null
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || []
    };

    // Tentativa 1: Usar a função existente do supabase.ts
    try {
      const savedProduct = await saveProductToSupabase(supabaseProduct);
      return savedProduct;
    } catch (error: any) {
      console.error('Erro na primeira tentativa de salvamento:', error);

      // Se for erro específico do Supabase, fazer uma segunda tentativa
      if (error.code) {
        console.log('Fazendo segunda tentativa com método alternativo...');

        // Tentativa 2: Inserir/atualizar diretamente
        const { data, error: secondError } = await supabase
          .from('products')
          .upsert(supabaseProduct, {
            onConflict: 'id'
          })
          .select();

        if (secondError) {
          throw secondError;
        }

        // Verificar se temos dados retornados usando tipagem segura
        if (data && Array.isArray(data) && data.length > 0) {
          return data[0] as Product;
        } else {
          // Se não temos dados retornados, mas não houve erro, o produto provavelmente foi salvo
          // Vamos buscar o produto pelo ID para confirmar
          try {
            const { data: fetchedData, error: fetchError } = await supabase
              .from('products')
              .select('*')
              .eq('id', supabaseProduct.id)
              .single();

            if (fetchError) {
              console.error('Erro ao buscar produto após salvamento:', fetchError);
            }

            if (fetchedData) {
              return fetchedData as Product;
            }
          } catch (fetchError) {
            console.error('Erro ao buscar produto após salvamento:', fetchError);
          }

          // Se não conseguimos buscar, retornar o produto original
          return supabaseProduct;
        }
      } else {
        throw error; // Se não for erro do Supabase, propagar o erro
      }
    }
  } catch (error) {
    console.error('Todas as tentativas de salvamento no Supabase falharam:', error);
    throw error;
  }
};

/**
 * Atualiza o localStorage com o produto salvo
 */
const updateLocalStorage = (product: Product): void => {
  try {
    // Obter produtos existentes
    const storedProductsJson = localStorage.getItem('products');
    let storedProducts: Product[] = [];

    if (storedProductsJson) {
      try {
        const parsed = JSON.parse(storedProductsJson);
        if (Array.isArray(parsed)) {
          storedProducts = parsed;
        }
      } catch (e) {
        console.error('Erro ao analisar produtos do localStorage:', e);
      }
    }

    // Encontrar e atualizar o produto existente ou adicionar o novo
    const existingIndex = storedProducts.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      storedProducts[existingIndex] = product;
    } else {
      storedProducts.push(product);
    }

    // Salvar a lista atualizada
    localStorage.setItem('products', JSON.stringify(storedProducts));
    try {
      phpserver().updateProducts(storedProducts);
    } catch (e) {
      console.log(e);
    }
    // Disparar evento para notificar outras partes da aplicação
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Erro ao atualizar localStorage:', error);
  }
};

/**
 * Salva o produto apenas no localStorage quando o Supabase falha
 */
const saveToLocalStorageOnly = (product: Product): Product => {
  updateLocalStorage(product);
  return product;
};

/**
 * Sincroniza produtos entre localStorage e Supabase
 * Deve ser chamada no carregamento da página
 */
export const syncProducts = async (): Promise<Product[]> => {
  console.log('🔄 Iniciando sincronização de produtos...');
  try {
    // 1. Buscar produtos do Supabase
    const phpProducts = await phpserver().getProducts();

    if (!phpProducts || phpProducts.length === 0) {
      console.log('⚠️ Nenhum produto encontrado no Supabase');

      // Se não há produtos no Supabase, verificar localStorage
      const localProducts = getLocalProducts();

      // Se houver produtos locais, tentar sincronizar com Supabase
      if (localProducts.length > 0) {
        console.log(`🔄 Enviando ${localProducts.length} produtos locais para o Supabase...`);
        for (const product of localProducts) {
          try {
            await saveProductToSupabase(product);
            console.log(`✅ Produto "${product.name}" sincronizado com Supabase`);
          } catch (error) {
            console.error(`❌ Erro ao sincronizar produto "${product.name}"`, error);
          }
        }

        // Buscar produtos novamente para confirmar sincronização
        const updatedProducts = await fetchProductsFromSupabase();
        if (updatedProducts && updatedProducts.length > 0) {
          // Atualizar localStorage com dados do servidor
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          console.log(`✅ Sincronização concluída. ${updatedProducts.length} produtos atualizados.`);
          return updatedProducts;
        }
      }

      return localProducts;
    } else {
      console.log(`✅ Encontrados ${phpProducts.length} produtos no PHP`);
      localStorage.setItem('products', JSON.stringify(phpProducts));
      console.log('✅ LocalStorage atualizado com produtos do PHP');
      return phpProducts;
    }
  } catch (error) {
    console.error('❌ Erro na sincronização de produtos:', error);

    // Em caso de falha, retornar produtos do localStorage
    return getLocalProducts();
  }
};

/**
 * Recupera produtos do localStorage
 */
const getLocalProducts = (): Product[] => {
  try {
    const storedProductsJson = localStorage.getItem('products');
    if (storedProductsJson) {
      const products = JSON.parse(storedProductsJson);
      if (Array.isArray(products)) {
        return products;
      }
    }
    return [];
  } catch (error) {
    console.error('Erro ao recuperar produtos do localStorage:', error);
    return [];
  }
}; 