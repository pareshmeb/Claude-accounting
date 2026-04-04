import { NextResponse } from 'next/server';
import db from '@/lib/db';

function cleanAmount(value) {
  return parseFloat(String(value || '').replace(/[₹\s,]/g, '')) || 0;
}

function cleanDate(dateStr) {
  if (!dateStr) return null;
  
  // If already YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }
  
  // Try other formats
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(dateStr)) {
    const d = new Date(dateStr.replace(/-/g, '/'));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }
  
  return null;
}

export function POST(request) {
  return request.json().then(body => {
    console.log('import POST: received body', body);
    const { accounts } = body;
    if (!accounts || !accounts.length) {
      console.error('import POST: no accounts to import');
      return NextResponse.json({ error: 'No accounts to import' }, { status: 400 });
    }

    console.log(`import POST: processing ${accounts.length} accounts`);
    const result = { accounts: 0, transactions: 0, errors: [] };

    const importAll = db.transaction(() => {
      for (const account of accounts) {
        const { name, type, entries } = account;

        try {
          let totalPayment = 0;
          let totalReceived = 0;

          for (const entry of entries) {
            const cleanedPayment = cleanAmount(entry.payment);
            const cleanedReceived = cleanAmount(entry.received);
            totalPayment += cleanedPayment;
            totalReceived += cleanedReceived;
          }

          // Calculate net balance (positive = money owed to us, negative = we owe money)
          const netBalance = totalReceived - totalPayment;
          const totalTransacted = Math.abs(netBalance);

          // Insert into unified accounts table
          const accountResult = db.prepare('INSERT INTO accounts (name, totalAmount, totalTransacted, description) VALUES (?, ?, ?, ?)')
            .run(name, netBalance, totalTransacted, `Imported from Excel`);
          const accountId = accountResult.lastInsertRowid;
          result.accounts++;
          console.log(`import POST: inserted account ${name} id=${accountId} netBalance=${netBalance} totalTransacted=${totalTransacted}`);

          // Insert all transactions
          for (const entry of entries) {
            const cleanedPayment = cleanAmount(entry.payment);
            const cleanedReceived = cleanAmount(entry.received);
            const cleanedDate = cleanDate(entry.date);

            if (!cleanedDate) {
              console.log(`import POST: skipping entry for ${name} invalid date`, entry.date);
              continue;
            }

            // Insert payment transaction
            if (cleanedPayment > 0) {
              const txResult = db.prepare('INSERT INTO account_transactions (accountId, transactionType, amount, date, description) VALUES (?, ?, ?, ?, ?)')
                .run(accountId, 'payment', cleanedPayment, cleanedDate, entry.description);
              result.transactions++;
              console.log(`import POST: inserted payment transaction id=${txResult.lastInsertRowid} amount=${cleanedPayment}`);
            }

            // Insert receipt transaction
            if (cleanedReceived > 0) {
              const txResult = db.prepare('INSERT INTO account_transactions (accountId, transactionType, amount, date, description) VALUES (?, ?, ?, ?, ?)')
                .run(accountId, 'receipt', cleanedReceived, cleanedDate, entry.description);
              result.transactions++;
              console.log(`import POST: inserted receipt transaction id=${txResult.lastInsertRowid} amount=${cleanedReceived}`);
            }
          }
        } catch (err) {
          console.error(`import POST: error processing account ${name}`, err);
          result.errors.push(`${name}: ${err.message}`);
        }
      }
    });

    importAll();
    console.log('import POST: final result', result);
    return NextResponse.json({ success: true, imported: result }, { status: 201 });
  });
}
