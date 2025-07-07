##💸 Personal Finance Visualizer – Stage 2: Categories

## Overview
Stage 2 expands on the core transaction tracking by introducing **categories** and **dashboard visualizations**. This improves clarity on where money is being spent.

## What's Included
- ✅ All Stage 1 features (Add/Edit/Delete transactions, monthly expense chart)
- ✅ Predefined categories for transactions
- ✅ Ability to assign categories during transaction entry
- ✅ Category-wise Pie Chart for spending distribution
- ✅ Dashboard Summary Cards:
  - Total monthly expenses
  - Breakdown by category
  - List of recent transactions

## Key Components
- `TransactionForm.tsx` – Add/edit form with category selector
- `TransactionList.tsx` – Displays transactions with categories
- `CategoryPieChart.tsx` – Visualizes spending by category
- `SummaryCards.tsx` – Shows totals and recent activity

## ✅ Categories

Transactions now support **predefined categories** for better organization and reporting:

- Food
- Education
- Transport
- Utilities
- Entertainment
- Other

---

## ✅ API Routes

All transaction API endpoints support the new `category` field:

- `GET /api/transactions` – Fetch all transactions
- `POST /api/transactions` – Add new transaction with category
- `PUT /api/transactions/[id]` – Edit transaction (including category)
- `DELETE /api/transactions/[id]` – Delete transaction

---

## ✅ UI/UX Enhancements

- **Category Select**: Easy-to-use dropdown in forms (using shadcn/ui components)
- **Pie Charts**: Visualize category-wise spending with Recharts
- **Responsive Design**: Clean, consistent layout that works on all device sizes

## ⚙️ Local Development

```bash
npm install
npm run dev
```
