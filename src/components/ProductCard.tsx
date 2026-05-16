import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Share2 } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // Proteção contra objetos inválidos ou incompletos
  if (!product || typeof product !== 'object') {
    return (
      <div className="product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Produto inválido</p>
        </div>
      </div>
    );
  }

  // Valores seguros para os dados do produto
  const {
    id = '',
    name = 'Produto sem nome',
    price = 0,
    discount = 0,
    imageUrl = '',
    category = '',
    sizes = [],
    featured = false
  } = product;

  // Cálculo seguro de preço com desconto
  const discountedPrice = discount > 0 ? (price * (100 - discount)) / 100 : price;

  // Manipulador seguro de adição ao carrinho
  const handleAddToCart = (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      
      // Criar um objeto seguro para adicionar ao carrinho
      const cartItem = {
        ...product,
        quantity: 1,
        selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Único',
        selectedColor: product.colors && product.colors.length > 0 ? product.colors[0] : 'Padrão'
      };
      
      addToCart(cartItem);
      toast.success(`${name} adicionado ao carrinho`);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error('Não foi possível adicionar o produto ao carrinho');
    }
  };

  // Função para compartilhar produto
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/product/${id}`;
    const shareText = `Confira este produto incrível: ${name} - ${productUrl}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: shareText,
          url: productUrl
        });
        toast.success('Produto compartilhado com sucesso!');
      } else {
        // Fallback para copiar o link
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Não foi possível compartilhar o produto');
    }
  };

  return (
    <Link to={`/product/${id}`} className="group relative bg-white rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      {/* Overlay para produtos em destaque */}
      {featured && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-xs font-semibold text-black px-2 py-1 rounded flex items-center">
          <Star size={12} className="mr-1" />
          Destaque
        </div>
      )}
      
      <div className="relative aspect-[3/4] overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            onError={(e) => {
              console.error('Erro ao carregar imagem do produto:', name);
              e.currentTarget.src = 'https://via.placeholder.com/300?text=Imagem+indisponível';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Imagem indisponível</p>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-shop-red text-white text-xs px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="p-3 flex-grow">
        <div className="text-xs text-gray-500 mb-1 capitalize">{category}</div>
        <h3 className="text-sm font-medium line-clamp-2 mb-1">{name}</h3>
        <div className="flex items-center space-x-2">
          {discount > 0 ? (
            <>
              <span className="text-shop-red font-semibold">
                R$ {discountedPrice.toFixed(2)}
              </span>
              <span className="text-gray-400 text-sm line-through">
                R$ {price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-semibold">R$ {price.toFixed(2)}</span>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {sizes && sizes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sizes.slice(0, 4).map((size, index) => (
                <span key={index} className="bg-gray-100 px-1 rounded">
                  {size}
                </span>
              ))}
              {sizes.length > 4 && <span>+{sizes.length - 4}</span>}
            </div>
          )}
        </div>
        
        <Link 
          to={`/product/${id}`} 
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Editar
        </Link>
      </div>
      
      <div className="absolute bottom-3 right-3 z-10 flex gap-2">
        <button
          onClick={handleShare}
          className="bg-gray-100 text-gray-600 p-2 rounded-full shadow-sm transition-transform hover:scale-110 hover:bg-gray-200"
          aria-label="Compartilhar este produto"
          title="Compartilhar este produto"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={handleAddToCart}
          className="bg-shop-red text-white p-2 rounded-full shadow-sm transition-transform hover:scale-110"
          aria-label="Adicionar ao carrinho"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
