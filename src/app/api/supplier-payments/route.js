import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM supplier_payments ORDER BY date DESC, id DESC').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, supplierId, amount, date, reference, description } = body;
    db.prepare('INSERT INTO supplier_payments (id, supplierId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(id, supplierId, amount, date, reference, description);
    return NextResponse.json({ id, supplierId, amount, date, reference, description }, { status: 201 });
  });
}
