import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const purchases = db.prepare('SELECT * FROM purchases ORDER BY date DESC, id DESC').all();
  const items = db.prepare('SELECT * FROM purchase_items').all();
  const result = purchases.map(p => ({
    ...p,
    items: items.filter(i => i.purchaseId === p.id).map(({ id, purchaseId, ...rest }) => rest),
  }));
  return NextResponse.json(result);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, billNo, supplierId, date, description, items, status, paidAmount } = body;
    const insert = db.transaction(() => {
      db.prepare('INSERT INTO purchases (id, billNo, supplierId, date, description, status, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, billNo, supplierId, date, description, status || 'unpaid', paidAmount || 0);
      const stmt = db.prepare('INSERT INTO purchase_items (purchaseId, name, qty, price) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        stmt.run(id, item.name, item.qty, item.price);
      }
    });
    insert();
    return NextResponse.json({ id, billNo, supplierId, date, description, items, status: status || 'unpaid', paidAmount: paidAmount || 0 }, { status: 201 });
  });
}
