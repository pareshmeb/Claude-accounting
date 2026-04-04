import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = await params;
  const numId = Number(id);
  const execute = db.transaction(() => {
    db.prepare('DELETE FROM supplier_payments WHERE supplierId = ?').run(numId);
    db.prepare('DELETE FROM purchases WHERE supplierId = ?').run(numId);
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(numId);
  });
  execute();
  return NextResponse.json({ success: true });
}
