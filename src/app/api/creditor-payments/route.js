import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM creditor_payments ORDER BY date DESC, id DESC').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, creditorId, amount, date, description } = body;
    db.prepare('INSERT INTO creditor_payments (id, creditorId, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(id, creditorId, amount, date, description);
    return NextResponse.json({ id, creditorId, amount, date, description }, { status: 201 });
  });
}
