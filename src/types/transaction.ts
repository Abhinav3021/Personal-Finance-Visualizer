export interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

export const CATEGORIES = [
  'Food',
  'Education',
  'Transport',
  'Utilities',
  'Entertainment',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];
