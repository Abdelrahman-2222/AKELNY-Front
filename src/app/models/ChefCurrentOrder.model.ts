export interface ChefCurrentOrder {
  id: number;
  customer: string;
  items: number;
  amount: number;
  time: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'completed' | 'rejected' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'cancelled';
  createdAt?: string | Date;

  // Additional fields from backend
  subTotal?: number;
  deliveryFee?: number;
  platformFee?: number;
  totalAmount?: number;
  distanceKm?: number;
  customerId?: string;
  customerName?: string;
  restaurantId?: number;
  restaurantName?: string;
  itemsArray?: OrderItem[];
  payment?: any;
}

export interface OrderItem {
  id: number;
  itemId: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  totalPrice: number;
  addOns: AddOnItem[];
  combos: ComboItem[];
  itemTotalWithExtras?: number; // This comes from your backend calculation
}

export interface AddOnItem {
  id: number;
  name: string;
  price: number;
}

export interface ComboItem {
  id: number;
  name: string;
  price: number;
}
