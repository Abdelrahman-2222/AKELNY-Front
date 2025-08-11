export interface OrderItemCreateDTO {
  ItemId: number;
  Quantity: number;
  AddOnIds: number[];
  ComboIds: number[];
}
