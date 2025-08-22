

export interface CategoryItem {
   items: [
    {
      id:number;
      name: string;
      price: string;
      image: string;
    }
  ];

    // Add pagination properties
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
