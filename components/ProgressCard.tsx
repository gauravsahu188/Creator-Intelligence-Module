'use client';

import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface ProgressCardProps {
  progress: number;
  statusText: string;
}

const STEPS = [
  { label: 'Fetching profile & posts via Apify', threshold: 15 },
  { label: 'Extracting comments dataset', threshold: 30 },
  { label: 'Running Gemini 2.5 Flash analysis', threshold: 60 },
  { label: 'Persisting results to database', threshold: 95 },
];

export default function ProgressCard({ progress, statusText }: ProgressCardProps) {
  return (
    <div style={{
      maxWidth: 480,
      margin: '60px auto',
      padding: '0 24px',
    }}>
      <div className="card animate-fade-up" style={{ padding: 32, overflow: 'hidden' }}>
        {/* Color strip */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
          margin: '-32px -32px 28px',
        }} />

        {/* Spinner icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--brand-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <RefreshCw size={24} color="var(--brand-500)" className="animate-spin-slow" />
          </div>
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 800,
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: '0 0 6px',
        }}>
          Analyzing Profile
        </h2>
        <p style={{
          fontSize: 13,
          color: 'var(--text-tertiary)',
          textAlign: 'center',
          margin: '0 0 24px',
        }}>
          {statusText || 'Initiating…'}
        </p>

        {/* Progress bar */}
        <div className="progress-track" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${Math.max(3, progress)}%` }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Processing data…</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-600)' }}>{progress}%</span>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((step, i) => {
            const done = progress > step.threshold;
            const active = !done && (i === 0 || progress > STEPS[i - 1].threshold);
            return (
              <div key={step.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                {done ? (
                  <span className="step-dot step-dot-done" />
                ) : active ? (
                  <span className="step-dot step-dot-active" />
                ) : (
                  <span className="step-dot step-dot-idle" />
                )}
                <span style={{
                  fontSize: 13,
                  color: done ? 'var(--text-secondary)' : active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400,
                  flex: 1,
                }}>
                  {step.label}
                </span>
                {done && <CheckCircle2 size={14} color="var(--success)" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
