import { NextRequest, NextResponse } from 'next/server';
import { queryOne, initializeDatabase } from '@/lib/db/client';

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      isDbInitialized = true;
    } catch (e: any) {
      console.error('Failed to initialize database on stats request:', e.message);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureDb();

    // Query total profiles, private count, public count, average followers
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_private = TRUE THEN 1 END) as private,
        COUNT(CASE WHEN is_private = FALSE THEN 1 END) as public,
        COALESCE(AVG(followers), 0) as avg_followers
      FROM profiles;
    `;

    const stats = await queryOne<any>(statsQuery);

    return NextResponse.json({
      total: parseInt(stats?.total || '0', 10),
      privateCount: parseInt(stats?.private || '0', 10),
      publicCount: parseInt(stats?.public || '0', 10),
      avgFollowers: Math.round(parseFloat(stats?.avg_followers || '0')),
    });
  } catch (error: any) {
    console.error('[API Stats Error]:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate database statistics' },
      { status: 500 }
    );
  }
}
