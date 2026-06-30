export interface Product {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
  sales_count?: number;
}

export interface Profile {
  id: string;
  role: string;
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  cedula?: string;
  purchase_count?: number;
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

export interface StoreService {
  title: string;
  description: string;
}

export interface StoreInfo {
  id: string;
  about_title: string;
  about_description: string;
  mission: string;
  vision: string;
  services: StoreService[];
  updated_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  active: boolean;
  created_at: string;
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
