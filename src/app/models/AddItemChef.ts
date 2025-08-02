export enum ItemSizeType {
  Fixed = 0,
  Sized = 1,
  Weighted = 2
}

export enum ItemSizeEnum {
  Small = 0,
  Medium = 1,
  Large = 2
}

export interface ItemSizePriceDto {
  size: ItemSizeEnum;
  price: number;
  label?: string;
}

// ✅ Add missing AddOn interface
export interface AddOn {
  id: number;
  name: string;
  additionalPrice: number;
  imageUrl?: string;
  restaurantId: number;
}

// ✅ Add DTOs for creating AddOns and Combos inline
export interface AddOnCreateDto {
  name: string;
  additionalPrice: number;
  imageUrl?: string;
}

export interface ComboCreateDto {
  name: string;
  comboPrice: number;
  imageUrl?: string;
}

// ✅ Update ItemCreateUpdateDto to use inline creation
export interface ItemCreateUpdateDto {
  id?: number; // Optional for creation
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  restaurantId: number;
  sizeType: ItemSizeType;
  size?: ItemSizeEnum;
  weight?: number;
  sizePricing?: ItemSizePriceDto[];

  // ✅ Change from IDs to objects for inline creation
  addOns?: AddOnCreateDto[];
  combos?: ComboCreateDto[];
}
export interface CategoryDto {
  id: number;
  name: string;
}
export interface ItemDto {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  category?: CategoryDto;
  restaurantId: number;
  sizeType: ItemSizeType;
  size?: ItemSizeEnum;
  weight?: number;
  sizePricing?: ItemSizePriceDto[];
  addOns?: AddOnChefDto[];
  combos?: ComboChefDto[];
}

export interface AddOnChefDto {
  id: number;
  name: string;
  additionalPrice: number;
  imageUrl?: string;
}

export interface ComboChefDto {
  id: number;
  name: string;
  comboPrice: number;
  imageUrl?: string;
  items: ItemDto[];
}
