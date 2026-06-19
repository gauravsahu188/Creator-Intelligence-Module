import React from 'react';
import { BadgeCheck, Users, Activity } from 'lucide-react';

export default function ProfileHeader({ profile }: { profile: any }) {
  return (
    <div className="glass-panel p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_20px_rgba(217,70,239,0.3)] shrink-0">
        <img 
          src={profile.profile_pic_url ? `/api/proxy-image?url=${encodeURIComponent(profile.profile_pic_url)}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="%23d946ef" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/></svg>'} 
          alt={profile.username}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="%23d946ef" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/></svg>';
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <h2 className="text-2xl font-bold">@{profile.username}</h2>
          {profile.is_verified && <BadgeCheck className="text-accent" size={20} />}
        </div>
        <h3 className="text-lg text-text-muted mb-4">{profile.full_name}</h3>
        
        <p className="text-sm mb-4 line-clamp-3 max-w-2xl">
          {profile.bio}
        </p>

        {profile.external_url && (
          <a href={profile.external_url} target="_blank" rel="noreferrer" className="text-accent text-sm hover:underline block mb-4">
            {profile.external_url}
          </a>
        )}

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
          <div className="flex items-center gap-2">
            <Users className="text-primary" size={18} />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Followers</p>
              <p className="font-semibold">{profile.followers?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="text-secondary" size={18} />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Engagement Rate</p>
              <p className="font-semibold text-success">{profile.engagementRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
