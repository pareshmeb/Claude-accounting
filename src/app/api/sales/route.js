import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const salesRows = db.prepare('SELECT * FROM sales ORDER BY date DESC, id DESC').all();
  const items = db.prepare('SELECT * FROM sale_items').all();
  const result = salesRows.map(s => ({
    ...s,
    items: items.filter(i => i.saleId === s.id).map(({ id, saleId, ...rest }) => rest),
  }));
  return NextResponse.json(result);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, invoiceNo, customerId, date, description, items, status, paidAmount } = body;
    const insert = db.transaction(() => {
      db.prepare('INSERT INTO sales (id, invoiceNo, customerId, date, description, status, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, invoiceNo, customerId, date, description, status || 'unpaid', paidAmount || 0);
      const stmt = db.prepare('INSERT INTO sale_items (saleId, name, qty, price) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        stmt.run(id, item.name, item.qty, item.price);
      }
    });
    insert();
    return NextResponse.json({ id, invoiceNo, customerId, date, description, items, status: status || 'unpaid', paidAmount: paidAmount || 0 }, { status: 201 });
  });
}
