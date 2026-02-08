import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, type, amount, category, description, date } = body;
    db.prepare('INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)').run(id, type, amount, category, description, date);
    return NextResponse.json({ id, type, amount, category, description, date }, { status: 201 });
  });
}
