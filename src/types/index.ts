export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  imageUrl: string;
  images: string[];
  category: string;
  type: 'clothing' | 'shoes' | 'accessory';
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  on_sale: boolean;
  showOnHomepage: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface FilterOptions {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
  sortBy: string;
}
