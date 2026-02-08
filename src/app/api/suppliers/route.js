import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM suppliers ORDER BY id').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, name, email, phone, address } = body;
    db.prepare('INSERT INTO suppliers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)').run(id, name, email, phone, address);
    return NextResponse.json({ id, name, email, phone, address }, { status: 201 });
  });
}
