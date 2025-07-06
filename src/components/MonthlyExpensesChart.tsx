'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/types/transaction';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function MonthlyExpensesChart({ transactions, isLoading = false }: MonthlyExpensesChartProps) {
  const monthlyData = useMemo(() => {
    const groupedByMonth = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0
        };
      }
      
      acc[monthKey].total += transaction.amount;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; total: number; count: number }>);

    // Convert to array and sort by month
    const monthlyArray = Object.values(groupedByMonth).sort((a, b) => a.month.localeCompare(b.month));

    // Format month names for display
    return monthlyArray.map(item => ({
      ...item,
      monthDisplay: new Date(item.month + '-01').toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short'
      })
    }));
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 w-full">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-20 mx-auto" />
                <Skeleton className="h-6 w-12 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-6 w-16 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-28 mx-auto" />
                <Skeleton className="h-6 w-20 mx-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No data available. Add some transactions to see the chart.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Monthly Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthDisplay" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Total Expenses']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar 
                dataKey="total" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Total Expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {monthlyData.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Total Months</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{monthlyData.length}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Highest Month</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {formatCurrency(Math.max(...monthlyData.map(m => m.total)))}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Average Monthly</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
