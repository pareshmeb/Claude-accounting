import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM creditors ORDER BY id').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, name, amount, paid, dueDate, description } = body;
    db.prepare('INSERT INTO creditors (id, name, amount, paid, dueDate, description) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, amount, paid || 0, dueDate, description);
    return NextResponse.json({ id, name, amount, paid: paid || 0, dueDate, description }, { status: 201 });
  });
}
