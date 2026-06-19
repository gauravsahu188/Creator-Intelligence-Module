export interface InstagramProfile {
  id?: number;
  username: string;
  full_name: string | null;
  bio: string | null;
  followers: number | null;
  following_count?: number | null;
  post_count?: number | null;
  is_verified?: boolean | null;
  is_private: boolean | null;
  profile_pic_url?: string | null;
  external_url?: string | null;
  female_pct?: number | null;
  male_pct?: number | null;
  undisclosed_pct?: number | null;
  interest_cohort?: string | null;
  scraped_at?: string;
  updated_at?: string;
}

export interface InstagramPost {
  id?: number;
  profile_id?: number;
  shortcode: string;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  media_type?: string | null;
  timestamp?: string | null;
  comments?: InstagramComment[];
}

export interface InstagramComment {
  id?: number;
  post_id?: number;
  username: string;
  raw_text: string;
  authenticity?: string | null;
  bot_likelihood?: string | null;
  political_stance?: string | null;
  political_party?: string | null;
  relevance?: string | null;
  comment_type?: string | null;
  language?: string | null;
}

export interface Job {
  id?: number;
  username: string;
  status: 'Scraping' | 'Processing_ML' | 'Completed' | 'Failed';
  apify_run_id?: string | null;
  total_chunks?: number;
  processed_chunks?: number;
  created_at?: string;
  updated_at?: string;
}
export interface ScrapeResult {
  success: boolean;
  username: string;
  data?: InstagramProfile;
  error?: string;
}


export interface PaginatedResults {
  profiles: InstagramProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

