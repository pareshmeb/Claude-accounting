import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function DELETE(request, { params }) {
  return params.then(({ id }) => {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  });
}
