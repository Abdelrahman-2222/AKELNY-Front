export interface RestaurantDetails {
  resName: string;
  resImage: string;
  rating: number;
  location: string;
  items: {
    id: number;
    name: string;
    price: string;
    image: string;
    categoryName: string;
    categoryId: number;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}
