import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function POST(request) {
  return request.json().then(body => {
    const { type, id, amount, date, description, reference, billNo, invoiceNo, transactionId, transactionType, transactionCategory, transactionDescription } = body;

    const execute = db.transaction(() => {
      // Insert transaction record
      db.prepare('INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)').run(transactionId, transactionType, amount, transactionCategory, transactionDescription, date);

      if (type === 'supplier') {
        const paymentId = Date.now();
        db.prepare('INSERT INTO supplier_payments (id, supplierId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(paymentId, id, amount, date, reference || 'Direct', description);
        if (billNo) {
          const purchase = db.prepare('SELECT * FROM purchases WHERE billNo = ?').get(billNo);
          if (purchase) {
            const items = db.prepare('SELECT * FROM purchase_items WHERE purchaseId = ?').all(purchase.id);
            const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
            const newPaid = purchase.paidAmount + amount;
            const newStatus = newPaid >= total ? 'paid' : 'partial';
            db.prepare('UPDATE purchases SET paidAmount = ?, status = ? WHERE billNo = ?').run(newPaid, newStatus, billNo);
          }
        }
      } else if (type === 'customer') {
        const paymentId = Date.now();
        db.prepare('INSERT INTO customer_payments (id, customerId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(paymentId, id, amount, date, reference || 'Direct', description);
        if (invoiceNo) {
          const sale = db.prepare('SELECT * FROM sales WHERE invoiceNo = ?').get(invoiceNo);
          if (sale) {
            const items = db.prepare('SELECT * FROM sale_items WHERE saleId = ?').all(sale.id);
            const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
            const newPaid = sale.paidAmount + amount;
            const newStatus = newPaid >= total ? 'paid' : 'partial';
            db.prepare('UPDATE sales SET paidAmount = ?, status = ? WHERE invoiceNo = ?').run(newPaid, newStatus, invoiceNo);
          }
        }
      } else if (type === 'creditor') {
        const paymentId = Date.now();
        db.prepare('INSERT INTO creditor_payments (id, creditorId, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(paymentId, id, amount, date, description);
        db.prepare('UPDATE creditors SET paid = paid + ? WHERE id = ?').run(amount, id);
      } else if (type === 'debtor') {
        const receiptId = Date.now();
        db.prepare('INSERT INTO debtor_receipts (id, debtorId, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(receiptId, id, amount, date, description);
        db.prepare('UPDATE debtors SET received = received + ? WHERE id = ?').run(amount, id);
      }
    });

    execute();
    return NextResponse.json({ success: true }, { status: 201 });
  });
}
