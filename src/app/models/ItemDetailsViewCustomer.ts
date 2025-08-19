// src/app/models/ItemDetailsViewCustomer.ts
export interface ItemClassDto {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  restaurantId: number;
  sizeType: ItemSizeType;
  size?: number;
  weight?: number;
  sizePricing?: ItemSizePriceDto[];
  addOnIds?: number[];
  addOns?: AddOnGetDto[];
  comboIds?: number[];
  combos?: ComboGetDto[];
}

export interface AddOnGetDto {
  id: number;
  name: string;
  additionalPrice: number;
  imageUrl?: string;
}

export interface ComboGetDto {
  id: number;
  name: string;
  comboPrice: number;
  imageUrl?: string;
}

export enum ItemSizeType {
  Fixed = 0,
  Sized = 1,
  Weighted = 2
}

export interface ItemSizePriceDto {
  size: number;
  price: number;
  label?: string;
}

// Keep the old interface for backward compatibility
export interface ItemDetailsDto extends ItemClassDto {}
