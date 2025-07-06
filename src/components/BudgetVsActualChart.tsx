'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Budget, Transaction } from '@/types/transaction';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

interface BudgetVsActualChartProps {
  budgets: Budget[];
  transactions: Transaction[];
  selectedMonth: string;
  isLoading?: boolean;
}

interface ChartData {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
  status: 'under' | 'over' | 'ontrack';
}

export default function BudgetVsActualChart({
  budgets,
  transactions,
  selectedMonth,
  isLoading
}: BudgetVsActualChartProps) {
  const chartData = useMemo(() => {
    const currentBudgets = budgets.filter(budget => budget.month === selectedMonth);

    if (currentBudgets.length === 0) {
      return [];
    }

    // Calculate actual spending per category for the selected month
    const actualSpending = transactions
      .filter(transaction => {
        const transactionMonth = transaction.date.substring(0, 7); //YYYY-MM
        return transactionMonth === selectedMonth;
      })
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    // Create chart data
    const data: ChartData[] = currentBudgets.map(budget => {
      const actual = actualSpending[budget.category] || 0;
      const budgeted = budget.budgetAmount;
      const difference = actual - budgeted;

      let status: 'under' | 'over' | 'ontrack' = 'under';
      if (difference > budgeted * 0.1) {
        status = 'over';
      } else if (Math.abs(difference) <= budgeted * 0.1) {
        status = 'ontrack';
      }

      return {
        category: budget.category,
        budgeted,
        actual,
        difference,
        status
      };
    });

    return data.sort((a, b) => b.budgeted - a.budgeted);
  }, [budgets, transactions, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatMonth = (month: string) => {
    try {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return month;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'hsl(var(--destructive))';
      case 'ontrack':
        return 'hsl(var(--primary))';
      case 'under':
        return 'hsl(var(--muted-foreground))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'over':
        return <Badge variant="destructive">Over Budget</Badge>;
      case 'ontrack':
        return <Badge variant="default">On Track</Badge>;
      case 'under':
        return <Badge variant="secondary">Under Budget</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const totalBudgeted = chartData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActual = chartData.reduce((sum, item) => sum + item.actual, 0);
  const totalDifference = totalActual - totalBudgeted;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartData;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {getStatusBadge(data.status)}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Budgeted:</span> {formatCurrency(data.budgeted)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Actual:</span> {formatCurrency(data.actual)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Difference:</span>{' '}
              <span className={data.difference > 0 ? 'text-destructive' : 'text-green-600'}>
                {data.difference > 0 ? '+' : ''}{formatCurrency(data.difference)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-4 mt-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full mb-6" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
          <CardDescription>
            Compare your budgeted amounts with actual spending for {formatMonth(selectedMonth)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No budgets set for this month.</p>
            <p className="text-sm mt-2">Set budgets to see spending comparisons.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
        <CardDescription>
          Compare your budgeted amounts with actual spending for {formatMonth(selectedMonth)}
        </CardDescription>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm">Budgeted: {formatCurrency(totalBudgeted)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span className="text-sm">Actual: {formatCurrency(totalActual)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Total Difference:{' '}
              <span className={totalDifference > 0 ? 'text-destructive' : 'text-green-600'}>
                {totalDifference > 0 ? '+' : ''}{formatCurrency(totalDifference)}
              </span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="budgeted"
                fill="hsl(var(--primary))"
                name="Budgeted"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="actual"
                fill="hsl(var(--muted-foreground))"
                name="Actual"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {chartData.map((item) => (
            <div key={item.category} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{item.category}</h4>
                {getStatusBadge(item.status)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Budgeted:</span>
                  <span>{formatCurrency(item.budgeted)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual:</span>
                  <span>{formatCurrency(item.actual)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Difference:</span>
                  <span className={item.difference > 0 ? 'text-destructive' : 'text-green-600'}>
                    {item.difference > 0 ? '+' : ''}{formatCurrency(item.difference)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
