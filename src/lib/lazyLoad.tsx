import React, { Suspense, lazy, ComponentType } from 'react';

/**
 * Componente para exibir enquanto o componente real está carregando
 */
export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}

/**
 * Cria um componente com carregamento preguiçoso (lazy loading)
 * @param importFunction Função que importa o componente
 * @returns Componente com carregamento otimizado
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFunction);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
} 