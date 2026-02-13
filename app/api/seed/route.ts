import { NextResponse } from 'next/server';
import { seedIfEmpty } from '@/lib/seed-db';

export async function POST() {
  // Only allow seeding in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding disabled in production' }, { status: 403 });
  }

  try {
    const seeded = await seedIfEmpty();
    return NextResponse.json({ seeded });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
