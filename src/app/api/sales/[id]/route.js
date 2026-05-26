import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = await params;
  db.prepare('DELETE FROM sales WHERE id = ?').run(Number(id));
  return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
  const [body, { id }] = await Promise.all([request.json(), params]);
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(id));
  if (!sale) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const status = body.status !== undefined ? body.status : sale.status;
  const paidAmount = body.paidAmount !== undefined ? body.paidAmount : sale.paidAmount;
  db.prepare('UPDATE sales SET status = ?, paidAmount = ? WHERE id = ?').run(status, paidAmount, Number(id));
  return NextResponse.json({ ...sale, status, paidAmount });
}
