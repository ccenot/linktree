import React, { useState, useEffect } from 'react';
import './AdminDonations.css';
import FlyingCoinIcon from './FlyingCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'settled' | 'pending'
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [testStatus, setTestStatus] = useState('');

  // OBS Leaderboard Template Customizer State
  const [obsLbPeriod, setObsLbPeriod] = useState('month');
  const [obsLbLimit, setObsLbLimit] = useState(5);
  const [obsLbTheme, setObsLbTheme] = useState('dark');
  const [obsLbTitle, setObsLbTitle] = useState('TOP SULTAN');
  const [copiedGeneratedUrl, setCopiedGeneratedUrl] = useState(false);

  // Generated OBS URL
  const generatedObsUrl = `https://notnot.store/overlay/leaderboard?period=${obsLbPeriod}&limit=${obsLbLimit}&theme=${obsLbTheme}${obsLbTitle !== 'TOP SULTAN' ? `&title=${encodeURIComponent(obsLbTitle)}` : ''}`;

  // Media Share & Milestone Settings
  const [settings, setSettings] = useState({
    mediaShareEnabled: true,
    minAmountForMedia: 10000,
    secPerThousand: 3,
    maxDurationSec: 60,
    milestoneEnabled: true,
    milestoneTitle: 'Target Beli Gear Stream Baru',
    milestoneTarget: 500000,
    milestonePeriod: 'month',
    milestoneOffset: 0
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [copiedMilestone, setCopiedMilestone] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/public/donation-settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      const res = await fetch(`${API_BASE}/api/public/donation-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSettingsSavedMsg('✓ Pengaturan Tersimpan!');
        setTimeout(() => setSettingsSavedMsg(''), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/public/donations`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Failed fetching donations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    fetchSettings();
    // Auto refresh every 15s
    const interval = setInterval(fetchDonations, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyOverlayUrl = () => {
    navigator.clipboard.writeText('https://notnot.store/overlay');
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2000);
  };

  const handleCopyLeaderboardOverlay = () => {
    navigator.clipboard.writeText('https://notnot.store/overlay/leaderboard');
    setCopiedOverlay('lb');
    setTimeout(() => setCopiedOverlay(false), 2000);
  };

  const handleCopyMilestoneOverlay = (param = '') => {
    const url = param ? `https://notnot.store/overlay/milestone${param}` : 'https://notnot.store/overlay/milestone';
    navigator.clipboard.writeText(url);
    setCopiedMilestone(param || 'default');
    setTimeout(() => setCopiedMilestone(false), 2000);
  };

  const handleTestAlert = async () => {
    try {
      setTestStatus('Mengirim...');
      const res = await fetch(`${API_BASE}/api/public/overlay/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sultan Tester',
          amount: 50000,
          message: 'Halo Cenot! Test alert suara & overlay berhasil!',
          mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        })
      });
      if (res.ok) {
        setTestStatus('Terkirim ke OBS!');
        setTimeout(() => setTestStatus(''), 2500);
      }
    } catch (e) {
      setTestStatus('Gagal kirim');
    }
  };

  const handlePlayTTS = (name, amount, message) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = `${name} menyawer Rp ${amount.toLocaleString('id-ID')}. Pesan: ${message || 'Semangat!'}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Calculations
  const settledList = donations.filter(d => d.status === 'matched' || d.status === 'SETTLEMENT');
  const pendingList = donations.filter(d => d.status === 'pending');
  const totalAmount = settledList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filtered List
  const filteredDonations = donations.filter(item => {
    const isSettled = item.status === 'matched' || item.status === 'SETTLEMENT';
    if (statusFilter === 'settled' && !isSettled) return false;
    if (statusFilter === 'pending' && isSettled) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.donator_name && item.donator_name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.message && item.message.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q))
    );
  });

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="admin-donations-wrapper animate-fade-in">
      
      {/* Top Banner / OBS Quick Links */}
      <div className="admin-obs-banner">
        <div className="obs-banner-info">
          <div className="obs-badge">OBS STUDIO OVERLAYS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
            <span className="obs-url-text">📢 Alert Pop-up: https://notnot.store/overlay</span>
            <span className="obs-url-text" style={{ color: '#93c5fd' }}>🏆 Top Sultan: https://notnot.store/overlay/leaderboard</span>
            <span className="obs-url-text" style={{ color: '#38bdf8' }}>🎯 Goal Milestone: https://notnot.store/overlay/milestone</span>
          </div>
          <p className="obs-hint">Pasang sebagai Browser Source di OBS (background 100% transparan, update realtime otomatis).</p>
        </div>
        <div className="obs-banner-actions">
          <button onClick={handleCopyOverlayUrl} className="obs-action-btn">
            {copiedOverlay === true ? '✓ Alert Tersalin!' : '📋 Link Alert OBS'}
          </button>
          <button onClick={handleCopyLeaderboardOverlay} className="obs-action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FlyingCoinIcon size={18} />
            <span>{copiedOverlay === 'lb' ? '✓ Tersalin!' : 'Top Sultan'}</span>
          </button>
          <button onClick={() => handleCopyMilestoneOverlay('')} className="obs-action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯</span>
            <span>{copiedMilestone === 'default' ? '✓ Tersalin!' : 'Milestone'}</span>
          </button>
          <button onClick={handleTestAlert} className="obs-action-btn primary">
            {testStatus || '🔔 Test Alert OBS'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card highlight">
          <span className="stat-label">TOTAL SAWERAN (LUNAS)</span>
          <span className="stat-value">Rp {totalAmount.toLocaleString('id-ID')}</span>
          <span className="stat-sub">{settledList.length} transaksi sukses</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">MENUNGGU PEMBAYARAN</span>
          <span className="stat-value">{pendingList.length}</span>
          <span className="stat-sub">Invoice aktif</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">TOTAL PENGUNJUNG DONATE</span>
          <span className="stat-value">{donations.length}</span>
          <span className="stat-sub">Invoice dibuat</span>
        </div>
      </div>

      {/* OBS LEADERBOARD TEMPLATE GENERATOR & PREVIEW */}
      <div className="admin-media-settings-card">
        <div className="media-settings-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlyingCoinIcon size={24} />
              <h3 className="media-settings-title" style={{ margin: 0 }}>Template & URL Widget OBS Leaderboard</h3>
            </div>
            <p className="media-settings-desc">Kustomisasi tampilan widget Top Sultan untuk OBS Studio secara langsung (preview real-time).</p>
          </div>
          <button 
            type="button" 
            onClick={() => {
              navigator.clipboard.writeText(generatedObsUrl);
              setCopiedGeneratedUrl(true);
              setTimeout(() => setCopiedGeneratedUrl(false), 2000);
            }} 
            className="save-settings-btn"
            style={{ padding: '8px 14px' }}
          >
            {copiedGeneratedUrl ? '✓ URL Widget Tersalin!' : '📋 Salin URL Browser Source'}
          </button>
        </div>

        {/* Customizer controls */}
        <div className="media-settings-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="settings-field">
            <label>Periode Waktu</label>
            <select
              value={obsLbPeriod}
              onChange={(e) => setObsLbPeriod(e.target.value)}
              className="search-input"
              style={{ padding: '8px 10px', height: '37px', cursor: 'pointer' }}
            >
              <option value="month">Bulan Ini (Default)</option>
              <option value="today">Hari Ini (Live Stream)</option>
              <option value="all">Semua Waktu (All Time)</option>
            </select>
          </div>

          <div className="settings-field">
            <label>Jumlah Ranking Tampil</label>
            <select
              value={obsLbLimit}
              onChange={(e) => setObsLbLimit(Number(e.target.value))}
              className="search-input"
              style={{ padding: '8px 10px', height: '37px', cursor: 'pointer' }}
            >
              <option value="3">Top 3 Sultan</option>
              <option value="5">Top 5 Sultan</option>
              <option value="10">Top 10 Sultan</option>
            </select>
          </div>

          <div className="settings-field">
            <label>Tema Tampilan Widget</label>
            <select
              value={obsLbTheme}
              onChange={(e) => setObsLbTheme(e.target.value)}
              className="search-input"
              style={{ padding: '8px 10px', height: '37px', cursor: 'pointer' }}
            >
              <option value="dark">Dark Gold (Default)</option>
              <option value="glass">Glassmorphism Blur</option>
              <option value="compact">Compact / Mini Slim</option>
            </select>
          </div>

          <div className="settings-field">
            <label>Judul Header Kartu</label>
            <input
              type="text"
              value={obsLbTitle}
              onChange={(e) => setObsLbTitle(e.target.value)}
              className="search-input"
              style={{ padding: '8px 10px', height: '37px' }}
              placeholder="TOP SULTAN"
            />
          </div>
        </div>

        {/* Generated URL Box & Quick Instructions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: '#0c0c0e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd' }}>
              URL Browser Source OBS:
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Rekomendasi Size OBS: <strong>Width: 380px</strong>, <strong>Height: 520px</strong>
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: '#181d2f',
            border: '1px solid rgba(79, 93, 150, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px'
          }}>
            <code style={{ flex: 1, color: '#e2e8f0', fontSize: '12.5px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {generatedObsUrl}
            </code>
            <a
              href={generatedObsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#93c5fd',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(96, 165, 250, 0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              ↗ Buka Preview
            </a>
          </div>
        </div>
      </div>

      {/* MILESTONE / GOAL BAR SETTINGS */}
      <form onSubmit={handleSaveSettings} className="admin-media-settings-card">
        <div className="media-settings-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <h3 className="media-settings-title" style={{ margin: 0 }}>Target Saweran & Milestone Goal Bar</h3>
            </div>
            <p className="media-settings-desc">Pasang progress bar target saweran di OBS Studio dan laman donate untuk memotivasi penonton.</p>
          </div>
          <div className="toggle-wrapper">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={settings.milestoneEnabled ?? true}
                onChange={(e) => setSettings(prev => ({ ...prev, milestoneEnabled: e.target.checked }))}
              />
              <span className="switch-text">{settings.milestoneEnabled ? '✓ Milestone Aktif' : 'Nonaktif'}</span>
            </label>
          </div>
        </div>

        <div className="media-settings-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="settings-field">
            <label>Judul Target Milestone</label>
            <input
              type="text"
              value={settings.milestoneTitle || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, milestoneTitle: e.target.value }))}
              className="search-input"
              style={{ padding: '8px 10px', height: '37px' }}
              placeholder="e.g. Beli Mic Shure Baru"
            />
          </div>

          <div className="settings-field">
            <label>Target Nominal (Rp)</label>
            <div className="input-with-prefix">
              <span>Rp</span>
              <input
                type="number"
                min="10000"
                step="10000"
                value={settings.milestoneTarget || 500000}
                onChange={(e) => setSettings(prev => ({ ...prev, milestoneTarget: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="settings-field">
            <label>Hitung Berdasarkan</label>
            <select
              value={settings.milestonePeriod || 'month'}
              onChange={(e) => setSettings(prev => ({ ...prev, milestonePeriod: e.target.value }))}
              className="search-input"
              style={{ padding: '8px 10px', height: '37px', cursor: 'pointer' }}
            >
              <option value="today">Saweran Hari Ini (Live)</option>
              <option value="month">Saweran Bulan Ini (Default)</option>
              <option value="all">Semua Waktu (All-Time)</option>
            </select>
          </div>

          <div className="settings-action-col">
            <button type="submit" disabled={isSavingSettings} className="save-settings-btn">
              {isSavingSettings ? 'Menyimpan...' : '💾 Simpan Milestone'}
            </button>
            {settingsSavedMsg && <span className="settings-saved-badge">{settingsSavedMsg}</span>}
          </div>
        </div>

        {/* Milestone OBS Quick Links */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: '#0c0e18',
          border: '1px solid rgba(79, 93, 150, 0.25)',
          borderRadius: '12px',
          padding: '12px 14px'
        }}>
          <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#38bdf8' }}>
            🔗 Link Browser Source OBS untuk Milestone:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleCopyMilestoneOverlay('')}
              className="obs-action-btn"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {copiedMilestone === 'default' ? '✓ Kartu Tersalin!' : '📋 Salin Mode Kartu (380x120)'}
            </button>
            <button
              type="button"
              onClick={() => handleCopyMilestoneOverlay('?theme=bar')}
              className="obs-action-btn"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {copiedMilestone === '?theme=bar' ? '✓ Bar Tersalin!' : '📏 Salin Mode Slim Bar (600x45)'}
            </button>
            <a
              href="https://notnot.store/overlay/milestone"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              ↗ Preview Kartu
            </a>
            <a
              href="https://notnot.store/overlay/milestone?theme=bar"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              ↗ Preview Slim Bar
            </a>
          </div>
        </div>
      </form>

      {/* Media Share Settings Form Card */}
      <form onSubmit={handleSaveSettings} className="admin-media-settings-card">
        <div className="media-settings-header">
          <div>
            <h3 className="media-settings-title">⚙️ Aturan Media Share (Anti-Spam Video)</h3>
            <p className="media-settings-desc">Atur tarif durasi video per saweran dan batasi durasi maksimal agar live stream tidak dispam.</p>
          </div>
          <div className="toggle-wrapper">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={settings.mediaShareEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, mediaShareEnabled: e.target.checked }))}
              />
              <span className="switch-text">{settings.mediaShareEnabled ? '✓ Media Share Aktif' : 'Nonaktif'}</span>
            </label>
          </div>
        </div>

        <div className="media-settings-grid">
          <div className="settings-field">
            <label>Min. Donasi untuk Video</label>
            <div className="input-with-prefix">
              <span>Rp</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={settings.minAmountForMedia}
                onChange={(e) => setSettings(prev => ({ ...prev, minAmountForMedia: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="settings-field">
            <label>Durasi per Rp 1.000</label>
            <div className="input-with-suffix">
              <input
                type="number"
                min="1"
                max="60"
                value={settings.secPerThousand}
                onChange={(e) => setSettings(prev => ({ ...prev, secPerThousand: Number(e.target.value) }))}
              />
              <span>detik</span>
            </div>
            <small className="field-hint">Rp 10.000 = {settings.secPerThousand * 10} detik</small>
          </div>

          <div className="settings-field">
            <label>Batas Maks. Video (Anti-Spam)</label>
            <div className="input-with-suffix">
              <input
                type="number"
                min="5"
                max="300"
                value={settings.maxDurationSec}
                onChange={(e) => setSettings(prev => ({ ...prev, maxDurationSec: Number(e.target.value) }))}
              />
              <span>detik</span>
            </div>
            <small className="field-hint">Maks. {Math.round(settings.maxDurationSec / 60 * 10) / 10} menit</small>
          </div>

          <div className="settings-action-col">
            <button type="submit" disabled={isSavingSettings} className="save-settings-btn">
              {isSavingSettings ? 'Menyimpan...' : '💾 Simpan Aturan'}
            </button>
            {settingsSavedMsg && <span className="settings-saved-badge">{settingsSavedMsg}</span>}
          </div>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="admin-table-controls">
        <div className="filter-pill-group">
          <button
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Semua ({donations.length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'settled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('settled')}
          >
            ✓ Lunas ({settledList.length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            ⏳ Menunggu ({pendingList.length})
          </button>
        </div>

        <div className="search-box-row">
          <input
            type="text"
            placeholder="Cari nama, email, pesan, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchDonations} className="refresh-btn" title="Muat Ulang">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="donations-table-card">
        {isLoading && donations.length === 0 ? (
          <div className="table-loading">Memuat data donasi...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="table-empty">
            <span>Belum ada data donasi yang cocok.</span>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="donations-table">
              <thead>
                <tr>
                  <th>WAKTU</th>
                  <th>DONATUR</th>
                  <th>EMAIL</th>
                  <th>NOMINAL</th>
                  <th>PESAN (TTS)</th>
                  <th>MEDIA</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((item) => {
                  const isSuccess = item.status === 'matched' || item.status === 'SETTLEMENT';
                  return (
                    <tr key={item.id} className={isSuccess ? 'row-settled' : 'row-pending'}>
                      <td className="cell-time">
                        <span>{formatDate(item.created_at)}</span>
                        <small className="order-id">{item.id}</small>
                      </td>

                      <td className="cell-name">
                        <strong>{item.donator_name || 'Anonim'}</strong>
                      </td>

                      <td className="cell-email">
                        {item.email ? (
                          <a href={`mailto:${item.email}`} className="email-link">
                            {item.email}
                          </a>
                        ) : (
                          <span className="email-empty">-</span>
                        )}
                      </td>

                      <td className="cell-amount">
                        <span className="amount-text">
                          Rp {Number(item.amount).toLocaleString('id-ID')}
                        </span>
                        {item.unique_code > 0 && (
                          <small className="unique-tag">+{item.unique_code}</small>
                        )}
                      </td>

                      <td className="cell-message">
                        {item.message ? (
                          <span className="message-content">"{item.message}"</span>
                        ) : (
                          <span className="no-message">-</span>
                        )}
                      </td>

                      <td className="cell-media">
                        {item.media_url ? (
                          <a
                            href={item.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="media-link-badge"
                            title={item.media_url}
                          >
                            ▶ YouTube
                          </a>
                        ) : (
                          <span className="no-media">-</span>
                        )}
                      </td>

                      <td className="cell-status">
                        {isSuccess ? (
                          <span className="badge-status success">Lunas</span>
                        ) : (
                          <span className="badge-status pending">Menunggu</span>
                        )}
                      </td>

                      <td className="cell-actions">
                        <button
                          onClick={() => handlePlayTTS(item.donator_name, item.amount, item.message)}
                          className="tts-play-btn"
                          title="Dengarkan Suara TTS"
                        >
                          🔊 Play TTS
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
