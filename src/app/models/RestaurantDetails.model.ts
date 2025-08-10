
export interface RestaurantDetails {
  resName: string;
  resImage: string;
  rating: number;
  location: string;
  items: [
    {
      id:number;
      name: string;
      price: string;
      image: string;
      categoryName: string;
    }
  ];
  categories: [
    {
      categoryId: number;
      categoryName: string;
    }
  ]
}
