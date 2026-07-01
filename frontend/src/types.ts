export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'cakes' | 'snacks' | 'chips' | 'drinks' | 'cookies' | 'other';
  subCategory?: string;
  stock: number;
  isFeatured: boolean;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  orderStatus: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'pesapal';
  pesapalTrackingId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  residence?: string;
  role: 'admin' | 'user';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
