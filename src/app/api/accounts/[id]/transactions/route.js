import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = await params;
  const accountId = parseInt(id, 10);

  return request.json().then(body => {
    const { transactionType, amount, date, description } = body;

    if (!transactionType || !amount || !date) {
      return NextResponse.json({ error: 'transactionType, amount, and date required' }, { status: 400 });
    }

    try {
      const result = db.prepare('INSERT INTO account_transactions (accountId, transactionType, amount, date, description) VALUES (?, ?, ?, ?, ?)')
        .run(accountId, transactionType, amount, date, description || null);

      // Update account's totalTransacted
      const transactions = db.prepare('SELECT SUM(amount) as sum FROM account_transactions WHERE accountId = ?').get(accountId);
      db.prepare('UPDATE accounts SET totalTransacted = ? WHERE id = ?').run(transactions.sum || 0, accountId);

      const transaction = db.prepare('SELECT * FROM account_transactions WHERE id = ?').get(result.lastInsertRowid);
      return NextResponse.json(transaction, { status: 201 });
    } catch (err) {
      console.error(`POST /api/accounts/${accountId}/transactions error:`, err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}

export async function GET(request, { params }) {
  const { id } = await params;
  const accountId = parseInt(id, 10);

  try {
    const transactions = db.prepare('SELECT * FROM account_transactions WHERE accountId = ? ORDER BY date DESC').all(accountId);
    return NextResponse.json(transactions);
  } catch (err) {
    console.error(`GET /api/accounts/${accountId}/transactions error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
