import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM debtors ORDER BY id').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, name, amount, received, dueDate, description } = body;
    db.prepare('INSERT INTO debtors (id, name, amount, received, dueDate, description) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, amount, received || 0, dueDate, description);
    return NextResponse.json({ id, name, amount, received: received || 0, dueDate, description }, { status: 201 });
  });
}
