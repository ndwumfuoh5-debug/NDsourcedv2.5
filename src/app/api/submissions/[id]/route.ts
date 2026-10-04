import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await queryInternalDatabase(
    'SELECT * FROM pitch_submissions WHERE id = $1',
    [id],
  );
  if (!result[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { status?: string; notes?: string };
  const { status, notes } = body;

  const result = await queryInternalDatabase(
    `UPDATE pitch_submissions
     SET status = COALESCE($1, status), notes = COALESCE($2, notes)
     WHERE id = $3
     RETURNING *`,
    [status ?? null, notes ?? null, id],
  );

  if (!result[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}
