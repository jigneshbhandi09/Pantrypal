export interface User {
  _id: string;
  name: string;
  email: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  avatarUrl?: string | null;
}

