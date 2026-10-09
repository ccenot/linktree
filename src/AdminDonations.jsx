import React, { useState, useEffect } from 'react';
import './AdminDonations.css';

const API_BASE = 'https://kasir.notnot.store';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'settled' | 'pending'
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [testStatus, setTestStatus] = useState('');

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
    // Auto refresh every 15s
    const interval = setInterval(fetchDonations, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyOverlayUrl = () => {
    navigator.clipboard.writeText('https://notnot.store/overlay');
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2000);
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
          <div className="obs-badge">OBS STUDIO OVERLAY</div>
          <span className="obs-url-text">https://notnot.store/overlay</span>
          <p className="obs-hint">Pasang sebagai Browser Source di OBS (1920x1080) untuk alert suara TTS & video otomatis.</p>
        </div>
        <div className="obs-banner-actions">
          <button onClick={handleCopyOverlayUrl} className="obs-action-btn">
            {copiedOverlay ? '✓ URL Tersalin!' : '📋 Salin Link OBS'}
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
