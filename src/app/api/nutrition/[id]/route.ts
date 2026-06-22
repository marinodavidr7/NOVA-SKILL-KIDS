import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [[menu]] = await db.query('SELECT * FROM menus WHERE id = ?', [Number(id)]) as any;

  if (!menu) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(menu);
}
