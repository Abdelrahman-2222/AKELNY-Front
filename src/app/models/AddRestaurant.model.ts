
export interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

// Updated to match your backend DTO
export interface RestaurantInputDto {
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  openingHours: string;
  isOpen: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  location: string;
  rating?: number;
  chefId: string;
  imageUrl: string;
  openingHours: string;
  isOpen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Updated to match your backend response
export interface RestaurantResponseDto {
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  rating?: number;
  chefId: string;
  openingHours: string;
  isOpen: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
