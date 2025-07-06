export interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

export interface Budget {
  _id?: string;
  category: string;
  month: string; // Format: YYYY-MM
  budgetAmount: number;
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
