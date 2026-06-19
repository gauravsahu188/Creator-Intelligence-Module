'use client';

import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';
import {
  BadgeCheck, Heart, MessageCircle, Share2, Bookmark,
  Activity, ExternalLink, Hash, TrendingUp, Download,
} from 'lucide-react';

// ── Palette ─────────────────────────────────────────────────────────────────
const PALETTE = {
  blue:   '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink:   '#ec4899',
  rose:   '#f43f5e',
  teal:   '#14b8a6',
  green:  '#10b981',
  amber:  '#f59e0b',
  red:    '#ef4444',
  slate:  '#94a3b8',
};

// ── Number formatters ────────────────────────────────────────────────────────
function fmt(n: number | null | undefined): string {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function fmtRate(r: number | string | null | undefined): string {
  return Number(r).toFixed(2) + '%';
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e8f0',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 4px 12px rgba(0,0,0,.08)',
      fontSize: 12,
    }}>
      {label && <p style={{ color: '#8a94a6', marginBottom: 4, fontWeight: 600 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#0f1117', fontWeight: 600, margin: 0 }}>
          {p.name}:{' '}
          <span style={{ color: '#0f1117' }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, accent = '#3b82f6' }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card animate-fade-up" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `${accent}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
        <span className="section-label">{label}</span>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 800, color: '#0f1117',
        fontFamily: 'var(--font-display)', lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#8a94a6', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, badge }: {
  title: string;
  subtitle?: string;
  badge?: { text: string; style: string };
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h3 style={{
          margin: 0, fontSize: 16, fontWeight: 700,
          color: '#0f1117', fontFamily: 'var(--font-display)',
        }}>{title}</h3>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8a94a6' }}>{subtitle}</p>}
      </div>
      {badge && <span className={`badge ${badge.style}`}>{badge.text}</span>}
    </div>
  );
}

// ── Post gradient placeholder colors ────────────────────────────────────────
const POST_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fda085,#f6d365)',
  'linear-gradient(135deg,#89f7fe,#66a6ff)',
  'linear-gradient(135deg,#fddb92,#d1fdff)',
  'linear-gradient(135deg,#96fbc4,#f9f586)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
];

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ data }: { data: any }) {
  if (!data || !data.profile) {
    return (
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '60px 24px',
        textAlign: 'center',
      }}>
        <div className="card" style={{ padding: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            No Data Available
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
            We couldn&apos;t retrieve the profile data. Please try another username.
          </p>
        </div>
      </div>
    );
  }

  const { profile, posts = [], commentsAggregation = {} } = data;

  // Derived metrics
  const totalLikes = posts.reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
  const totalComments = posts.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
  const avgShares = posts.reduce((s: number, p: any) => s + (p.shares_count || 0), 0);
  const avgSaves = posts.reduce((s: number, p: any) => s + (p.saves_count || 0), 0);

  // Demographics donut
  const demoData = [
    { name: 'Female', value: Number(profile.female_pct) || 0 },
    { name: 'Male',   value: Number(profile.male_pct)   || 0 },
    { name: 'N/A',    value: Number(profile.undisclosed_pct) || 0 },
  ].filter(d => d.value > 0);
  const demoPaletteArr = [PALETTE.pink, PALETTE.blue, PALETTE.slate];

  // Safety bars
  const totalAuth = (commentsAggregation.genuine || 0) + (commentsAggregation.spam || 0);
  const genuinePct = totalAuth > 0 ? Math.round((commentsAggregation.genuine / totalAuth) * 100) : 0;
  const totalBot = (commentsAggregation.human || 0) + (commentsAggregation.uncertain || 0) + (commentsAggregation.likelyBot || 0);
  const humanPct = totalBot > 0 ? Math.round((commentsAggregation.human / totalBot) * 100) : 0;
  const uncertainPct = totalBot > 0 ? Math.round(((commentsAggregation.uncertain || 0) / totalBot) * 100) : 0;
  const botPct = 100 - humanPct - uncertainPct;

  // Relevance
  const totalRel = (commentsAggregation.onTopic || 0) + (commentsAggregation.offTopic || 0);
  const onTopicPct = totalRel > 0 ? Math.round((commentsAggregation.onTopic / totalRel) * 100) : 0;
  const offTopicPct = totalRel > 0 ? Math.round((commentsAggregation.offTopic / totalRel) * 100) : 0;

  // Language mix donut
  const langData: { name: string; value: number }[] = Object.entries(
    commentsAggregation.languages || {}
  ).map(([name, value]) => ({ name, value: value as number }));
  const langColors = [PALETTE.blue, PALETTE.purple, PALETTE.pink, PALETTE.teal, PALETTE.amber, PALETTE.slate];

  // Sentiment donut
  const sentData = [
    { name: 'Positive', value: commentsAggregation.positive || 0 },
    { name: 'Neutral',  value: commentsAggregation.neutral  || 0 },
    { name: 'Negative', value: commentsAggregation.negative || 0 },
  ].filter(d => d.value > 0);
  const sentColors = [PALETTE.green, PALETTE.amber, PALETTE.red];

  // Comment types bar
  const commentTypesData = Object.entries(commentsAggregation.commentTypes || {}).map(([name, value]) => ({
    name, value: value as number,
  }));
  const commentTypeColors: Record<string, string> = {
    Praise: PALETTE.green,
    Question: PALETTE.blue,
    Criticism: PALETTE.red,
    'Tag-a-friend': PALETTE.purple,
    'Sales-or-promo': PALETTE.rose,
    Other: PALETTE.slate,
  };

  // Engagement trend — DB returns newest-first (DESC), so P1 = newest post = matches post grid card #1
  // We map the names first, then reverse the array so the chart displays oldest to newest (left to right).
  // E.g., for 12 posts, the chart starts at P12 and ends at P1.
  const trendData = posts.map((p: any, i: number) => ({
    name: `P${i + 1}`,
    Likes: p.likes_count || 0,
    Comments: p.comments_count || 0,
  })).reverse();
  const yFmtLikes    = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);
  const yFmtComments = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);

  // Political mentions
  const politicalMentions: Record<string, any> = commentsAggregation.politicalMentions || {};
  const hasPolitical = Object.keys(politicalMentions).length > 0;
  const partyColors: Record<string, string> = {
    BJP: '#f97316', INC: '#16a34a',
  };

  // Hashtags
  const hashtags: string[] = commentsAggregation.topHashtags || profile.top_hashtags || [];

  // Collab post
  const collabPost = posts.find((p: any) => p.is_collab);

  const downloadCSV = () => {
    // Generate CSV content
    const headers = ['Post URL', 'Publish Date', 'Caption', 'Likes', 'Comments', 'Shares', 'Saves', 'Is Collab', 'Engagement Rate (%)'];
    const rows = posts.map((post: any) => {
      const postUrl = `https://instagram.com/p/${post.shortcode}`;
      const date = post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'N/A';
      
      // Escape double quotes in caption
      const caption = post.caption ? post.caption.replace(/"/g, '""') : '';
      
      const likes = post.likes_count || 0;
      const comments = post.comments_count || 0;
      const shares = post.shares_count || 0;
      const saves = post.saves_count || 0;
      const isCollab = post.is_collab ? 'Yes' : 'No';
      const postER = profile.followers && profile.followers > 0
        ? (((likes + comments) / profile.followers) * 100).toFixed(4)
        : '0.0000';

      return [
        `"${postUrl}"`,
        `"${date}"`,
        `"${caption}"`,
        likes,
        comments,
        shares,
        saves,
        `"${isCollab}"`,
        postER
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    
    // Generate filename with current local date YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dateVal}`;
    const filename = `${dateStr}_Analytics.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 60px' }}>

      {/* ── Creator Profile Card ── */}
      <div className="card animate-fade-in" style={{ padding: '28px 32px', marginBottom: 20, display: 'flex', gap: 28, flexWrap: 'wrap' as const }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            border: '3px solid var(--surface-border)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
              color: '#fff',
            }}>
              {(profile.username || 'U')[0].toUpperCase()}
            </div>
            {profile.profile_pic_url && (
              <img
                src={`/api/proxy-image?url=${encodeURIComponent(profile.profile_pic_url)}`}
                alt={profile.username}
                style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          {profile.is_verified && (
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 22, height: 22, borderRadius: '50%',
              background: PALETTE.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>
              <BadgeCheck size={12} color="#fff" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const, marginBottom: 4 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              color: 'var(--text-primary)', margin: 0,
            }}>
              {profile.full_name || profile.username}
            </h2>
            {profile.interest_cohort && (
              <span className="badge badge-purple">{profile.interest_cohort}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <a
              href={`https://instagram.com/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13, color: PALETTE.indigo, fontWeight: 500 }}
            >
              @{profile.username}
            </a>
            {profile.profile_pic_url && (
              <a
                href={profile.profile_pic_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-border)', padding: '2px 6px', borderRadius: 4 }}
                title="View Profile Picture HD"
              >
                <ExternalLink size={10} /> Profile Pic HD
              </a>
            )}
          </div>
          {profile.bio && (
            <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.5, marginBottom: 12, maxWidth: 480 }}>
              {profile.bio}
            </p>
          )}

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' as const }}>
            {[
              { label: 'FOLLOWERS',   value: fmt(profile.followers) },
              { label: 'FOLLOWING',   value: fmt(profile.following_count) },
              { label: 'POSTS',       value: fmt(profile.post_count) },
              { label: 'ENG. RATE',   value: fmtRate(profile.engagementRate), highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label}>
                <div style={{
                  fontSize: 20, fontWeight: 800,
                  color: highlight ? PALETTE.blue : 'var(--text-primary)',
                  fontFamily: 'var(--font-display)', lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                  textTransform: 'uppercase' as const, color: 'var(--text-tertiary)',
                  marginTop: 3,
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Collab Post Callout ── */}
      {collabPost && (
        <div className="animate-fade-up" style={{
          background: 'linear-gradient(135deg, #fdf2f8, #eff6ff)',
          border: '1px solid #fbcfe8',
          borderRadius: 20, padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          flexWrap: 'wrap' as const, marginBottom: 20,
        }}>
          <span className="collab-badge">
            <Activity size={9} />
            COLLAB
          </span>
          <span style={{ flex: 1, fontSize: 13, color: '#4a5568', minWidth: 100 }}>
            {collabPost.caption?.substring(0, 100) || 'Collaboration post'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#8a94a6', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Heart size={12} /> {fmt(collabPost.likes_count)}
            </span>
            <span style={{ fontSize: 12, color: '#8a94a6', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageCircle size={12} /> {fmt(collabPost.comments_count)}
            </span>
            <a
              href={`https://instagram.com/p/${collabPost.shortcode}`}
              target="_blank"
              rel="noreferrer"
              className="badge badge-pink"
            >
              View post
            </a>
          </div>
        </div>
      )}

      {/* ── Metric Cards Grid ── */}
      <div className="stagger" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <MetricCard icon={Heart}         label="Avg. Likes"      value={fmt(Math.round(totalLikes / Math.max(posts.length, 1)))}     sub="per post"             accent={PALETTE.rose}   />
        <MetricCard icon={MessageCircle} label="Avg. Comments"   value={fmt(Math.round(totalComments / Math.max(posts.length, 1)))}  sub="per post"             accent={PALETTE.blue}   />
        <MetricCard icon={Share2}        label="Avg. Shares"     value={fmt(Math.round(avgShares / Math.max(posts.length, 1)))}      sub="per post"             accent={PALETTE.purple} />
        <MetricCard icon={Bookmark}      label="Avg. Saves"      value={fmt(Math.round(avgSaves / Math.max(posts.length, 1)))}       sub="per post"             accent={PALETTE.teal}   />
        <MetricCard icon={Activity}      label="Engagement Rate" value={fmtRate(profile.engagementRate)}                              sub="likes + comments / followers" accent={PALETTE.blue}   />
      </div>

      {/* ── Charts Row 1: Demographics + Comment Safety + Relevance ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Demographics Card */}
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader
            title="Audience Demographics"
            subtitle="Estimated gender split from follower analysis"
            badge={{ text: 'AI Estimated', style: 'badge-purple' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 170, height: 170, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoData.length ? demoData : [{ name: 'N/A', value: 1 }]}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(demoData.length ? demoData : [{ name: 'N/A', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={demoPaletteArr[i % demoPaletteArr.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { name: 'Female', pct: Number(profile.female_pct) || 0, color: PALETTE.pink },
                { name: 'Male',   pct: Number(profile.male_pct) || 0,   color: PALETTE.blue },
                { name: 'N/A',    pct: Number(profile.undisclosed_pct) || 0, color: PALETTE.slate },
              ].map(({ name, pct, color }) => (
                <div key={name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 4 }}>
                    <div style={{ height: '100%', borderRadius: 999, background: color, width: `${pct}%`, transition: 'width .5s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Safety Card */}
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader
            title="Comment Safety"
            subtitle="Authenticity and bot likelihood of audience comments"
          />

          {/* Authenticity bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Authenticity</span>
            </div>
            <div style={{
              height: 24, borderRadius: 8, overflow: 'hidden',
              display: 'flex', background: '#fee2e2',
            }}>
              <div style={{ width: `${genuinePct}%`, background: PALETTE.green, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>Genuine: {commentsAggregation.genuine || 0}</span>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>Spam: {commentsAggregation.spam || 0}</span>
            </div>
          </div>

          {/* Bot Likelihood bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Bot Likelihood</span>
            </div>
            <div style={{ height: 24, borderRadius: 8, overflow: 'hidden', display: 'flex', background: '#f1f5f9' }}>
              <div style={{ width: `${humanPct}%`, background: PALETTE.green, transition: 'width .5s' }} />
              <div style={{ width: `${uncertainPct}%`, background: PALETTE.amber, transition: 'width .5s' }} />
              <div style={{ width: `${Math.max(0, botPct)}%`, background: PALETTE.red, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>Human: {commentsAggregation.human || 0}</span>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>Uncertain: {commentsAggregation.uncertain || 0}</span>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>Bot: {commentsAggregation.likelyBot || 0}</span>
            </div>
          </div>
        </div>

        {/* Relevance Card */}
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader
            title="Topic Relevance"
            subtitle="Are comments on-topic to the post/brand?"
          />
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>On-Topic vs Off-Topic</span>
            </div>
            <div style={{
              height: 24, borderRadius: 8, overflow: 'hidden',
              display: 'flex', background: '#f1f5f9',
            }}>
              <div style={{ width: `${onTopicPct}%`, background: PALETTE.teal, transition: 'width .5s' }} />
              <div style={{ width: `${offTopicPct}%`, background: PALETTE.slate, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>On-topic: {commentsAggregation.onTopic || 0}</span>
              <span style={{ fontSize: 11, color: '#8a94a6' }}>Off-topic: {commentsAggregation.offTopic || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Charts Row 2: Language + Sentiment + Comment Types ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Language Mix */}
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader title="Language Mix" subtitle="Comment language distribution" />
          {langData.length > 0 ? (
            <>
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={langData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                      {langData.map((_, i) => (
                        <Cell key={i} fill={langColors[i % langColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {langData.slice(0, 5).map(({ name, value }, i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColors[i % langColors.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {name}: <strong>{value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No language data</span>
            </div>
          )}
        </div>

        {/* Audience Sentiment */}
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader title="Audience Sentiment" subtitle="Overall tone from comment analysis" />
          {sentData.length > 0 ? (
            <>
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                      {sentData.map((_, i) => (
                        <Cell key={i} fill={sentColors[i % sentColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {sentData.map(({ name, value }, i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: sentColors[i % sentColors.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {name}: <strong>{value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No sentiment data</span>
            </div>
          )}
        </div>

        {/* Comment Types */}
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader title="Comment Types" subtitle="Categorized comment intent" />
          {commentTypesData.length > 0 ? (
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commentTypesData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#8a94a6' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#8a94a6' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {commentTypesData.map(({ name }, i) => (
                      <Cell key={i} fill={commentTypeColors[name] || PALETTE.slate} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No type data</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Engagement Trend (Full Width) ── */}
      {trendData.length > 0 && (
        <div className="card animate-fade-up" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <SectionHeader
            title="Engagement Trend"
            subtitle="Likes & comments per post — P1 matches the first post in the grid below"
            badge={{ text: `${trendData.length} posts`, style: 'badge-blue' }}
          />
          <div style={{ height: 260, overflowX: 'auto' }}>
            {/* min-width ensures all post labels are legible even with many posts */}
            <div style={{ minWidth: Math.max(600, trendData.length * 58), height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#8a94a6' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  {/* Left axis: Likes */}
                  <YAxis
                    yAxisId="likes"
                    orientation="left"
                    tickFormatter={yFmtLikes}
                    tick={{ fontSize: 11, fill: PALETTE.rose }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  {/* Right axis: Comments — independent scale so the line is never flat */}
                  <YAxis
                    yAxisId="comments"
                    orientation="right"
                    tickFormatter={yFmtComments}
                    tick={{ fontSize: 11, fill: PALETTE.blue }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="likes"    type="monotone" dataKey="Likes"    stroke={PALETTE.rose} strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.rose, strokeWidth: 0 }}    activeDot={{ r: 6 }} />
                  <Line yAxisId="comments" type="monotone" dataKey="Comments" stroke={PALETTE.blue} strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.blue, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Manual legend */}
          <div style={{ display: 'flex', gap: 24, marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
            {[
              { label: 'Likes (left axis)',    color: PALETTE.rose },
              { label: 'Comments (right axis)', color: PALETTE.blue },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 3, borderRadius: 999, background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Political Mentions (conditional) ── */}
      {hasPolitical && (
        <div className="card animate-fade-up" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <SectionHeader title="Political Mentions" subtitle="Detected party mentions and associated sentiment" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(politicalMentions).map(([party, info]: [string, any]) => (
              <div key={party} className="stat-chip" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: partyColors[party] || PALETTE.purple,
                  color: '#fff', borderRadius: 999,
                  padding: '2px 8px', fontSize: 11, fontWeight: 700,
                }}>{party}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{info.sentiment}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{info.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Hashtags (conditional) ── */}
      {hashtags.length > 0 && (
        <div className="card animate-fade-up" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <SectionHeader title="Top Hashtags" subtitle="Most frequently used by this creator" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hashtags.map((tag: string) => (
              <span key={tag} className="hashtag-pill">
                <Hash size={10} style={{ display: 'inline', marginRight: 2 }} />
                {tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Post Grid ── */}
      {posts.length > 0 && (
        <div className="card animate-fade-up" style={{ padding: '24px 28px' }}>
          <SectionHeader
            title="Recent Posts"
            subtitle={`Last ${posts.length} posts analyzed`}
            badge={{ text: `${posts.length} posts`, style: 'badge-gray' }}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14,
          }}>
            {posts.map((post: any, i: number) => (
              <div key={post.id || i} className="card card-lift" style={{ overflow: 'hidden' }}>
                {/* Thumbnail */}
                <div style={{ height: 130, position: 'relative', overflow: 'hidden', background: POST_GRADIENTS[i % POST_GRADIENTS.length] }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,.7)',
                  }}>
                    #{i + 1}
                  </div>
                  {post.thumbnail_url && (
                    <img
                      src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnail_url)}`}
                      alt={post.caption?.substring(0, 50) || `Post ${i + 1}`}
                      referrerPolicy="no-referrer"
                      loading={i > 3 ? 'lazy' : 'eager'}
                      style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Collab badge overlay */}
                  {post.is_collab && (
                    <span className="collab-badge" style={{ position: 'absolute', top: 8, left: 8 }}>
                      <Activity size={8} />
                      COLLAB
                    </span>
                  )}

                  {/* External link */}
                  {post.shortcode && (
                    <a
                      href={`https://instagram.com/p/${post.shortcode}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(255,255,255,.85)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)',
                      }}
                      aria-label="View on Instagram"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '12px 14px' }}>
                  {post.caption && (
                    <p style={{
                      fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4,
                      margin: '0 0 10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {post.caption}
                    </p>
                  )}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                  }}>
                    {[
                      { icon: Heart,         value: post.likes_count,    color: PALETTE.rose,   label: '' },
                      { icon: MessageCircle, value: post.comments_count, color: PALETTE.blue,   label: '' },
                      { icon: Share2,        value: post.shares_count,   color: PALETTE.purple, label: '' },
                      { icon: Bookmark,      value: post.saves_count,    color: PALETTE.teal,   label: '' },
                    ].map(({ icon: Icon, value, color }, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                      }}>
                        <Icon size={11} style={{ color }} />
                        {fmt(value || 0)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabular Analytics Report Section ── */}
      {posts.length > 0 && (
        <div className="card animate-fade-up" style={{ padding: '24px 28px', marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              }}>Database Analytics Report</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Tabular report of recent post performance metrics extracted from the database.
              </p>
            </div>
            <button
              onClick={downloadCSV}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: '2.3rem', padding: '0 1rem', fontSize: '0.85rem' }}
              id="download-analytics-csv"
            >
              <Download size={14} /> Download CSV
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Post</th>
                  <th>Publish Date</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Shares</th>
                  <th>Saves</th>
                  <th>Collab</th>
                  <th>Engagement Rate</th>
                  <th>Caption</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post: any, i: number) => {
                  const postER = profile.followers && profile.followers > 0
                    ? (((post.likes_count || 0) + (post.comments_count || 0)) / profile.followers * 100).toFixed(3) + '%'
                    : '0.000%';

                  return (
                    <tr key={post.id || i}>
                      <td>
                        {post.shortcode ? (
                          <a
                            href={`https://instagram.com/p/${post.shortcode}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontWeight: 700,
                              color: PALETTE.blue,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            #{i + 1}
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          `#${i + 1}`
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 600, color: PALETTE.rose }}>
                        {post.likes_count ? post.likes_count.toLocaleString() : 0}
                      </td>
                      <td style={{ fontWeight: 600, color: PALETTE.blue }}>
                        {post.comments_count ? post.comments_count.toLocaleString() : 0}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {post.shares_count ? post.shares_count.toLocaleString() : 0}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {post.saves_count ? post.saves_count.toLocaleString() : 0}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: post.is_collab ? 'rgba(236, 72, 153, 0.08)' : 'rgba(148, 163, 184, 0.08)',
                          color: post.is_collab ? PALETTE.pink : PALETTE.slate,
                        }}>
                          {post.is_collab ? 'Collab' : 'Regular'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {postER}
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--text-muted)',
                          fontSize: '12px'
                        }} title={post.caption || ''}>
                          {post.caption || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
