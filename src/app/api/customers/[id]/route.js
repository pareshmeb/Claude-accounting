import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = await params;
  const numId = Number(id);
  const execute = db.transaction(() => {
    db.prepare('DELETE FROM customer_payments WHERE customerId = ?').run(numId);
    db.prepare('DELETE FROM sales WHERE customerId = ?').run(numId);
    db.prepare('DELETE FROM customers WHERE id = ?').run(numId);
  });
  execute();
  return NextResponse.json({ success: true });
}
