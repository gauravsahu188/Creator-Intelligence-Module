'use client';

import { useState } from 'react';
import { Zap, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (username: string) => void;
  loading?: boolean;
  error?: string;
}

const FEATURE_CHIPS = [
  'Audience Demographics',
  'Comment Authenticity',
  'Bot Detection',
  'Sentiment Analysis',
  'Language Mix',
  'Engagement Trends',
];

export default function HeroSearch({ onSearch, loading, error }: HeroSearchProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !loading) {
      onSearch(username.trim());
    }
  };

  return (
    <div style={{
      maxWidth: 560,
      margin: '0 auto',
      padding: '80px 0 60px',
      textAlign: 'center',
    }}>
      {/* Top Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <span className="badge badge-blue" style={{ fontSize: 12, padding: '5px 14px' }}>
          <Zap size={11} />
          India&apos;s creator audience intelligence platform
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(32px, 5vw, 52px)',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
        margin: '0 0 18px',
        color: 'var(--text-primary)',
      }}>
        Unmask any{' '}
        <span style={{
          background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          creator&apos;s audience
        </span>
      </h1>

      {/* Sub paragraph */}
      <p style={{
        fontSize: 16,
        color: '#4a5568',
        lineHeight: 1.65,
        margin: '0 0 36px',
      }}>
        Deep-dive into follower demographics, comment quality, and audience sentiment for any public Instagram creator — powered by AI.
      </p>

      {/* Search bar */}
      <form onSubmit={handleSubmit} id="hero-search-form">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface-card)',
          border: '1.5px solid var(--surface-border)',
          borderRadius: 18,
          padding: '6px 6px 6px 16px',
          boxShadow: 'var(--shadow-md)',
          gap: 8,
          transition: 'border-color .2s, box-shadow .2s',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-tertiary)', flexShrink: 0 }}>@</span>
          <input
            id="username-input"
            type="text"
            name="username"
            aria-label="Instagram username"
            autoComplete="off"
            spellCheck={false}
            placeholder="Enter Instagram username…"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--text-primary)',
              padding: '8px 0',
            }}
          />
          <button
            id="search-submit-btn"
            type="submit"
            disabled={!username.trim() || !!loading}
            className="btn-primary"
            style={{ borderRadius: 12, padding: '11px 22px', flexShrink: 0 }}
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin-slow" />
                Analyzing…
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16,
          background: 'var(--danger-bg)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
        }}>
          <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#991b1b', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Feature chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginTop: 28,
      }}>
        {FEATURE_CHIPS.map((chip) => (
          <span
            key={chip}
            className="badge badge-gray"
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            <CheckCircle2 size={10} color="#10b981" />
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
