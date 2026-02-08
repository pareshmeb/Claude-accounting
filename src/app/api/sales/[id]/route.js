import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function PUT(request, { params }) {
  return Promise.all([request.json(), params]).then(([body, { id }]) => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(id));
    if (!sale) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const status = body.status !== undefined ? body.status : sale.status;
    const paidAmount = body.paidAmount !== undefined ? body.paidAmount : sale.paidAmount;
    db.prepare('UPDATE sales SET status = ?, paidAmount = ? WHERE id = ?').run(status, paidAmount, Number(id));
    return NextResponse.json({ ...sale, status, paidAmount });
  });
}
