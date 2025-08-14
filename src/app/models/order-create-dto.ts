import { OrderItemCreateDTO } from './order-item-create-dto';

export interface OrderCreateDTO {
  RestaurantId: number;
  Items: OrderItemCreateDTO[];
  DistanceKm: number;
  // amount: number;
}
