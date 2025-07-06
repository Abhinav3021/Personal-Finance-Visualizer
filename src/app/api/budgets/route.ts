import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Budget } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let filter = {};
    if (month) {
      filter = { month };
    }
    
    const budgets = await db.collection('budgets').find(filter).toArray();
    
    const transformedBudgets = budgets.map(budget => ({
      _id: budget._id.toString(),
      category: budget.category,
      month: budget.month,
      budgetAmount: budget.budgetAmount
    }));
    
    return NextResponse.json(transformedBudgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const body = await request.json();
    
    const { category, month, budgetAmount } = body;
    
    if (!category || !month || !budgetAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (budgetAmount <= 0) {
      return NextResponse.json({ error: 'Budget amount must be positive' }, { status: 400 });
    }
    
    // Check if budget already exists for this category and month
    const existingBudget = await db.collection('budgets').findOne({ category, month });
    if (existingBudget) {
      return NextResponse.json({ error: 'Budget already exists for this category and month' }, { status: 400 });
    }
    
    const budget: Omit<Budget, '_id'> = {
      category,
      month,
      budgetAmount: parseFloat(budgetAmount)
    };
    
    const result = await db.collection('budgets').insertOne(budget);
    
    return NextResponse.json({ 
      _id: result.insertedId.toString(),
      ...budget
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const body = await request.json();
    
    const { _id, category, month, budgetAmount } = body;
    
    if (!_id || !category || !month || !budgetAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (budgetAmount <= 0) {
      return NextResponse.json({ error: 'Budget amount must be positive' }, { status: 400 });
    }
    
    
    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: {
          category,
          month,
          budgetAmount: parseFloat(budgetAmount)
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      _id,
      category,
      month,
      budgetAmount: parseFloat(budgetAmount)
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing budget ID' }, { status: 400 });
    }
    

    
    const result = await db.collection('budgets').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
