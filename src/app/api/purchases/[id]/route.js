import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = await params;
  db.prepare('DELETE FROM purchases WHERE id = ?').run(Number(id));
  return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
  const [body, { id }] = await Promise.all([request.json(), params]);
  const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(Number(id));
  if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const status = body.status !== undefined ? body.status : purchase.status;
  const paidAmount = body.paidAmount !== undefined ? body.paidAmount : purchase.paidAmount;
  db.prepare('UPDATE purchases SET status = ?, paidAmount = ? WHERE id = ?').run(status, paidAmount, Number(id));
  return NextResponse.json({ ...purchase, status, paidAmount });
}
