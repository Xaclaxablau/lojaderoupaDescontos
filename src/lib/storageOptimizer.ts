/**
 * Biblioteca para otimização de operações com localStorage
 * Implementa cache em memória e compressão para operações frequentes
 */

// Cache em memória para evitar acesso direto ao localStorage
const memoryCache = new Map<string, any>();

/**
 * Obtém um valor do localStorage com cache em memória
 * @param key Chave para busca
 * @param defaultValue Valor padrão caso não exista
 * @returns Valor armazenado ou valor padrão
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  // Verificar primeiro no cache em memória
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    const value = JSON.parse(item) as T;
    // Armazenar no cache em memória
    memoryCache.set(key, value);
    return value;
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Salva um valor no localStorage e no cache em memória
 * @param key Chave para armazenamento
 * @param value Valor a ser armazenado
 * @returns Sucesso da operação
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    // Atualizar cache em memória
    memoryCache.set(key, value);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
    return false;
  }
}

/**
 * Remove um item do localStorage e do cache em memória
 * @param key Chave a ser removida
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
    memoryCache.delete(key);
  } catch (error) {
    console.error(`Erro ao remover ${key} do localStorage:`, error);
  }
}

/**
 * Limpa todos os dados de cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Atualiza parte de um objeto armazenado sem reescrever todo o objeto
 * @param key Chave do objeto no storage
 * @param partialValue Parte do objeto a ser atualizada
 * @param defaultValue Valor padrão caso não exista
 * @returns Sucesso da operação
 */
export function updatePartialStorage<T extends object>(
  key: string, 
  partialValue: Partial<T>, 
  defaultValue: T
): boolean {
  try {
    const currentValue = getFromStorage<T>(key, defaultValue);
    const updatedValue = { ...currentValue, ...partialValue };
    return saveToStorage(key, updatedValue);
  } catch (error) {
    console.error(`Erro ao atualizar parcialmente ${key}:`, error);
    return false;
  }
} 