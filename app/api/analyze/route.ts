import { NextRequest, NextResponse } from 'next/server';
import { scrapeInstagramProfile } from '@/lib/instagram/scraper';
import { queryOne, query, initializeDatabase } from '@/lib/db/client';
import { InstagramProfile, Job } from '@/types/instagram';
import { fetchCommentsForPosts } from '@/lib/instagram/apify';
import { analyzeBioHeuristics } from '@/lib/ai/heuristics';
import { processCommentsInBackground } from '@/lib/ai/gemini';

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      isDbInitialized = true;
    } catch (e: any) {
      console.error('Failed to initialize database on request:', e.message);
    }
  }
}

async function runBackgroundJob(jobId: number, username: string, profileData: InstagramProfile, posts: any[]) {
  try {
    // 1. Bio Heuristics
    const demographics = analyzeBioHeuristics(profileData.bio || '', profileData.external_url || '');
    
    // 2. Persist Profile
    const upsertProfileQuery = `
      INSERT INTO profiles (username, full_name, bio, followers, following_count, post_count, is_private, is_verified, profile_pic_url, external_url, female_pct, male_pct, undisclosed_pct, interest_cohort)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (username) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          bio = EXCLUDED.bio,
          followers = EXCLUDED.followers,
          following_count = EXCLUDED.following_count,
          post_count = EXCLUDED.post_count,
          is_private = EXCLUDED.is_private,
          is_verified = EXCLUDED.is_verified,
          profile_pic_url = EXCLUDED.profile_pic_url,
          external_url = EXCLUDED.external_url,
          female_pct = EXCLUDED.female_pct,
          male_pct = EXCLUDED.male_pct,
          undisclosed_pct = EXCLUDED.undisclosed_pct,
          interest_cohort = EXCLUDED.interest_cohort,
          updated_at = NOW()
      RETURNING id;
    `;

    const savedProfile = await queryOne(upsertProfileQuery, [
      profileData.username,
      profileData.full_name,
      profileData.bio,
      profileData.followers,
      profileData.following_count,
      profileData.post_count,
      profileData.is_private,
      profileData.is_verified,
      profileData.profile_pic_url,
      profileData.external_url,
      demographics.femalePct,
      demographics.malePct,
      demographics.undisclosedPct,
      demographics.cohort
    ]);

    const profileId = savedProfile?.id;
    if (!profileId) throw new Error("Failed to save profile.");

    // 3. Persist Posts
    const validPosts = posts || [];
    const postUrls = validPosts.map((p) => p.shortcode ? `https://www.instagram.com/p/${p.shortcode}/` : '').filter(Boolean);
    
    const dbPosts = [];
    for (const post of validPosts) {
      const savedPost = await queryOne(`
        INSERT INTO posts (profile_id, shortcode, caption, likes_count, comments_count, media_type, thumbnail_url, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (shortcode) DO UPDATE
        SET likes_count = EXCLUDED.likes_count,
            comments_count = EXCLUDED.comments_count,
            thumbnail_url = EXCLUDED.thumbnail_url,
            caption = EXCLUDED.caption
        RETURNING id
      `, [profileId, post.shortcode, post.caption, post.likes_count, post.comments_count, post.media_type, post.thumbnail_url, post.timestamp]);
      dbPosts.push({ dbId: savedPost?.id, shortcode: post.shortcode });
    }

    // 4. Fetch Apify Comments
    const rawComments = await fetchCommentsForPosts(postUrls);
    
    const commentsToClassify = [];
    for (const c of rawComments) {
      const matchedPost = dbPosts.find(p => c.postUrl.includes(p.shortcode));
      if (!matchedPost || !matchedPost.dbId) continue;
      
      const savedComment = await queryOne(`
        INSERT INTO comments (post_id, username, raw_text)
        VALUES ($1, $2, $3)
        RETURNING id, raw_text
      `, [matchedPost.dbId, c.username, c.text]);
      
      if (savedComment) {
        commentsToClassify.push(savedComment);
      }
    }

    // 5. Run ML Classification
    if (commentsToClassify.length > 0) {
      await processCommentsInBackground(jobId, commentsToClassify);
    } else {
      await query(`UPDATE jobs SET status = 'Completed', updated_at = NOW() WHERE id = $1`, [jobId]);
    }

  } catch (error: any) {
    console.error(`[Background Job Error]:`, error.message);
    await query(`UPDATE jobs SET status = 'Failed', error_message = $1, updated_at = NOW() WHERE id = $2`, [error.message, jobId]);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required and must be a string' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    console.log(`[API Scrape] Starting scraping for: ${cleanUsername}`);
    
    // Create Job Record
    const jobRecord = await queryOne(`
      INSERT INTO jobs (username, status) VALUES ($1, 'Scraping') RETURNING id
    `, [cleanUsername]);
    
    if (!jobRecord) throw new Error("Could not create job.");
    const jobId = jobRecord.id;

    // We do the initial profile scrape synchronously so we can return some immediate data.
    // However, comment fetching and ML processing is slow, so we background it.
    let profileData, posts;
    try {
      const result = await scrapeInstagramProfile(cleanUsername);
      profileData = result.profile;
      posts = result.posts;
    } catch (scrapeError: any) {
      await query(`UPDATE jobs SET status = 'Failed', error_message = $1, updated_at = NOW() WHERE id = $2`, [scrapeError.message, jobId]);
      throw scrapeError;
    }

    // Run background tasks (fire and forget)
    // In a serverless env like Vercel, this might get killed, but for a local/VPS setup it works fine.
    runBackgroundJob(jobId, cleanUsername, profileData, posts).catch(console.error);

    return NextResponse.json({
      success: true,
      jobId,
      data: profileData,
    });
  } catch (error: any) {
    console.error(`[API Scrape Error]:`, error.message);
    return NextResponse.json(
      { error: error.message || 'An error occurred while scraping the profile' },
      { status: 500 }
    );
  }
}

