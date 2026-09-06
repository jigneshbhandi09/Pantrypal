export interface GroceryItem {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface GroceryList {
  _id: string;
  userId: string;
  weekOf: string;
  items: GroceryItem[];
  createdAt?: string;
  updatedAt?: string;
}

