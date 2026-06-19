import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';
import { getScrapOpsProxyUrl } from './proxy';
import { InstagramProfile } from '../../types/instagram';

// Helper delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Searches for a key in a nested object recursively
 */
function findKey(obj: any, keyToFind: string): any {
  try {
    if (!obj) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, keyToFind)) {
      return obj[keyToFind];
    }

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = findKey(obj[key], keyToFind);
        if (result !== undefined) {
          return result;
        }
      }
    }
    return undefined;
  } catch (error: any) {
    console.error('Error in findKey:', error.message);
    return undefined;
  }
}

/**
 * Searches for a value recursively inside an object or array
 */
function searchForValueIncluding(obj: any, searchString: string): any {
  try {
    if (!obj) return undefined;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (Array.isArray(item) && item[0] === searchString) {
          return obj;
        } else if (typeof item === 'object' && item !== null) {
          const result = searchForValueIncluding(item, searchString);
          if (result) return result;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const result = searchForValueIncluding(obj[key], searchString);
        if (result) return result;
      }
    }
    return undefined;
  } catch (error: any) {
    console.error('Error in searchForValueIncluding:', error.message);
    return undefined;
  }
}

/**
 * Parses script tags to extract page props
 */
function getProps(html: string): any {
  try {
    const $ = cheerio.load(html);
    let scriptIWant = '';
    $('script').each((i, elem) => {
      const htmlContent = $(elem).html() || '';
      if (htmlContent.includes('CountryNamesConfig')) {
        scriptIWant = htmlContent;
      }
    });

    if (!scriptIWant) return undefined;
    const scriptJSON = JSON.parse(scriptIWant);
    const nestedContentRoot = searchForValueIncluding(scriptJSON, 'PolarisProfileNestedContentRoot.react');
    return findKey(nestedContentRoot, 'props');
  } catch (error: any) {
    console.error('Error in getProps:', error.message);
    return undefined;
  }
}

/**
 * Method 1: Fetch profile via web_profile_info (recommended API endpoint, minimal bandwidth)
 */
