// order.model.ts
export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  SUSPENDED = 'Suspended',
  COMPLETED = 'Completed'
}

export interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  intervention: string;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}
