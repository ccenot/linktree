import React, { useState, useEffect } from 'react';
import './OverlayLeaderboard.css';
import FlyingCoinIcon from './FlyingCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

export default function OverlayLeaderboard() {
  const [period, setPeriod] = useState('month'); // 'all' | 'month' | 'today'
  const [limit, setLimit] = useState(5);
  const [theme, setTheme] = useState('dark'); // 'dark' | 'glass' | 'compact'
  const [title, setTitle] = useState('TOP SULTAN');
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Parse URL query params (e.g. /overlay/leaderboard?period=today&limit=3&theme=compact&title=DONATUR+TERBAIK)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('period');
    if (p && ['all', 'month', 'today'].includes(p)) setPeriod(p);
    
    const l = parseInt(params.get('limit'), 10);
    if (!isNaN(l) && l > 0 && l <= 20) setLimit(l);

    const t = params.get('theme');
    if (t && ['dark', 'glass', 'compact'].includes(t)) setTheme(t);

    const customTitle = params.get('title');
    if (customTitle) setTitle(customTitle);

    // Apply transparent body classes
    document.documentElement.classList.add('is-overlay');
    document.body.classList.add('is-overlay');

    return () => {
      document.documentElement.classList.remove('is-overlay');
      document.body.classList.remove('is-overlay');
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/public/leaderboard?period=${period}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setLastUpdated(Date.now());
      }
    } catch (e) {
      console.error('Failed fetching overlay leaderboard:', e);
    }
  };

  // Initial fetch and auto-refresh every 10 seconds
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [period, limit]);

  // Connect to SSE for instant refresh on new transaction
  useEffect(() => {
    let evtSource = null;
    try {
      evtSource = new EventSource(`${API_BASE}/api/public/overlay/events`);
      evtSource.addEventListener('donation', () => {
        // Instant refresh when someone donates
        setTimeout(fetchLeaderboard, 1000);
      });
    } catch (e) {
      console.error(e);
    }
    return () => {
      if (evtSource) evtSource.close();
    };
  }, [period, limit]);

  const periodLabel = period === 'today' ? 'HARI INI' : period === 'month' ? 'BULAN INI' : 'ALL TIME';

  return (
    <div className={`obs-leaderboard-viewport theme-${theme}`}>
      <div className="obs-lb-card">
        
        {/* Header */}
        <div className="obs-lb-header">
          <div className="obs-lb-header-left">
            <FlyingCoinIcon size={26} className="obs-lb-icon" />
            <span className="obs-lb-title">{title}</span>
          </div>
          <span className="obs-lb-badge">{periodLabel}</span>
        </div>

        {/* Content list */}
        <div className="obs-lb-list">
          {leaderboard.length === 0 ? (
            <div className="obs-lb-empty">
              <span>Belum ada donasi {periodLabel.toLowerCase()}</span>
            </div>
          ) : (
            leaderboard.map((item, idx) => {
              const rank = idx + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
              return (
                <div key={idx} className={`obs-lb-row rank-${rank}`}>
                  <div className="obs-lb-rank">{medal}</div>
                  <div className="obs-lb-user">
                    <span className="obs-lb-name">{item.name}</span>
                    <span className="obs-lb-times">{item.count}x sawer</span>
                  </div>
                  <div className="obs-lb-amount">
                    <span>Rp {Number(item.total_amount).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer branding */}
        <div className="obs-lb-footer">
          <span className="obs-lb-brand">notnot.store/donate</span>
        </div>

      </div>
    </div>
  );
}
