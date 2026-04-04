import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  try {
    const accounts = db.prepare('SELECT * FROM accounts ORDER BY name ASC').all();
    
    // Fetch transactions for each account
    const accountsWithTransactions = accounts.map(account => {
      const transactions = db.prepare('SELECT * FROM account_transactions WHERE accountId = ? ORDER BY date DESC').all(account.id);
      return { ...account, transactions };
    });

    return NextResponse.json(accountsWithTransactions);
  } catch (err) {
    console.error('GET /api/accounts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export function POST(request) {
  return request.json().then(body => {
    const { name, type, totalAmount, dueDate, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    try {
      const result = db.prepare('INSERT INTO accounts (name, totalAmount, totalTransacted, dueDate, description) VALUES (?, ?, ?, ?, ?)')
        .run(name, totalAmount || 0, 0, dueDate || null, description || null);

      const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(result.lastInsertRowid);
      return NextResponse.json(account, { status: 201 });
    } catch (err) {
      console.error('POST /api/accounts error:', err);
      if (err.message.includes('UNIQUE constraint failed: accounts.name')) {
        return NextResponse.json({ error: 'Account name must be unique' }, { status: 400 });
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}
