import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AppProvider } from '@/lib/AppContext';

export const metadata: Metadata = {
  title: 'PRAJA — Creator Intelligence Dashboard',
  description: "India's creator audience intelligence platform. Unmask any Instagram creator's audience demographics, comment authenticity, and engagement trends powered by Apify + Gemini 2.5 Flash.",
  keywords: ['instagram analytics', 'creator intelligence', 'audience demographics', 'PRAJA', 'influencer analytics'],
  authors: [{ name: 'PRAJA' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppProvider>
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <footer style={{
            borderTop: '1px solid var(--surface-border)',
            background: 'var(--surface-card)',
            textAlign: 'center',
            padding: '20px 24px',
            fontSize: 12,
            color: '#8a94a6',
          }}>
            © 2026 PRAJA Creator Intelligence · Built with Apify + Gemini 2.5 Flash + PostgreSQL
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
