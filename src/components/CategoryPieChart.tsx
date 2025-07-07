'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';

interface CategoryPieChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

// Define category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#FF6B6B', 
  'Education': '#66BB6A', 
  'Transport': '#4ECDC4', 
  'Utilities': '#AB47BC', 
  'Entertainment': '#FFA726', 
  'Other': '#8D6E63' 
};

// Define the shape of data items used in recharts for this specific chart
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export default function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  // Calculate total spending by category
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Other';
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for recharts
  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: CATEGORY_COLORS[category] || '#8D6E63'
  }));

  // Sort by value for better visualization
  chartData.sort((a, b) => b.value - a.value);

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartDataItem }>;
    label?: string; // recharts also provides label, though not used here
  }
  
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ₹{data.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  interface CustomLegendProps {
    payload?: Array<{
      value: string; // The name of the category
      color: string;
      // Add other properties if you use them, e.g., `id`, `type`, `dataKey`
    }>;
  }

  const CustomLegend = ({ payload }: CustomLegendProps) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload?.map((entry, index) => ( // Use optional chaining for payload
          <div key={index} className="flex items-center gap-1 text-xs">
            <div
              className={`w-3 h-3 rounded-full bg-[${entry.color}]`}
            />
            <span className="text-gray-600 dark:text-gray-400">{entry.value}</span> {/* entry.value is the category name here */}
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            No transactions to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Expenses by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const actualPercent = percent !== undefined ? percent : 0;
                  return `${name} ${(actualPercent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Expenses: <span className="font-semibold text-gray-800 dark:text-gray-200">₹{totalAmount.toLocaleString()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
