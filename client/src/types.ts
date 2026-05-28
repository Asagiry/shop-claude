export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  sizes: string[];
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id?: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  size: string;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  full_name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total: number;
  full_name: string;
  address: string;
  phone: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user_email?: string;
  username?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}
