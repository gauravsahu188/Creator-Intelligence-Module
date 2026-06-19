import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, initializeDatabase } from '@/lib/db/client';
import { InstagramProfile } from '@/types/instagram';

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      isDbInitialized = true;
    } catch (e: any) {
      console.error('Failed to initialize database on results request:', e.message);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'scraped_at'; // scraped_at, followers, username
    const sortOrder = searchParams.get('sortOrder') || 'DESC'; // ASC or DESC

    const offset = (page - 1) * limit;

    // Validate inputs
    const validSortFields = ['scraped_at', 'followers', 'username'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'scraped_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build query conditions
    let queryText = 'SELECT * FROM profiles';
    let countText = 'SELECT COUNT(*) FROM profiles';
    const queryParams: any[] = [];

    if (search) {
      const condition = ' WHERE username ILIKE $1 OR full_name ILIKE $1 OR bio ILIKE $1';
      queryText += condition;
      countText += condition;
      queryParams.push(`%${search}%`);
    }

    // Add sorting
    queryText += ` ORDER BY ${finalSortBy} ${finalSortOrder} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    const resultsParams = [...queryParams, limit, offset];

    // Execute query & count
    const [profiles, countRes] = await Promise.all([
      query<InstagramProfile>(queryText, resultsParams),
      queryOne<{ count: string }>(countText, queryParams),
    ]);

    const total = parseInt(countRes?.count || '0', 10);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      profiles,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('[API Results GET Error]:', error.message);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching profiles' },
      { status: 500 }
    );
  }
}
