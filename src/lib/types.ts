export interface Product {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  role: string;
  email: string;
  name?: string;
  phone?: string;
  city?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_usd_at_purchase: number;
  products?: {
    name: string;
    image_url: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_usd: number;
  total_ves: number;
  created_at: string;
  profiles?: {
    name: string;
    phone: string;
  };
  order_items: OrderItem[];
}
