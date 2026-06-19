import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db/client';
import { InstagramProfile } from '@/types/instagram';

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      isDbInitialized = true;
    } catch (e: any) {
      console.error('Failed to initialize database on download request:', e.message);
    }
  }
}

/**
 * Escapes fields for CSV output
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  // Replace double quotes with two double quotes
  const escaped = str.replace(/"/g, '""');
  // Wrap in double quotes if there are commas, newlines, or double quotes
  if (/[,\n\r"]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    const search = searchParams.get('search') || '';

    // Fetch matching data from DB
    let queryText = 'SELECT username, full_name, bio, followers, is_private, scraped_at FROM profiles';
    const queryParams: any[] = [];

    if (search) {
      queryText += ' WHERE username ILIKE $1 OR full_name ILIKE $1 OR bio ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    queryText += ' ORDER BY scraped_at DESC';

    const profiles = await query<InstagramProfile>(queryText, queryParams);

    if (format.toLowerCase() === 'json') {
      const jsonContent = JSON.stringify(profiles, null, 2);
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="instagram_profiles.json"',
        },
      });
    }

    // Default to CSV
    const headers = ['Username', 'Full Name', 'Bio', 'Followers', 'Is Private', 'Scraped At'];
    const csvRows = [headers.join(',')];

    for (const p of profiles) {
      const row = [
        escapeCsvValue(p.username),
        escapeCsvValue(p.full_name),
        escapeCsvValue(p.bio),
        p.followers !== null ? p.followers : '',
        p.is_private !== null ? (p.is_private ? 'TRUE' : 'FALSE') : '',
        p.scraped_at ? new Date(p.scraped_at).toISOString() : '',
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="instagram_profiles.csv"',
      },
    });
  } catch (error: any) {
    console.error('[API Download Error]:', error.message);
    return NextResponse.json(
      { error: error.message || 'An error occurred while exporting data' },
      { status: 500 }
    );
  }
}
