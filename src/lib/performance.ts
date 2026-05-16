// performance.ts - Funções para melhorar a performance da aplicação

/**
 * Implementação otimizada de throttle para limitar a frequência de execução de funções
 * @param fn Função a ser limitada
 * @param limit Tempo limite em ms
 * @returns Função throttled
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number) => {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCall < limit) {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        lastCall = now;
        fn(...args);
      }, limit - (now - lastCall));
    } else {
      lastCall = now;
      fn(...args);
    }
  };
};

/**
 * Implementação otimizada de debounce para atrasar execução até que não ocorram mais chamadas
 * @param fn Função a ser debounced
 * @param delay Atraso em ms
 * @returns Função debounced
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Memoização para funções com um único argumento
 * @param fn Função a ser memoizada
 * @returns Função memoizada
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  
  return function(arg: T): R {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Formatador de moeda otimizado com memoização
 */
export const formatCurrency = memoize((value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
});

/**
 * Função para processar arrays de forma otimizada usando chunks
 * @param array Array a ser processado
 * @param chunkSize Tamanho de cada chunk
 * @param processor Função de processamento
 */
export function processArrayInChunks<T, R>(
  array: T[],
  chunkSize: number,
  processor: (items: T[]) => R[]
): R[] {
  const result: R[] = [];
  
  // Processando em chunks para evitar bloqueio de UI
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(...processor(chunk));
  }
  
  return result;
}

/**
 * Lazy loader para funções que manipulam o DOM
 * @param fn Função a ser executada quando o elemento estiver visível
 * @param threshold Ponto de visibilidade (0-1)
 */
export function lazyLoad(fn: () => void, threshold = 0.5): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fn();
          observer.disconnect();
        }
      });
    },
    { threshold }
  );
  
  return observer;
} 