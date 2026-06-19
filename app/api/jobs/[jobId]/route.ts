import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // 1. Fetch Job Status
    const jobResult = await queryOne(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    
    if (!jobResult) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { username, status, total_chunks, processed_chunks, error_message } = jobResult;

    if (status !== 'Completed') {
      return NextResponse.json({
        jobId,
        status,
        total_chunks,
        processed_chunks,
        errorMessage: error_message || null,
      });
    }

    // 2. Fetch Full Payload if Completed
    const profile = await queryOne(`SELECT * FROM profiles WHERE username = $1`, [username]);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile data missing' }, { status: 404 });
    }

    const postsQuery = await query(`SELECT * FROM posts WHERE profile_id = $1 ORDER BY timestamp DESC LIMIT 12`, [profile.id]);
    const posts = postsQuery || [];

    let totalLikes = 0;
    let totalComments = 0;
    posts.forEach((p) => {
      totalLikes += p.likes_count || 0;
      totalComments += p.comments_count || 0;
    });

    const engagementRate = profile.followers && profile.followers > 0
      ? (((totalLikes + totalComments) / 12) / profile.followers * 100).toFixed(2)
      : 0;

    // Comments Aggregation
    const postIds = posts.map(p => p.id);
    let commentsAggregation = {
      genuine: 0,
      spam: 0,
      human: 0,
      likelyBot: 0,
    };

    if (postIds.length > 0) {
      const aggResult = await query(`
        SELECT 
          SUM(CASE WHEN authenticity = 'Genuine' THEN 1 ELSE 0 END) as genuine_count,
          SUM(CASE WHEN authenticity = 'Spam' THEN 1 ELSE 0 END) as spam_count,
          SUM(CASE WHEN bot_likelihood = 'Human' THEN 1 ELSE 0 END) as human_count,
          SUM(CASE WHEN bot_likelihood = 'Uncertain' THEN 1 ELSE 0 END) as uncertain_count,
          SUM(CASE WHEN bot_likelihood = 'Likely-bot' THEN 1 ELSE 0 END) as bot_count,
          SUM(CASE WHEN relevance = 'On-topic' THEN 1 ELSE 0 END) as on_topic_count,
          SUM(CASE WHEN relevance = 'Off-topic' THEN 1 ELSE 0 END) as off_topic_count,
          SUM(CASE WHEN political_stance = 'Positive' THEN 1 ELSE 0 END) as pos_stance_count,
          SUM(CASE WHEN political_stance = 'Neutral' THEN 1 ELSE 0 END) as neu_stance_count,
          SUM(CASE WHEN political_stance = 'Negative' THEN 1 ELSE 0 END) as neg_stance_count
        FROM comments 
        WHERE post_id = ANY($1)
      `, [postIds]);

      const langAgg = await query(`SELECT language, COUNT(*) as count FROM comments WHERE post_id = ANY($1) AND language IS NOT NULL GROUP BY language`, [postIds]);
      const typeAgg = await query(`SELECT comment_type, COUNT(*) as count FROM comments WHERE post_id = ANY($1) AND comment_type IS NOT NULL GROUP BY comment_type`, [postIds]);
      const partyAgg = await query(`
        SELECT political_party, political_stance, COUNT(*) as count 
        FROM comments 
        WHERE post_id = ANY($1) AND political_party IS NOT NULL AND political_party != 'None' 
        GROUP BY political_party, political_stance
      `, [postIds]);

      if (aggResult && aggResult.length > 0) {
        commentsAggregation = {
          genuine: parseInt(aggResult[0].genuine_count) || 0,
          spam: parseInt(aggResult[0].spam_count) || 0,
          human: parseInt(aggResult[0].human_count) || 0,
          uncertain: parseInt(aggResult[0].uncertain_count) || 0,
          likelyBot: parseInt(aggResult[0].bot_count) || 0,
          onTopic: parseInt(aggResult[0].on_topic_count) || 0,
          offTopic: parseInt(aggResult[0].off_topic_count) || 0,
          positive: parseInt(aggResult[0].pos_stance_count) || 0,
          neutral: parseInt(aggResult[0].neu_stance_count) || 0,
          negative: parseInt(aggResult[0].neg_stance_count) || 0,
          languages: {},
          commentTypes: {},
          politicalMentions: {}
        } as any;

        if (langAgg) {
          langAgg.forEach((row: any) => {
            (commentsAggregation as any).languages[row.language] = parseInt(row.count);
          });
        }
        if (typeAgg) {
          typeAgg.forEach((row: any) => {
            (commentsAggregation as any).commentTypes[row.comment_type] = parseInt(row.count);
          });
        }
        if (partyAgg) {
          // Store max count sentiment as the primary sentiment for the party for simplicity
          const partyMap: any = {};
          partyAgg.forEach((row: any) => {
            if (!partyMap[row.political_party]) {
              partyMap[row.political_party] = { count: 0, sentiment: row.political_stance, maxSentimentCount: 0 };
            }
            partyMap[row.political_party].count += parseInt(row.count);
            if (parseInt(row.count) > partyMap[row.political_party].maxSentimentCount) {
              partyMap[row.political_party].sentiment = row.political_stance;
              partyMap[row.political_party].maxSentimentCount = parseInt(row.count);
            }
          });
          
          Object.keys(partyMap).forEach(party => {
            (commentsAggregation as any).politicalMentions[party] = {
              count: partyMap[party].count,
              sentiment: partyMap[party].sentiment
            };
          });
        }
      }
    }

    return NextResponse.json({
      jobId,
      status,
      data: {
        profile: {
          ...profile,
          engagementRate,
        },
        posts,
        commentsAggregation
      }
    });

  } catch (error: any) {
    console.error(`[API Jobs Error]:`, error.message);
    return NextResponse.json(
      { error: error.message || 'An error occurred fetching the job.' },
      { status: 500 }
    );
  }
}
