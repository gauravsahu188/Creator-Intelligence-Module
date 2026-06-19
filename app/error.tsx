'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[Application Error Boundary]:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      textAlign: 'center'
    }}>
      <div className="card" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        animation: 'fadeUp 0.5s ease forwards'
      }}>
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid #fecaca',
          color: 'var(--danger)',
          padding: '1.25rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={40} />
        </div>

        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            color: 'var(--text-primary)'
          }}>
            Something went wrong!
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            margin: '0 0 1.25rem 0',
            lineHeight: 1.5
          }}>
            An unexpected error occurred while rendering the page.
          </p>

          <div style={{
            background: 'var(--surface-muted)',
            border: '1.5px solid var(--surface-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: 'var(--danger)',
            wordBreak: 'break-all',
            overflow: 'auto',
            maxHeight: '150px',
            width: '100%'
          }}>
            <strong>Error:</strong> {error.message || 'Unknown runtime error.'}
            {error.digest && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Digest: {error.digest}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => unstable_retry()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={16} /> Try Again
          </button>
          
          <Link
            href="/"
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: 'auto', padding: '12px 24px', borderRadius: 'var(--radius-lg)' }}
          >
            <Home size={16} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
