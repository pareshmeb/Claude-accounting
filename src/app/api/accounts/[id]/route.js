import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const accountId = parseInt(id, 10);

  try {
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const transactions = db.prepare('SELECT * FROM account_transactions WHERE accountId = ? ORDER BY date DESC').all(accountId);
    return NextResponse.json({ ...account, transactions });
  } catch (err) {
    console.error(`GET /api/accounts/${accountId} error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const accountId = parseInt(id, 10);

  return request.json().then(body => {
    try {
      const { name, totalAmount, dueDate, description } = body;
      db.prepare('UPDATE accounts SET name = ?, totalAmount = ?, dueDate = ?, description = ? WHERE id = ?')
        .run(name, totalAmount, dueDate, description, accountId);

      const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
      return NextResponse.json(account);
    } catch (err) {
      console.error(`PUT /api/accounts/${accountId} error:`, err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const accountId = parseInt(id, 10);

  try {
    db.prepare('DELETE FROM account_transactions WHERE accountId = ?').run(accountId);
    db.prepare('DELETE FROM accounts WHERE id = ?').run(accountId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/accounts/${accountId} error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
