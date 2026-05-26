import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request, { params }) {
  const { id, transactionId } = await params;
  const accountId = parseInt(id, 10);
  const txId = parseInt(transactionId, 10);

  return request.json().then(body => {
    const { transactionType, amount, date, description } = body;

    if (!transactionType || !amount || !date) {
      return NextResponse.json({ error: 'transactionType, amount, and date required' }, { status: 400 });
    }

    try {
      const result = db.prepare(
        'UPDATE account_transactions SET transactionType = ?, amount = ?, date = ?, description = ? WHERE id = ? AND accountId = ?'
      ).run(transactionType, amount, date, description || null, txId, accountId);

      if (result.changes === 0) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      const transactions = db.prepare('SELECT SUM(amount) as sum FROM account_transactions WHERE accountId = ?').get(accountId);
      db.prepare('UPDATE accounts SET totalTransacted = ? WHERE id = ?').run(transactions.sum || 0, accountId);

      const transaction = db.prepare('SELECT * FROM account_transactions WHERE id = ?').get(txId);
      return NextResponse.json(transaction);
    } catch (err) {
      console.error(`PATCH /api/accounts/${accountId}/transactions/${txId} error:`, err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}

export async function DELETE(request, { params }) {
  const { id, transactionId } = await params;
  const accountId = parseInt(id, 10);
  const txId = parseInt(transactionId, 10);

  try {
    const result = db.prepare('DELETE FROM account_transactions WHERE id = ? AND accountId = ?').run(txId, accountId);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transactions = db.prepare('SELECT SUM(amount) as sum FROM account_transactions WHERE accountId = ?').get(accountId);
    db.prepare('UPDATE accounts SET totalTransacted = ? WHERE id = ?').run(transactions.sum || 0, accountId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/accounts/${accountId}/transactions/${txId} error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
