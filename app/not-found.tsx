'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
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
        maxWidth: '480px',
        width: '100%',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        animation: 'fadeUp 0.5s ease forwards'
      }}>
        <div style={{
          background: 'var(--brand-50)',
          border: '1px solid var(--brand-100)',
          color: 'var(--brand-600)',
          padding: '1.25rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Compass size={40} className="animate-spin-slow" />
        </div>

        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            color: 'var(--text-primary)'
          }}>
            404
          </h1>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: '0 0 1rem 0',
            color: 'var(--text-secondary)'
          }}>
            Page Not Found
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-tertiary)',
            margin: 0,
            lineHeight: 1.5
          }}>
            The page you are looking for does not exist or has been moved to another location.
          </p>
        </div>

        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          Return Dashboard
        </Link>
      </div>
    </div>
  );
}
