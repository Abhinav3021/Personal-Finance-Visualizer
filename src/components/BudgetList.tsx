'use client';

import { useState } from 'react';
import { Budget } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BudgetListProps {
  budgets: Budget[];
  selectedMonth: string;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export default function BudgetList({ 
  budgets, 
  selectedMonth, 
  onEdit, 
  onDelete, 
  onAdd, 
  isLoading
}: BudgetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (budgetId: string) => {
    setDeletingId(budgetId);
    try {
      await onDelete(budgetId);
    } finally {
      setDeletingId(null);
    }
  };

  const currentMonthBudgets = budgets.filter(budget => budget.month === selectedMonth);
  const totalBudget = currentMonthBudgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Budgets for {formatMonth(selectedMonth)}</CardTitle>
            <CardDescription>
              {currentMonthBudgets.length === 0 
                ? 'No budgets set for this month' 
                : `${currentMonthBudgets.length} budget${currentMonthBudgets.length > 1 ? 's' : ''} • Total: ${formatCurrency(totalBudget)}`
              }
            </CardDescription>
          </div>
          <Button onClick={onAdd} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {currentMonthBudgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No budgets set for this month.</p>
            <p className="text-sm mt-2">Click Add Budget to set your first budget.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMonthBudgets.map((budget) => (
              <div
                key={budget._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="min-w-fit">
                    {budget.category}
                  </Badge>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatCurrency(budget.budgetAmount)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatMonth(budget.month)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(budget)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading || deletingId === budget._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the budget for {budget.category} 
                          in {formatMonth(budget.month)}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(budget._id!)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
