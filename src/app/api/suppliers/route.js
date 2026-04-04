import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const rows = db.prepare('SELECT * FROM suppliers ORDER BY id').all();
  return NextResponse.json(rows);
}

export function POST(request) {
  return request.json().then(body => {
    const { id, name, email, phone, address } = body;
    try {
      db.prepare('INSERT INTO suppliers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)').run(id, name, email, phone, address);
      return NextResponse.json({ id, name, email, phone, address }, { status: 201 });
    } catch (err) {
      console.error('POST /api/suppliers error:', err);
      if (err.message.includes('UNIQUE constraint failed: suppliers.name')) {
        return NextResponse.json({ error: 'Supplier name must be unique' }, { status: 400 });
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}
