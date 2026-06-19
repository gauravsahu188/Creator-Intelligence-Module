import ResultsTable from '@/components/ResultsTable';
import StatsCard from '@/components/StatsCard';

export default function ResultsPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Scraped Profiles Database</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Explore all historically scraped profiles, perform searches, filter, and download the data.
        </p>
      </div>

      {/* Database Quick Stats */}
      <StatsCard />

      {/* Interactive Table with Pagination / Search / Export */}
      <ResultsTable />
      
    </div>
  );
}
