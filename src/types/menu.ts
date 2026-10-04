export interface Category {
  categoryId: string;
  categoryName: string;
  displayOrder: number;
  active: boolean;
}

export interface MenuItem {
  itemId: string;
  categoryId: string;
  categoryName: string;
  itemName: string;
  price: number;
  available: boolean;
  displayOrder: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
