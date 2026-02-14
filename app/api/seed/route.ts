import { NextResponse } from 'next/server';
import { seedIfEmpty } from '@/lib/seed-db';

async function handleSeed() {
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

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}
