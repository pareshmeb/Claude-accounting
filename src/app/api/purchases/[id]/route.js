import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function PUT(request, { params }) {
  return Promise.all([request.json(), params]).then(([body, { id }]) => {
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(Number(id));
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const status = body.status !== undefined ? body.status : purchase.status;
    const paidAmount = body.paidAmount !== undefined ? body.paidAmount : purchase.paidAmount;
    db.prepare('UPDATE purchases SET status = ?, paidAmount = ? WHERE id = ?').run(status, paidAmount, Number(id));
    return NextResponse.json({ ...purchase, status, paidAmount });
  });
}
