
'use client';

import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { Transaction } from '@/types/transaction';
import { Budget } from '@/types/transaction'; // Make sure Budget type is correctly imported from your types file

import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import SummaryCards from '@/components/SummaryCards';
import BudgetForm from '@/components/BudgetForm'; // Your BudgetForm component
import BudgetList from '@/components/BudgetList'; // Your BudgetList component
import BudgetVsActualChart from '@/components/BudgetVsActualChart';
import SpendingInsights from '@/components/SpendingInsights';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/sonner'; // Assuming sonner is used
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import dialog components for the BudgetForm modal (assuming shadcn/ui or similar)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label'; // Make sure Label is imported if used
import { toast } from 'sonner'; // For toast notifications

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingBudgets, setIsFetchingBudgets] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // State for BudgetForm modal (for Add/Edit)
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null); // State to hold budget being edited

  // --- Data Fetching Functions ---
  // Wrap fetch functions with useCallback to memoize them
  const fetchTransactions = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        // Log the response status and text for better debugging
        const errorText = await response.text();
        console.error(`Failed to fetch transactions: ${response.status} - ${errorText}`);
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions. Please check your network and try again.');
    } finally {
      setIsFetching(false);
    }
  }, []); // Empty dependency array means this function is created once

  const fetchBudgets = useCallback(async () => {
    setIsFetchingBudgets(true);
    try {
      const response = await fetch(`/api/budgets?month=${selectedMonth}`);
      if (!response.ok) {
        // Log the response status and text for better debugging
        const errorText = await response.text();
        console.error(`Failed to fetch budgets: ${response.status} - ${errorText}`);
        throw new Error('Failed to fetch budgets');
      }
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets for the selected month. Please try again.');
    } finally {
      setIsFetchingBudgets(false);
    }
  }, [selectedMonth]); // fetchBudgets depends on selectedMonth

  // --- Effects for Data Fetching ---
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Add fetchTransactions to dependency array

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, fetchBudgets]); // fetchBudgets is now memoized, so no infinite loop

  const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // --- Helper for Month Options ---
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    // Generate months from 6 months ago to 6 months from now
    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  // --- Handlers for Budget Operations (Add, Edit, Delete) ---

  // This handler is passed to BudgetForm's 'onSave' prop
  const handleSaveBudget = async (budgetData: Omit<Budget, '_id'>) => {
    try {
      const method = budgetToEdit ? 'PUT' : 'POST';
      const url = budgetToEdit ? `/api/budgets/${budgetToEdit._id}` : '/api/budgets';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'An unknown error occurred.';

        if (errorMessage === "Budget already exists for this category and month") {
          toast.error("You've already set a budget for this category and month. Try editing the existing one or choosing a different category/month.");
        } else {
          toast.error(`Failed to ${budgetToEdit ? 'update' : 'save'} budget: ${errorMessage}`);
        }
        throw new Error(`Failed to ${budgetToEdit ? 'update' : 'save'} budget`);
      }

      toast.success(`Budget ${budgetToEdit ? 'updated' : 'saved'} successfully!`);
      fetchBudgets(); // Refresh budgets after saving/updating
      setIsBudgetFormOpen(false); // Close the form modal on success
      setBudgetToEdit(null); // Clear budget being edited state
    } catch (error) {
      console.error('Error saving budget:', error);
      // More specific error handling for toast messages
      if (error instanceof Error && !error.message.includes('Budget already exists')) {
        toast.error("There was an issue saving your budget. Please try again.");
      } else { // This else block handles the original `throw new Error` and any other unhandled errors
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Handler for deleting a budget, passed to BudgetList's 'onDelete' prop
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error(`Failed to delete budget: ${errorResponse.error || 'An unknown error occurred.'}`);
        throw new Error('Failed to delete budget');
      }
      toast.success('Budget deleted successfully!');
      fetchBudgets(); // Refresh budgets after deleting
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error("There was an issue deleting your budget. Please try again.");
    }
  };

  // Handler for opening the BudgetForm modal in "add new" mode, passed to BudgetList's 'onAdd' prop
  const handleAddBudget = () => {
    setBudgetToEdit(null); // Clear any budget currently in edit state
    setIsBudgetFormOpen(true); // Open the modal
  };

  // Handler for opening the BudgetForm modal in "edit" mode, passed to BudgetList's 'onEdit' prop
  const handleEditBudget = (budget: Budget) => {
    setBudgetToEdit(budget); // Set the budget data to be edited
    setIsBudgetFormOpen(true); // Open the modal
  };

  // Handler for closing the budget form modal (e.g., via a "Cancel" button in BudgetForm)
  const handleCancelBudgetForm = () => {
    setIsBudgetFormOpen(false);
    setBudgetToEdit(null); // Clear any budget being edited if canceled
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

          {/* Transactions Tab Content */}
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

          {/* Budgets Tab Content */}
          <TabsContent value="budgets" className="space-y-8">
            {/* Month Selection */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Month
                </Label>
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
              {/* Budget List */}
              <BudgetList
                budgets={budgets}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
                onAdd={handleAddBudget}
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

      {/* BudgetForm Modal (Dialog) - Centralized for both Add and Edit */}
      <Dialog open={isBudgetFormOpen} onOpenChange={setIsBudgetFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{budgetToEdit ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={budgetToEdit || undefined} // Pass budget data if editing, else undefined
            onSave={handleSaveBudget} // This handles both POST and PUT based on budgetToEdit state
            onCancel={handleCancelBudgetForm} // Pass a cancel handler for the modal
          />
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}