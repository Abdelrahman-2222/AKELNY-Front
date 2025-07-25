export interface Category {
  id: number;
  name: string;
  items?: any[];
}

export interface CategoryCreateDto {
  name: string;
}

export interface CategoryResponse {
  categories: Category[];
  totalCount: number;
}
