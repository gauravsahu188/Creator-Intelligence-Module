import React from 'react';
import { Heart, MessageCircle, Image as ImageIcon, Video, Grid as GridIcon } from 'lucide-react';

export default function RecentPostsGrid({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="glass-panel p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-text-muted">
          <GridIcon size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Posts Found</h3>
        <p className="text-text-muted text-sm">This profile has no public posts available for analysis.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-6">
        <GridIcon className="text-primary" size={20} />
        <h3 className="text-lg font-semibold">Recent Posts ({posts.length})</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post, i) => (
          <a 
            key={post.id || i} 
            href={`https://instagram.com/p/${post.shortcode}`} 
            target="_blank" 
            rel="noreferrer"
            aria-label="View Instagram Post"
            className="group block relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {/* Background Image / Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:scale-110 transition-transform duration-500">
              {post.media_type === 'GraphVideo' ? <Video size={48} /> : <ImageIcon size={48} />}
            </div>
            {post.thumbnail_url && (
              <img 
                src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnail_url)}`} 
                alt={post.caption?.substring(0, 50) || 'Instagram post'} 
                referrerPolicy="no-referrer"
                loading={i > 3 ? "lazy" : "eager"}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            
            {/* Top-right Video Icon if applicable */}
            {post.media_type === 'GraphVideo' && post.thumbnail_url && (
              <div className="absolute top-2 right-2 text-white drop-shadow-md">
                <Video size={20} />
              </div>
            )}
            
            {/* Overlay stats */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Heart size={18} className="fill-current" />
                <span>{post.likes_count?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <MessageCircle size={18} className="fill-current" />
                <span>{post.comments_count?.toLocaleString() || 0}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
