import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';
import { toast } from 'sonner';

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  couponDiscount: number;
  couponCode: string | null;
}

const CartContext = createContext<CartContextProps>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartTotal: 0,
  applyCoupon: () => false,
  removeCoupon: () => {},
  couponDiscount: 0,
  couponCode: null,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [couponCode, setCouponCode] = useState<string | null>(() => {
    return localStorage.getItem('couponCode');
  });

  const [couponDiscount, setCouponDiscount] = useState<number>(() => {
    const storedDiscount = localStorage.getItem('couponDiscount');
    return storedDiscount ? parseFloat(storedDiscount) : 0;
  });

  // Calculate cart total with coupon discount
  const cartTotal = cart.reduce(
    (total, item) => total + (item.price * (1 - item.discount / 100) * item.quantity),
    0
  ) * (1 - couponDiscount / 100);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save coupon to localStorage
  useEffect(() => {
    if (couponCode) {
      localStorage.setItem('couponCode', couponCode);
      localStorage.setItem('couponDiscount', couponDiscount.toString());
    } else {
      localStorage.removeItem('couponCode');
      localStorage.removeItem('couponDiscount');
    }
  }, [couponCode, couponDiscount]);

  // Add item to cart
  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      // Check if item already exists in cart with the same size and color
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedColor === newItem.selectedColor
      );

      // If item exists, update quantity
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        toast.success('Item adicionado ao carrinho');
        return updatedCart;
      } else {
        // Otherwise add new item
        toast.success('Item adicionado ao carrinho');
        return [...prevCart, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
    toast.info('Item removido do carrinho');
  };

  // Update quantity of an item
  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
    toast.info('Carrinho esvaziado');
  };

  // Apply coupon
  const applyCoupon = (code: string): boolean => {
    // Get store coupons from localStorage
    const storedCoupons = localStorage.getItem('storeCoupons');
    const storeCoupons = storedCoupons ? JSON.parse(storedCoupons) : [];

    // Find the coupon
    const coupon = storeCoupons.find((c: { code: string; discount: number }) => 
      c.code === code.toUpperCase()
    );

    if (coupon) {
      setCouponCode(coupon.code);
      setCouponDiscount(coupon.discount);
      toast.success(`Cupom aplicado! Desconto de ${coupon.discount}%`);
      return true;
    } else {
      toast.error('Cupom inválido');
      return false;
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
    toast.info('Cupom removido');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        applyCoupon,
        removeCoupon,
        couponDiscount,
        couponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
