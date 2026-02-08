import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM debtor_receipts ORDER BY date DESC, id DESC').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, debtorId, amount, date, description } = body;
    db.prepare('INSERT INTO debtor_receipts (id, debtorId, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(id, debtorId, amount, date, description);
    return NextResponse.json({ id, debtorId, amount, date, description }, { status: 201 });
  });
}
