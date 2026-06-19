'use client';

import { useEffect, useState } from 'react';
import { Search, ArrowUpDown, Download, ChevronLeft, ChevronRight, Loader2, Lock, Globe } from 'lucide-react';
import { InstagramProfile } from '@/types/instagram';

export default function ResultsTable() {
  const [profiles, setProfiles] = useState<InstagramProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState('scraped_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Debounce search input to prevent API overloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [search]);

  // Force quick search trigger on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setDebouncedSearch(search);
      setPage(1);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        sortBy,
        sortOrder
      });
      const response = await fetch(`/api/results?${queryParams}`);
      const data = await response.json();
      if (response.ok) {
        setProfiles(data.profiles || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, debouncedSearch, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  const handleDownload = (format: 'csv' | 'json') => {
    const queryParams = new URLSearchParams({
      format,
      search: debouncedSearch
    });
    window.open(`/api/download?${queryParams}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search and Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', maxWidth: '350px', width: '100%' }}>
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search profiles (Press Enter)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              height: '2.5rem',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => handleDownload('csv')} className="btn btn-secondary" style={{ height: '2.5rem', padding: '0 1rem', fontSize: '0.85rem' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => handleDownload('json')} className="btn btn-secondary" style={{ height: '2.5rem', padding: '0 1rem', fontSize: '0.85rem' }}>
            <Download size={15} /> Export JSON
          </button>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading profiles database...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No Instagram profiles found in the database.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('username')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Username <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Full Name</th>
                  <th>Bio</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('followers')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Followers <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Privacy</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('scraped_at')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Scraped At <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '1.5px solid var(--primary)',
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.05)',
                          flexShrink: 0
                        }}>
                          {profile.profile_pic_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/proxy-image?url=${encodeURIComponent(profile.profile_pic_url)}`}
                              alt={profile.username}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="%23d946ef" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/></svg>';
                              }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', margin: 'auto', color: 'var(--primary)', fontWeight: 600 }}>IG</span>
                            </div>
                          )}
                        </div>
                        <a 
                          href={`https://instagram.com/${profile.username}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontWeight: 600, color: 'white' }}
                        >
                          @{profile.username}
                        </a>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{profile.full_name || '-'}</td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                      }} title={profile.bio || ''}>
                        {profile.bio || '-'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      {profile.followers !== null ? profile.followers.toLocaleString() : '-'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: profile.is_private ? 'rgba(217, 70, 239, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        color: profile.is_private ? 'var(--primary)' : 'var(--success)'
                      }}>
                        {profile.is_private ? <Lock size={10} /> : <Globe size={10} />}
                        {profile.is_private ? 'Private' : 'Public'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {profile.scraped_at ? new Date(profile.scraped_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {profiles.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <span>
            Showing page <strong style={{ color: 'white' }}>{page}</strong> of <strong style={{ color: 'white' }}>{totalPages}</strong> ({total} total profiles)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', height: 'auto' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', height: 'auto' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
