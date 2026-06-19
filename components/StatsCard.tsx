'use client';

import { useEffect, useState } from 'react';
import { Database, Shield, Users, HelpCircle } from 'lucide-react';

interface Stats {
  total: number;
  privateCount: number;
  publicCount: number;
  avgFollowers: number;
}

export default function StatsCard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    privateCount: 0,
    publicCount: 0,
    avgFollowers: 0
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 10 seconds for real-time bulk updates reflection
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const statsItems = [
    {
      label: 'Database Records',
      value: stats.total.toLocaleString(),
      icon: Database,
      color: 'var(--primary)',
      desc: 'Total Instagram accounts scraped'
    },
    {
      label: 'Average Followers',
      value: stats.avgFollowers.toLocaleString(),
      icon: Users,
      color: 'var(--accent)',
      desc: 'Mean reach of scraped profiles'
    },
    {
      label: 'Privacy Split',
      value: `${stats.privateCount} / ${stats.publicCount}`,
      icon: Shield,
      color: 'var(--success)',
      desc: 'Private vs Public accounts'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.25rem',
      width: '100%',
      marginBottom: '2rem'
    }}>
      {statsItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              background: `rgba(255, 255, 255, 0.03)`,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              color: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={24} />
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </span>
              <h3 style={{ fontSize: '1.6rem', margin: '0.1rem 0 0.25rem 0', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {item.value}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                {item.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
