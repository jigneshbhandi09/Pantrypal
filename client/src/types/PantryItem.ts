export type CategoryType = 'produce' | 'dairy' | 'grain' | 'protein' | 'spice' | 'condiment' | 'frozen' | 'other';
export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'tbsp' | 'tsp' | 'cup';

export interface PantryItem {
  _id: string;
  userId: string;
  name: string;
  category: CategoryType;
  quantity: number;
  unit: UnitType;
  expiryDate?: string;
  purchaseDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

