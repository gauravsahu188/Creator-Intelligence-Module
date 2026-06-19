const apifyToken = process.env.APIFY_API_TOKEN;

export async function fetchCommentsForPosts(postUrls: string[], maxCommentsPerPost: number = 30) {
  if (postUrls.length === 0) return [];
  if (!apifyToken) {
    console.error("[Apify Scraper] APIFY_API_TOKEN is missing.");
    return [];
  }

  console.log(`[Apify Scraper] Triggering comment scraper for ${postUrls.length} posts...`);

  try {
    const runResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-comment-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        directUrls: postUrls,
        resultsLimit: maxCommentsPerPost
      })
    });

    if (!runResponse.ok) {
      const errText = await runResponse.text();
      console.error(`[Apify Scraper] Failed to run actor: ${runResponse.statusText} - ${errText}`);
      return [];
    }

    const items = await runResponse.json();
    console.log(`[Apify Scraper] Successfully fetched ${items.length} comments from Apify.`);

    return items.map((c: any) => ({
      postUrl: c.postUrl,
      text: c.text,
      username: c.ownerUsername || c.ownerProfileName || 'anonymous'
    }));

  } catch (error: any) {
    console.error(`[Apify Scraper] Error calling Apify API:`, error.message);
    return [];
  }
}
