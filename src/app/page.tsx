'use client';

import { useEffect, useState } from 'react';
import { Transaction } from '@/types/transaction';
import {Budget} from '@/types/transaction';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import SummaryCards from '@/components/SummaryCards';
import BudgetForm from '@/components/BudgetForm';
import BudgetList from '@/components/BudgetList';
import BudgetVsActualChart from '@/components/BudgetVsActualChart';
import SpendingInsights from '@/components/SpendingInsights';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingBudgets, setIsFetchingBudgets] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

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

  const fetchBudgets = async () => {
    setIsFetchingBudgets(true);
    try {
      const response = await fetch(`/api/budgets?month=${selectedMonth}`);
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsFetchingBudgets(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Generate month options for the select dropdown
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Handler for saving a new budget
  const handleSaveBudget = async (budgetData: any) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });
      if (!response.ok) {
        throw new Error('Failed to save budget');
      }
      fetchBudgets(); // Refresh budgets after saving
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

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

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-8">
            {/* Add Transaction Form */}
            <div className="flex justify-center">
              <TransactionForm onSuccess={fetchTransactions} />
            </div>

            <div className="space-y-8">
              {/* Summary Cards */}
              <SummaryCards 
                transactions={transactions} 
                isLoading={isFetching}
              />
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Expenses Chart */}
                <MonthlyExpensesChart 
                  transactions={transactions} 
                  isLoading={isFetching}
                />
                
                {/* Category Pie Chart */}
                <CategoryPieChart
                  transactions={transactions} 
                  isLoading={isFetching}
                />
              </div>
              
              {/* Transaction List */}
              <TransactionList 
                transactions={transactions} 
                onTransactionUpdate={fetchTransactions}
                isLoading={isFetching}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="budgets" className="space-y-8">
            {/* Month Selection */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Month
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-8">
              {/* Budget Form */}
              <div className="flex justify-center">
                <BudgetForm 
                  onSave={handleSaveBudget}
                  onSuccess={fetchBudgets} 
                  defaultMonth={selectedMonth}
                />
              </div>

              {/* Budget List */}
              <BudgetList 
                budgets={budgets}
                onBudgetUpdate={fetchBudgets}
                isLoading={isFetchingBudgets}
                selectedMonth={selectedMonth}
              />

              {/* Budget vs Actual Chart */}
              <BudgetVsActualChart 
                budgets={budgets}
                transactions={transactions}
                selectedMonth={selectedMonth}
                isLoading={isFetchingBudgets}
              />

              {/* Spending Insights */}
              <SpendingInsights 
                budgets={budgets}
                transactions={transactions}
                selectedMonth={selectedMonth}
                isLoading={isFetchingBudgets}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
    
  );
}
