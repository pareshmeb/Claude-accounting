import { NextResponse } from 'next/server';
import db from '@/lib/db';

function cleanAmount(value) {
  return parseFloat(String(value || '').replace(/[₹\s,]/g, '')) || 0;
}

function cleanDate(dateStr) {
  if (!dateStr) return null;

  const trimmed = String(dateStr).trim();
  
  // If already YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle D/M/YYYY or D-M-YYYY and also DD/MM/YYYY formats without timezone conversion
  const normalized = trimmed.replace(/-/g, '/');
  const parts = normalized.split('/');
  if (parts.length === 3) {
    let [part1, part2, part3] = parts.map(p => p.trim());
    if (!/^\d{1,4}$/.test(part1) || !/^\d{1,2}$/.test(part2) || !/^\d{2,4}$/.test(part3)) {
      return null;
    }

    let year;
    let month;
    let day;

    if (part1.length === 4) {
      year = part1;
      month = part2.padStart(2, '0');
      day = part3.padStart(2, '0');
    } else {
      day = part1.padStart(2, '0');
      month = part2.padStart(2, '0');
      year = part3.length === 2 ? `20${part3}` : part3.padStart(4, '0');
    }

    const numericYear = Number(year);
    const numericMonth = Number(month);
    const numericDay = Number(day);
    if (
      numericYear < 1000 ||
      numericMonth < 1 || numericMonth > 12 ||
      numericDay < 1 || numericDay > 31
    ) {
      return null;
    }

    // Validate the date components without applying timezone shifts.
    const utcDate = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay));
    if (
      utcDate.getUTCFullYear() !== numericYear ||
      utcDate.getUTCMonth() + 1 !== numericMonth ||
      utcDate.getUTCDate() !== numericDay
    ) {
      return null;
    }

    return `${year}-${month}-${day}`;
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
