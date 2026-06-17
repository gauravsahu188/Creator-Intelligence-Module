export interface InstagramProfile {
  id?: number;
  username: string;
  full_name: string | null;
  bio: string | null;
  followers: number | null;
  is_private: boolean | null;
  profile_pic_url?: string | null;
  scraped_at?: string;
}

export interface ScrapeResult {
  success: boolean;
  username: string;
  data?: InstagramProfile;
  error?: string;
}

export interface BulkScrapeResponse {
  total: number;
  success: number;
  failed: number;
  results: ScrapeResult[];
}

export interface PaginatedResults {
  profiles: InstagramProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ParsedBulkFile {
  usernames: string[];
  errors: string[];
}
