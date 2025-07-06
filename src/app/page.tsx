'use client';

import { useEffect, useState } from 'react';
import { Transaction } from '@/types/transaction';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchTransactions = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
        <div className="flex items-center justify-center pt-8">
          <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">
            FinanceX
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your finances with ease
          </p>
          {totalExpenses > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalExpenses)}
              </p>
            </div>
          )}
               </div>

        </div>

        {/* Add Transaction Form */}
        <div className="flex justify-center">
          <TransactionForm onSuccess={fetchTransactions} />
        </div>

        <div className="space-y-8">
          {/* Monthly Chart */}
          <MonthlyExpensesChart 
            transactions={transactions} 
            isLoading={isFetching}
          />
          
          {/* Transaction List */}
          <TransactionList 
            transactions={transactions} 
            onTransactionUpdate={fetchTransactions}
            isLoading={isFetching}
          />
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
    
  );
}
