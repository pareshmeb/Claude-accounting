import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function PUT(request, { params }) {
  return Promise.all([request.json(), params]).then(([body, { id }]) => {
    const debtor = db.prepare('SELECT * FROM debtors WHERE id = ?').get(Number(id));
    if (!debtor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const received = body.received !== undefined ? body.received : debtor.received;
    db.prepare('UPDATE debtors SET received = ? WHERE id = ?').run(received, Number(id));
    return NextResponse.json({ ...debtor, received });
  });
}

export function DELETE(request, { params }) {
  return params.then(({ id }) => {
    db.prepare('DELETE FROM debtors WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  });
}
