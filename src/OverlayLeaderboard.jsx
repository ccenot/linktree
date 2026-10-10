import React, { useState, useEffect } from 'react';
import './OverlayLeaderboard.css';
import { RoundCoinIcon } from './FlyingCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

export default function OverlayLeaderboard() {
  const [period, setPeriod] = useState('month'); // 'all' | 'month' | 'today'
  const [limit, setLimit] = useState(5);
  const [theme, setTheme] = useState('simple'); // 'simple' | 'pill' | 'text'
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('period');
    if (p && ['all', 'month', 'today'].includes(p)) setPeriod(p);
    
    const l = parseInt(params.get('limit'), 10);
    if (!isNaN(l) && l > 0 && l <= 20) setLimit(l);

    const t = params.get('theme');
    if (t && ['simple', 'pill', 'text'].includes(t)) setTheme(t);

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
      }
    } catch (e) {
      console.error('Failed fetching overlay leaderboard:', e);
    }
  };

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
        setTimeout(fetchLeaderboard, 1000);
      });
    } catch (e) {
      console.error(e);
    }
    return () => {
      if (evtSource) evtSource.close();
    };
  }, [period, limit]);

  return (
    <div className={`obs-leaderboard-viewport theme-${theme}`}>
      <div className="obs-saweria-lb">
        {leaderboard.length === 0 ? (
          <div className="obs-lb-empty">
            <span>Belum ada data</span>
          </div>
        ) : (
          leaderboard.map((item, idx) => {
            const rank = idx + 1;
            return (
              <div key={idx} className={`obs-lb-row rank-${rank}`}>
                <div className="obs-lb-name-col">
                  <span className="obs-lb-rank">{rank}.</span>
                  <span className="obs-lb-name">{item.name}</span>
                </div>
                <div className="obs-lb-val-col">
                  <RoundCoinIcon size={16} />
                  <span className="obs-lb-amount">
                    {Number(item.total_amount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
