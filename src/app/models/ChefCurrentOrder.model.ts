export interface ChefCurrentOrder {
  id: number; // or string if you prefer
  customer: string;
  items: number;
  amount: number;
  time: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'completed' | 'rejected' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'cancelled';
  createdAt?: string | Date;
}
