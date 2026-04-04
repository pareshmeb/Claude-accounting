import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function POST(request) {
  return request.json().then(body => {
    const { accounts } = body;
    if (!accounts || !accounts.length) {
      return NextResponse.json({ error: 'No accounts to import' }, { status: 400 });
    }

    const result = { creditors: 0, debtors: 0, payments: 0, receipts: 0, transactions: 0 };

    const importAll = db.transaction(() => {
      for (const account of accounts) {
        const { name, type, amount, paidOrReceived, entries } = account;

        if (type === 'creditor') {
          const creditorId = Date.now() + result.creditors;
          db.prepare('INSERT INTO creditors (id, name, amount, paid, dueDate, description) VALUES (?, ?, ?, ?, ?, ?)')
            .run(creditorId, name, amount, paidOrReceived, '', `Imported from Excel`);
          result.creditors++;

          for (const entry of entries) {
            if (entry.payment > 0) {
              const paymentId = Date.now() + result.payments + 1000;
              db.prepare('INSERT INTO creditor_payments (id, creditorId, amount, date, description) VALUES (?, ?, ?, ?, ?)')
                .run(paymentId, creditorId, entry.payment, entry.date, entry.description);
              result.payments++;

              const txId = Date.now() + result.transactions + 2000;
              db.prepare('INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)')
                .run(txId, 'expense', entry.payment, 7, `Payment to ${name}: ${entry.description}`, entry.date);
              result.transactions++;
            }
          }
        } else {
          const debtorId = Date.now() + result.debtors + 500;
          db.prepare('INSERT INTO debtors (id, name, amount, received, dueDate, description) VALUES (?, ?, ?, ?, ?, ?)')
            .run(debtorId, name, amount, paidOrReceived, '', `Imported from Excel`);
          result.debtors++;

          for (const entry of entries) {
            if (entry.received > 0) {
              const receiptId = Date.now() + result.receipts + 3000;
              db.prepare('INSERT INTO debtor_receipts (id, debtorId, amount, date, description) VALUES (?, ?, ?, ?, ?)')
                .run(receiptId, debtorId, entry.received, entry.date, entry.description);
              result.receipts++;

              const txId = Date.now() + result.transactions + 4000;
              db.prepare('INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)')
                .run(txId, 'income', entry.received, 4, `Receipt from ${name}: ${entry.description}`, entry.date);
              result.transactions++;
            }
          }
        }
      }
    });

    importAll();
    return NextResponse.json({ success: true, imported: result }, { status: 201 });
  });
}
