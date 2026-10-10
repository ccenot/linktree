import React, { useState, useEffect } from 'react';
import './OverlayLeaderboard.css';
import GoldCoinIcon from './GoldCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

export default function OverlayLeaderboard() {
  const [period, setPeriod] = useState('month'); // 'all' | 'month' | 'today'
  const [limit, setLimit] = useState(5);
  const [title, setTitle] = useState('LEADERBOARD');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('period');
    if (p && ['all', 'month', 'today'].includes(p)) setPeriod(p);
    
    const l = parseInt(params.get('limit'), 10);
    if (!isNaN(l) && l > 0 && l <= 20) setLimit(l);

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

  const periodLabel = period === 'today' ? 'HARI INI' : period === 'month' ? 'BULAN INI' : 'ALL TIME';

  return (
    <div className="obs-leaderboard-viewport">
      {/* Bingkai Utama Tetap Dipertahankan */}
      <div className="obs-lb-card">
        
        {/* Header */}
        <div className="obs-lb-header">
          <div className="obs-lb-header-left">
            <span className="obs-lb-title">{title}</span>
          </div>
          <span className="obs-lb-badge">{periodLabel}</span>
        </div>

        {/* List Nama (Murni Teks Bersih Tanpa Frame Per-Nama) */}
        <div className="obs-lb-list">
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
                    <GoldCoinIcon size={16} />
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
    </div>
  );
}
