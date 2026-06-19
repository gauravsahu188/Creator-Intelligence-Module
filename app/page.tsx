'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/AppContext';
import HeroSearch from '@/components/HeroSearch';
import ProgressCard from '@/components/ProgressCard';
import Dashboard from '@/components/Dashboard';

type AppState = 'hero' | 'loading' | 'progress' | 'dashboard';

export default function Home() {
  const { setHasResults, setOnNewAnalysis } = useAppContext();

  const [appState, setAppState] = useState<AppState>('hero');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleNewAnalysis = () => {
    setAppState('hero');
    setJobId(null);
    setDashboardData(null);
    setError('');
    setProgress(0);
    setHasResults(false);
  };

  // Register handler with context so Navbar can call it
  useEffect(() => {
    setOnNewAnalysis(handleNewAnalysis);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (username: string) => {
    try {
      setError('');
      setDashboardData(null);
      setProgress(0);
      setAppState('loading');
      setStatusText('Initiating scrape…');

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to start job');

      setJobId(result.jobId);
      setAppState('progress');
      setProgress(15);
      setStatusText('Fetching profile & posts via Apify…');
    } catch (err: any) {
      setError(err.message);
      setAppState('hero');
    }
  };

  // Polling
  useEffect(() => {
    if (!jobId || appState !== 'progress') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Polling failed');

        setStatusText(`Status: ${data.status}`);

        if (data.total_chunks && data.total_chunks > 0) {
          const pct = Math.min(99, Math.round((data.processed_chunks / data.total_chunks) * 100));
          setProgress(pct);
        } else if (data.status === 'Processing_ML') {
          setProgress(25);
          setStatusText('Running Gemini 2.5 Flash analysis…');
        }

        if (data.status === 'Completed') {
          clearInterval(interval);
          setDashboardData(data.data);
          setAppState('dashboard');
          setHasResults(true);
        } else if (data.status === 'Failed') {
          clearInterval(interval);
          setError(data.errorMessage || 'Background job failed. Please try again.');
          setAppState('hero');
        }
      } catch (err: any) {
        clearInterval(interval);
        setError(err.message);
        setAppState('hero');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, appState]);

  return (
    <>
      {/* STATE A — Hero */}
      {(appState === 'hero' || appState === 'loading') && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <HeroSearch
            onSearch={handleSearch}
            loading={appState === 'loading'}
            error={error}
          />
        </div>
      )}

      {/* STATE B — Progress Card */}
      {appState === 'progress' && (
        <ProgressCard progress={progress} statusText={statusText} />
      )}

      {/* STATE C — Dashboard */}
      {appState === 'dashboard' && dashboardData && (
        <Dashboard data={dashboardData} />
      )}
    </>
  );
}
