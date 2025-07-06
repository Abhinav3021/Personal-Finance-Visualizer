'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Target, DollarSign, Calendar } from 'lucide-react';
import { Budget, Transaction } from '@/types/transaction';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

interface SpendingInsightsProps {
  budgets: Budget[];
  transactions: Transaction[];
  selectedMonth: string;
  isLoading?: boolean;
}

interface CategoryInsight {
  category: string;
  budgeted: number;
  actual: number;
  percentage: number;
  status: 'danger' | 'warning' | 'good' | 'excellent';
  message: string;
  daysInMonth: number;
  daysElapsed: number;
}

export default function SpendingInsights({
  budgets,
  transactions,
  selectedMonth,
  isLoading = false
}: SpendingInsightsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const insights = useMemo(() => {
    const currentBudgets = budgets.filter(budget => budget.month === selectedMonth);

    if (currentBudgets.length === 0) {
      return [];
    }

    // Calculate days in month and days elapsed
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentDate = new Date(year, month - 1, today.getDate());
    const daysElapsed = today.getMonth() === month - 1 && today.getFullYear() === year
      ? today.getDate()
      : (today > currentDate ? daysInMonth : 0);

    // Calculate actual spending per category for the selected month
    const actualSpending = transactions
      .filter(transaction => {
        const transactionMonth = transaction.date.substring(0, 7);
        return transactionMonth === selectedMonth;
      })
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    // Generate insights for each category
    const categoryInsights: CategoryInsight[] = currentBudgets.map(budget => {
      const actual = actualSpending[budget.category] || 0;
      const percentage = budget.budgetAmount > 0 ? (actual / budget.budgetAmount) * 100 : 0;

      let status: 'danger' | 'warning' | 'good' | 'excellent' = 'good';
      let message = '';

      if (percentage >= 100) {
        status = 'danger';
        const overspent = actual - budget.budgetAmount;
        message = `Over budget by ${formatCurrency(overspent)}! Consider reducing ${budget.category} expenses.`;
      } else if (percentage >= 90) {
        status = 'warning';
        const remaining = budget.budgetAmount - actual;
        message = `90% of budget used. Only ${formatCurrency(remaining)} left for ${budget.category}.`;
      } else if (percentage >= 75) {
        status = 'warning';
        const remaining = budget.budgetAmount - actual;
        message = `75% through your ${budget.category} budget. ${formatCurrency(remaining)} remaining.`;
      } else if (percentage >= 50) {
        status = 'good';
        const remaining = budget.budgetAmount - actual;
        message = `Halfway through ${budget.category} budget. ${formatCurrency(remaining)} left.`;
      } else if (percentage >= 25) {
        status = 'good';
        message = `Good spending control in ${budget.category}. ${Math.round(100 - percentage)}% budget remaining.`;
      } else {
        status = 'excellent';
        message = `Excellent spending control in ${budget.category}! Only ${Math.round(percentage)}% used.`;
      }

      // Adjust message based on time progression
      const timePercentage = daysElapsed > 0 ? (daysElapsed / daysInMonth) * 100 : 0;
      if (timePercentage > 0) {
        if (percentage < timePercentage * 0.8) {
          message += ` You're pacing well - spending ${Math.round(percentage)}% with ${Math.round(timePercentage)}% of month passed.`;
        } else if (percentage > timePercentage * 1.2) {
          message += ` You're spending faster than expected - ${Math.round(percentage)}% used with only ${Math.round(timePercentage)}% of month passed.`;
        }
      }

      return {
        category: budget.category,
        budgeted: budget.budgetAmount,
        actual,
        percentage,
        status,
        message,
        daysInMonth,
        daysElapsed
      };
    });

    return categoryInsights.sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions, selectedMonth]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'good':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'excellent':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger':
        return 'text-destructive';
      case 'warning':
        return 'text-yellow-600';
      case 'good':
        return 'text-blue-600';
      case 'excellent':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  // const getProgressColor = (percentage: number) => {
  //   if (percentage >= 100) return 'bg-destructive';
  //   if (percentage >= 90) return 'bg-yellow-500';
  //   if (percentage >= 75) return 'bg-orange-500';
  //   if (percentage >= 50) return 'bg-blue-500';
  //   return 'bg-green-500';
  // };

  const overallStats = useMemo(() => {
    const totalBudgeted = insights.reduce((sum, insight) => sum + insight.budgeted, 0);
    const totalActual = insights.reduce((sum, insight) => sum + insight.actual, 0);
    const overallPercentage = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

    const categoriesOverBudget = insights.filter(insight => insight.percentage >= 100).length;
    const categoriesWarning = insights.filter(insight => insight.percentage >= 75 && insight.percentage < 100).length;
    const categoriesGood = insights.filter(insight => insight.percentage < 75).length;

    return {
      totalBudgeted,
      totalActual,
      overallPercentage,
      categoriesOverBudget,
      categoriesWarning,
      categoriesGood
    };
  }, [insights]);

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/50">
            <Skeleton className="h-5 w-2/3 mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-1/3 mb-2" />
            {[...Array(3)].map((_, i) => ( // Show 3 skeleton insights
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3 mt-2" />
              </div>
            ))}
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <Skeleton className="h-5 w-1/4 mb-2" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Insights
          </CardTitle>
          <CardDescription>
            Get insights into your spending patterns for {formatMonth(selectedMonth)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No budgets set for this month.</p>
            <p className="text-sm mt-2">Set budgets to get spending insights and recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights into your spending patterns for {formatMonth(selectedMonth)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Summary */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" />
            <h3 className="font-semibold">Overall Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget Usage</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={Math.min(overallStats.overallPercentage, 100)}
                  className="flex-1"
                />
                <span className="text-sm font-medium min-w-12">
                  {Math.round(overallStats.overallPercentage)}%
                </span>
              </div>
              <p className="text-sm mt-1">
                {formatCurrency(overallStats.totalActual)} of {formatCurrency(overallStats.totalBudgeted)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Categories over budget:</span>
                <Badge variant="destructive">{overallStats.categoriesOverBudget}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Categories need attention:</span>
                <Badge variant="secondary">{overallStats.categoriesWarning}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Categories on track:</span>
                <Badge variant="outline">{overallStats.categoriesGood}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Category Insights */}
        <div className="space-y-4">
          <h3 className="font-semibold">Category Insights</h3>
          {insights.map((insight) => (
            <div key={insight.category} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(insight.status)}
                  <h4 className="font-medium">{insight.category}</h4>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(insight.actual)} / {formatCurrency(insight.budgeted)}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Budget Usage</span>
                  <span className={`text-sm font-medium ${getStatusColor(insight.status)}`}>
                    {Math.round(insight.percentage)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(insight.percentage, 100)}
                  className="h-2"
                />
              </div>

              <p className={`text-sm ${getStatusColor(insight.status)}`}>
                {insight.message}
              </p>

              {insight.daysElapsed > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Day {insight.daysElapsed} of {insight.daysInMonth}
                  ({Math.round((insight.daysElapsed / insight.daysInMonth) * 100)}% of month elapsed)
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Tips
          </h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {overallStats.categoriesOverBudget > 0 && (
              <li>• Review categories that are over budget and identify areas to cut back</li>
            )}
            {overallStats.categoriesWarning > 0 && (
              <li>• Monitor warning categories closely to avoid overspending</li>
            )}
            {overallStats.overallPercentage < 50 && (
              <li>• Great job staying within budget! Consider setting aside extra savings</li>
            )}
            <li>• Review your spending patterns weekly to stay on track</li>
            <li>• Use the dark theme for better viewing during evening budget reviews</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
