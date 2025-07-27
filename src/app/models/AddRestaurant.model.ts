export interface Restaurant {
  id: number;
  name: string;
  description: string;
  location: string;
  rating?: number;
  ChefId: string;
  ImageUrl: string;
  OpeningHours: string;
  IsOpen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RestaurantInputDto {
  name: string;
  description: string;
  location: string;
}

export interface RestaurantResponseDto {
  message: string;
  restaurantId: number;
  Name : string;
  Description : string;
  Location : string;
  ImageUrl : string;
  Rating : string;
  ChefId :number;
  OpeningHours :number;
  IsOpen :boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
