import React, { useState, useEffect } from 'react';
import './OverlayMilestone.css';
import FlyingCoinIcon from './FlyingCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

export default function OverlayMilestone() {
  const [milestone, setMilestone] = useState({
    enabled: true,
    title: 'Target Beli Gear Stream Baru',
    target: 500000,
    current: 0,
    percentage: 0,
    count: 0,
    period: 'month'
  });
  const [theme, setTheme] = useState('card'); // 'card' | 'bar' | 'compact'
  const [overrideTitle, setOverrideTitle] = useState('');
  const [overrideTarget, setOverrideTarget] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('theme');
    if (t && ['card', 'bar', 'compact'].includes(t)) setTheme(t);

    const titleParam = params.get('title');
    if (titleParam) setOverrideTitle(titleParam);

    const targetParam = parseInt(params.get('target'), 10);
    if (!isNaN(targetParam) && targetParam > 0) setOverrideTarget(targetParam);

    // Transparency
    document.documentElement.classList.add('is-overlay');
    document.body.classList.add('is-overlay');

    return () => {
      document.documentElement.classList.remove('is-overlay');
      document.body.classList.remove('is-overlay');
    };
  }, []);

  const fetchMilestone = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/public/milestone`);
      if (res.ok) {
        const data = await res.json();
        if (data.milestone) {
          setMilestone(data.milestone);
        }
      }
    } catch (e) {
      console.error('Failed fetching milestone:', e);
    }
  };

  useEffect(() => {
    fetchMilestone();
    const interval = setInterval(fetchMilestone, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen to SSE donation events
  useEffect(() => {
    let evtSource = null;
    try {
      evtSource = new EventSource(`${API_BASE}/api/public/overlay/events`);
      evtSource.addEventListener('donation', () => {
        setTimeout(fetchMilestone, 1000);
      });
    } catch (e) {
      console.error(e);
    }
    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  const title = overrideTitle || milestone.title;
  const target = overrideTarget > 0 ? overrideTarget : milestone.target;
  const current = milestone.current;
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  if (!milestone.enabled && !overrideTitle) {
    return <div className="obs-milestone-viewport"></div>;
  }

  // Bar-only theme (ultra slim, 40-50px height)
  if (theme === 'bar') {
    return (
      <div className="obs-milestone-viewport theme-bar">
        <div className="obs-milestone-slim-bar">
          <div className="slim-progress-fill" style={{ width: `${percentage}%` }}></div>
          <div className="slim-content">
            <div className="slim-left">
              <FlyingCoinIcon size={20} />
              <span className="slim-title">{title}</span>
            </div>
            <div className="slim-right">
              <span className="slim-amounts">
                Rp {current.toLocaleString('id-ID')} / Rp {target.toLocaleString('id-ID')}
              </span>
              <span className="slim-pct-badge">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card theme (default)
  return (
    <div className={`obs-milestone-viewport theme-${theme}`}>
      <div className="obs-milestone-card">
        {/* Header */}
        <div className="obs-ms-header">
          <div className="obs-ms-header-left">
            <FlyingCoinIcon size={24} />
            <span className="obs-ms-title">{title}</span>
          </div>
          <span className="obs-ms-pct">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="obs-ms-progress-track">
          <div 
            className="obs-ms-progress-fill" 
            style={{ width: `${percentage}%` }}
          >
            <div className="obs-ms-progress-glow"></div>
          </div>
        </div>

        {/* Footer Numbers */}
        <div className="obs-ms-footer">
          <div className="obs-ms-current">
            <span className="obs-ms-label">Terkumpul</span>
            <span className="obs-ms-val">Rp {current.toLocaleString('id-ID')}</span>
          </div>
          <div className="obs-ms-target">
            <span className="obs-ms-label">Target</span>
            <span className="obs-ms-val">Rp {target.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
