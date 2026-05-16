import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity, item.selectedSize, item.selectedColor);
    }
  };

  const formattedPrice = (item.price * (1 - item.discount / 100)).toFixed(2);

  return (
    <div className="flex py-6 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>
            <a href={`/product/${item.id}`}>{item.name}</a>
          </h3>
          <p className="ml-4">R$ {formattedPrice}</p>
        </div>
        
        <div className="mt-1 text-sm text-gray-500">
          {item.selectedColor && (
            <span className="mr-2">
              Cor: <span className="font-medium">{item.selectedColor}</span>
            </span>
          )}
          {item.selectedSize && (
            <span>
              Tamanho: <span className="font-medium">{item.selectedSize}</span>
            </span>
          )}
        </div>

        <Link 
          to={`/product/${item.id}`} 
          className="mt-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Editar
        </Link>

        <div className="flex items-center justify-between text-sm mt-auto pt-2">
          <div className="flex items-center border rounded">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              <Minus size={14} />
            </Button>
            <span className="mx-2 w-6 text-center">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus size={14} />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-shop-red hover:text-shop-red/80"
            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
          >
            <Trash2 size={16} className="mr-1" />
            Remover
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
