'use client';

import { useState } from 'react';
import { Budget } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

interface BudgetFormProps {
  budget?: Budget;
  onSave: (budget: Omit<Budget, '_id'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CATEGORIES = ['Food', 'Education', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function BudgetForm({ budget, onSave, onCancel, isLoading }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    month: budget?.month || '',
    budgetAmount: budget?.budgetAmount?.toString() || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.month) {
      newErrors.month = 'Month is required';
    } else if (!/^\d{4}-\d{2}$/.test(formData.month)) {
      newErrors.month = 'Month must be in YYYY-MM format';
    }
    
    if (!formData.budgetAmount) {
      newErrors.budgetAmount = 'Budget amount is required';
    } else if (parseFloat(formData.budgetAmount) <= 0) {
      newErrors.budgetAmount = 'Budget amount must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      category: formData.category,
      month: formData.month,
      budgetAmount: parseFloat(formData.budgetAmount)
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate month options for the current year and next few months
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Add previous 3 months, current month, and next 12 months
    for (let i = -3; i <= 12; i++) {
      const date = new Date(currentYear, currentDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{budget ? 'Edit Budget' : 'Add New Budget'}</CardTitle>
        <CardDescription>
          {budget ? 'Update your budget details' : 'Set a budget for a specific category and month'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select
              value={formData.month}
              onValueChange={(value) => handleInputChange('month', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetAmount">Budget Amount ($)</Label>
            <Input
              id="budgetAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.budgetAmount}
              onChange={(e) => handleInputChange('budgetAmount', e.target.value)}
              placeholder="0.00"
            />
            {errors.budgetAmount && <p className="text-sm text-red-500">{errors.budgetAmount}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Budget
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
