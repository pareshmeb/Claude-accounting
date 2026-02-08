import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function PUT(request, { params }) {
  return Promise.all([request.json(), params]).then(([body, { id }]) => {
    const creditor = db.prepare('SELECT * FROM creditors WHERE id = ?').get(Number(id));
    if (!creditor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const paid = body.paid !== undefined ? body.paid : creditor.paid;
    db.prepare('UPDATE creditors SET paid = ? WHERE id = ?').run(paid, Number(id));
    return NextResponse.json({ ...creditor, paid });
  });
}

export function DELETE(request, { params }) {
  return params.then(({ id }) => {
    db.prepare('DELETE FROM creditors WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  });
}
