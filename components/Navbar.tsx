'use client';

import { Activity, Sparkles, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/lib/AppContext';

export default function Navbar() {
  const { hasResults, onNewAnalysis } = useAppContext();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--surface-border)',
      boxShadow: '0 1px 3px rgba(15,17,23,.04)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Activity size={16} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 16,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}>PRAJA</div>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '.06em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-tertiary)',
              lineHeight: 1.1,
            }}>Creator Intelligence</div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-blue" style={{ fontSize: 11 }}>
            <Sparkles size={10} />
            Gemini 2.5 Flash
          </span>

          {hasResults && (
            <button
              className="btn-ghost"
              onClick={onNewAnalysis}
              id="new-analysis-btn"
            >
              <RefreshCw size={13} />
              New analysis
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
