// Utilitário centralizado para gerenciamento de categorias
// Isso garante que usamos o mesmo código para normalizar categorias em todos os lugares

// Lista de categorias padrão do sistema
export const defaultCategories = [
  'feminino',
  'masculino', 
  'kids', 
  'acessórios', 
  'calçados', 
  'featured', 
  'off',
  'novidades'
];

// Função para normalizar categorias de forma consistente em toda a aplicação
export const normalizeCategory = (categoryStr: string): string => {
  if (!categoryStr) return '';
  
  // 1. Trim spaces and convert to lowercase
  let normalized = categoryStr.trim().toLowerCase();
  
  // 2. Handle common variations and normalize for standard categories
  if (normalized === 'calcados' || normalized === 'calçados' || normalized === 'shoes') {
    normalized = 'calçados';
  } else if (normalized === 'acessorios' || normalized === 'acessórios' || normalized === 'accessories' || normalized === 'accessory') {
    normalized = 'acessórios';
  } else if (normalized === 'masculino' || normalized === 'men' || normalized === 'homem') {
    normalized = 'masculino';
  } else if (normalized === 'feminino' || normalized === 'women' || normalized === 'mulher') {
    normalized = 'feminino';
  } else if (normalized === 'infantil' || normalized === 'children' || normalized === 'kids' || normalized === 'kid') {
    normalized = 'kids';
  } else if (normalized === 'oferta' || normalized === 'ofertas' || normalized === 'promoção' || normalized === 'off' || normalized === 'sale') {
    normalized = 'off';
  } else if (normalized === 'novidade' || normalized === 'novidades' || normalized === 'new' || normalized === 'new arrivals') {
    normalized = 'novidades';
  } else if (normalized === 'destaque' || normalized === 'destaques' || normalized === 'featured' || normalized === 'melhores') {
    normalized = 'featured';
  }
  
  // Para categorias personalizadas, mantemos o valor normalizado como está
  console.log(`Categoria normalizada: "${categoryStr}" -> "${normalized}"`);
  return normalized;
};

// Função para normalizar links personalizados
export const getNormalizedLink = (text: string): string => {
  if (!text) return '';
  
  // Primeiro tentamos normalizar com nossa função de categoria padrão
  const normalizedCategory = normalizeCategory(text);
  
  // Se for uma das categorias padrão, usamos essa
  if (defaultCategories.includes(normalizedCategory)) {
    return normalizedCategory;
  }
  
  // Para categorias personalizadas, usamos uma normalização diferente para criar URLs amigáveis
  const customNormalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .replace(/\s+/g, "-")            // Substitui espaços por hifens
    .replace(/[^a-z0-9-]/g, "");     // Remove caracteres especiais
  
  console.log(`Link personalizado normalizado: "${text}" -> "${customNormalized}"`);
  return customNormalized;
};

// Função para verificar se uma categoria é padrão
export const isDefaultCategory = (category: string): boolean => {
  const normalized = normalizeCategory(category);
  return defaultCategories.includes(normalized);
};

// Função para obter a categoria exibível (formatada para o usuário)
export const getDisplayCategory = (category: string): string => {
  const normalized = normalizeCategory(category);
  
  // Para categorias padrão, formatamos com a primeira letra maiúscula
  if (defaultCategories.includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  // Para categorias personalizadas, retornamos como está (possivelmente do rótulo original)
  return category;
};

// Função para gerar um caminho de página para uma categoria
export const getCategoryPagePath = (categoryName: string): string => {
  // Normalize the category name first
  const normalizedCategory = getNormalizedLink(categoryName);
  
  // Generate the path
  return `/products/${normalizedCategory}`;
};

// Função para extrair o nome da categoria a partir do caminho da URL
export const getCategoryFromPath = (path: string): string => {
  // Remove the '/products/' prefix
  const pathParts = path.split('/');
  // Return the last part of the path which should be the category
  return pathParts[pathParts.length - 1];
}; 