async function getProfileWithHandle(username: string, proxyUrl?: string): Promise<{ profile: InstagramProfile; posts: any[] }> {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
  
  console.log(`[Scraper] Fetching profile info for "${username}" via web_profile_info...`);
  
  const response = await gotScraping({
    url,
    proxyUrl,
    responseType: 'json',
    headers: {
      'x-ig-app-id': '936619743392459',
      'sec-ch-ua-platform': '"macOS"',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
  });

  const body = response.body as any;
  const user = body?.data?.user;

  if (!user) {
    throw new Error('User data not found in response');
  }

  const profile: InstagramProfile = {
    username: user.username,
    full_name: user.full_name || null,
    bio: user.biography || null,
    followers: user.edge_followed_by?.count ?? null,
    following_count: user.edge_follow?.count ?? null,
    post_count: user.edge_owner_to_timeline_media?.count ?? null,
    is_private: !!user.is_private,
    is_verified: !!user.is_verified,
    external_url: user.external_url || null,
    profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || null,
  };

  const rawPosts = user.edge_owner_to_timeline_media?.edges || [];
  const posts = rawPosts.slice(0, 12).map((edge: any) => {
    const node = edge.node || {};
    const captionEdges = node.edge_media_to_caption?.edges || [];
    const caption = captionEdges.length > 0 ? captionEdges[0].node?.text : '';
    
    return {
      shortcode: node.shortcode || '',
      caption: caption || '',
      likes_count: node.edge_media_preview_like?.count || node.edge_liked_by?.count || 0,
      comments_count: node.edge_media_to_comment?.count || 0,
      media_type: node.__typename || 'GraphImage',
      thumbnail_url: node.thumbnail_src || node.display_url || '',
      timestamp: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : null,
    };
  }).filter((p: any) => p.shortcode !== '');

  return { profile, posts };
}

/**
 * Method 2 (Fallback): Fetch LSD and UserID from HTML and query GraphQL
 */
async function getProfileWithGraphQLFallback(username: string, proxyUrl?: string): Promise<{ profile: InstagramProfile; posts: any[] }> {
  console.log(`[Scraper] Attempting fallback GraphQL method for "${username}"...`);
  
  // 1. Get HTML to extract LSD and UserID
  const htmlResponse = await gotScraping({
    url: `https://www.instagram.com/${username}/`,
    proxyUrl,
  });

  const html = htmlResponse.body;
  const $ = cheerio.load(html);
  const scriptContent = $('script#__eqmc').html() || '';
  let lsd = '';
  
  if (scriptContent) {
    try {
      const json = JSON.parse(scriptContent);
      lsd = json?.l || '';
    } catch (e) {
      console.warn('[Scraper] Failed to parse script#__eqmc JSON');
    }
  }

  const props = getProps(html);
  const userId = props?.id;

  if (!userId) {
    throw new Error('Failed to extract UserID from profile page');
  }

  // 2. POST to GraphQL
  console.log(`[Scraper] GraphQL query for userId: ${userId} with lsd: ${lsd}`);
  const gqlResponse = await gotScraping({
    url: 'https://www.instagram.com/api/graphql',
    method: 'POST',
    proxyUrl,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-asbd-id': '129477',
      'x-fb-lsd': lsd,
      'x-ig-app-id': '936619743392459',
      'Referer': `https://www.instagram.com/${username}/`,
    },
    body: `lsd=${lsd}&variables=%7B%22id%22%3A%22${userId}%22%2C%22render_surface%22%3A%22PROFILE%22%7D&doc_id=7537483089632862`,
  });

  const gqlData = JSON.parse(gqlResponse.body) as any;
  const user = gqlData?.data?.user;

  if (!user) {
    throw new Error('GraphQL user data not found');
  }

  const profile: InstagramProfile = {
    username: user.username,
    full_name: user.full_name || null,
    bio: user.biography || null,
    followers: user.edge_followed_by?.count ?? null,
    following_count: user.edge_follow?.count ?? null,
    post_count: user.edge_owner_to_timeline_media?.count ?? null,
    is_private: !!user.is_private,
    is_verified: !!user.is_verified,
    external_url: user.external_url || null,
    profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || null,
  };

  const rawPosts = user.edge_owner_to_timeline_media?.edges || [];
  const posts = rawPosts.slice(0, 12).map((edge: any) => {
    const node = edge.node || {};
    const captionEdges = node.edge_media_to_caption?.edges || [];
    const caption = captionEdges.length > 0 ? captionEdges[0].node?.text : '';
    
    return {
      shortcode: node.shortcode || '',
      caption: caption || '',
      likes_count: node.edge_media_preview_like?.count || node.edge_liked_by?.count || 0,
      comments_count: node.edge_media_to_comment?.count || 0,
      media_type: node.__typename || 'GraphImage',
      thumbnail_url: node.thumbnail_src || node.display_url || '',
      timestamp: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : null,
    };
  }).filter((p: any) => p.shortcode !== '');

  return { profile, posts };
}

/**
 * Scrapes a single Instagram profile using ScrapOps residential proxy
 */
export async function scrapeInstagramProfile(username: string): Promise<{ profile: InstagramProfile; posts: any[] }> {
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
  if (!cleanUsername) {
    throw new Error('Username cannot be empty');
  }

  const proxyUrl = getScrapOpsProxyUrl();
  let lastError: Error | null = null;

  // Try Method 1 (web_profile_info)
  try {
    return await getProfileWithHandle(cleanUsername, proxyUrl);
  } catch (error: any) {
    console.warn(`[Scraper] Method 1 failed for "${cleanUsername}": ${error.message}`);
    lastError = error;
  }

  // Delay slightly before fallback
  await delay(1000);

  // Try Method 2 (GraphQL fallback)
  try {
    return await getProfileWithGraphQLFallback(cleanUsername, proxyUrl);
  } catch (error: any) {
    console.error(`[Scraper] Fallback Method 2 failed for "${cleanUsername}": ${error.message}`);
    lastError = error;
  }

  throw new Error(`Failed to scrape profile "${cleanUsername}": ${lastError?.message || 'Unknown error'}`);
}
