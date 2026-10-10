import React, { useState, useEffect } from 'react';
import './DonatePage.css';
import FlyingCoinIcon from './FlyingCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

const PRESET_AMOUNTS = [
  { label: 'Rp 5.000', value: 5000 },
  { label: 'Rp 10.000', value: 10000, tag: 'Populer' },
  { label: 'Rp 25.000', value: 25000 },
  { label: 'Rp 50.000', value: 50000 },
  { label: 'Rp 100.000', value: 100000 }
];

// Convert "MM:SS" or "HH:MM:SS" or "SS" to seconds
function parseTimeToSeconds(val) {
  if (!val) return 0;
  const str = String(val).trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  const parts = str.split(':').map(p => parseInt(p, 10) || 0);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

// Format seconds to "MM:SS" or "HH:MM:SS"
function formatSecondsToTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function DonatePage({ onBack }) {
  const [activeTab, setActiveTab] = useState('donate'); // 'donate' | 'leaderboard'
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all'); // 'all' | 'month' | 'today'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaStart, setMediaStart] = useState('00:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Media Share Settings from server
  const [settings, setSettings] = useState({
    mediaShareEnabled: true,
    minAmountForMedia: 10000,
    secPerThousand: 3,
    maxDurationSec: 60
  });

  // Milestone State
  const [milestone, setMilestone] = useState(null);

  const fetchLeaderboard = async (period = 'all') => {
    try {
      setLoadingLeaderboard(true);
      const res = await fetch(`${API_BASE}/api/public/leaderboard?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/public/donation-settings`)
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/public/milestone`)
      .then(res => res.json())
      .then(data => {
        if (data.milestone && data.milestone.enabled) setMilestone(data.milestone);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard(leaderboardPeriod);
    }
  }, [activeTab, leaderboardPeriod]);

  // Active Checkout State
  const [checkout, setCheckout] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in sec
  const [isSettled, setIsSettled] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute final base amount
  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  // Countdown timer for active checkout
  useEffect(() => {
    if (!checkout || isSettled) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checkout, isSettled]);

  // Status Polling for active checkout
  useEffect(() => {
    if (!checkout || isSettled) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/donate/${checkout.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'matched' || data.status === 'SETTLEMENT') {
            setIsSettled(true);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Polling payment error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [checkout, isSettled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!finalAmount || finalAmount < 1000) {
      setErrorMsg('Minimal donasi adalah Rp 1.000');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Harap masukkan alamat email yang valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let finalMediaUrl = mediaUrl.trim();
      if (finalMediaUrl && settings.mediaShareEnabled) {
        const startSec = parseTimeToSeconds(mediaStart);
        if (startSec > 0 && !finalMediaUrl.includes('start=') && !finalMediaUrl.includes('t=')) {
          const separator = finalMediaUrl.includes('?') ? '&' : '?';
          finalMediaUrl = `${finalMediaUrl}${separator}start=${startSec}`;
        }
      }

      const res = await fetch(`${API_BASE}/api/public/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonim',
          email: email.trim(),
          amount: finalAmount,
          message: message.trim(),
          mediaUrl: finalMediaUrl
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat QRIS');
      }

      setCheckout(data);
      setTimeLeft(900);
      setIsSettled(false);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAmount = () => {
    if (!checkout) return;
    navigator.clipboard.writeText(checkout.totalAmount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="donate-wrapper">
      <div className="donate-container">
        
        {/* Navigation Bar */}
        <div className="donate-topbar">
          <button className="donate-back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali</span>
          </button>
          <div className="donate-brand">
            <span className="donate-brand-title">notnot.store</span>
            <span className="donate-brand-badge">SAWER</span>
          </div>
        </div>

        {/* STATE 1: FORM INPUT */}
        {!checkout && (
          <div className="donate-card">
            <div className="donate-header">
              <div className="donate-avatar">
                <img src="https://avatarfiles.alphacoders.com/174/174875.png" alt="Cenot" />
              </div>
              <h1 className="donate-title">Dukung @cenot</h1>
              <p className="donate-desc">
                Kirim saweran dengan notifikasi suara TTS & putar media langsung di live stream!
              </p>
            </div>

            {/* Live Milestone Goal Bar (if enabled) */}
            {milestone && (
              <div className="donate-milestone-box">
                <div className="dm-header">
                  <div className="dm-left">
                    <span className="dm-title">{milestone.title}</span>
                  </div>
                  <span className="dm-pct">{milestone.percentage}%</span>
                </div>
                <div className="dm-track">
                  <div className="dm-fill" style={{ width: `${milestone.percentage}%` }}></div>
                </div>
                <div className="dm-footer">
                  <span>Terkumpul: <strong>Rp {milestone.current.toLocaleString('id-ID')}</strong></span>
                  <span>Target: <strong>Rp {milestone.target.toLocaleString('id-ID')}</strong></span>
                </div>
              </div>
            )}

            {/* View Switcher Tabs (Sawer vs Leaderboard) */}
            <div className="donate-tab-switcher">
              <button
                type="button"
                className={`tab-switch-btn ${activeTab === 'donate' ? 'active' : ''}`}
                onClick={() => setActiveTab('donate')}
              >
                Kirim Saweran
              </button>
              <button
                type="button"
                className={`tab-switch-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
            </div>

            {activeTab === 'leaderboard' ? (
              <div className="leaderboard-view animate-fade-in">
                {/* Period Selector */}
                <div className="period-pills">
                  <button
                    type="button"
                    className={`period-btn ${leaderboardPeriod === 'all' ? 'active' : ''}`}
                    onClick={() => setLeaderboardPeriod('all')}
                  >
                    Semua Waktu
                  </button>
                  <button
                    type="button"
                    className={`period-btn ${leaderboardPeriod === 'month' ? 'active' : ''}`}
                    onClick={() => setLeaderboardPeriod('month')}
                  >
                    Bulan Ini
                  </button>
                  <button
                    type="button"
                    className={`period-btn ${leaderboardPeriod === 'today' ? 'active' : ''}`}
                    onClick={() => setLeaderboardPeriod('today')}
                  >
                    Hari Ini
                  </button>
                </div>

                {loadingLeaderboard ? (
                  <div className="lb-loading">Memuat leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="lb-empty">
                    <FlyingCoinIcon size={64} className="lb-empty-icon" style={{ margin: '0 auto 12px' }} />
                    <p className="lb-empty-title">Belum ada saweran di periode ini</p>
                    <p className="lb-empty-sub">Jadilah orang pertama yang muncul di Top Leaderboard!</p>
                    <button
                      type="button"
                      className="donate-submit-btn"
                      style={{ marginTop: '16px' }}
                      onClick={() => setActiveTab('donate')}
                    >
                      Sawer Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="lb-list">
                    {leaderboard.map((user, idx) => {
                      const rank = idx + 1;
                      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                      return (
                        <div key={idx} className={`lb-item rank-${rank}`}>
                          <div className="lb-rank-badge">{medal}</div>
                          <div className="lb-user-info">
                            <span className="lb-username">{user.name}</span>
                            <span className="lb-count">{user.count}x saweran</span>
                          </div>
                          <div className="lb-amount">
                            <span>Rp {Number(user.total_amount).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
            {errorMsg && (
              <div className="donate-alert-error">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="donate-form">
              {/* Preset Amounts */}
              <div className="form-group">
                <label className="form-label">Pilih Nominal</label>
                <div className="amount-grid">
                  {PRESET_AMOUNTS.map(item => (
                    <button
                      key={item.value}
                      type="button"
                      className={`amount-pill ${!customAmount && selectedAmount === item.value ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAmount(item.value);
                        setCustomAmount('');
                      }}
                    >
                      <span>{item.label}</span>
                      {item.tag && <span className="pill-tag">{item.tag}</span>}
                    </button>
                  ))}
                </div>

                <div className="custom-amount-box">
                  <span className="currency-prefix">Rp</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    placeholder="Atau masukkan nominal lain..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="custom-amount-input"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label">Nama Pengirim</label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Nama atau samaran (kosongkan untuk Anonim)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Pengirim <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Pesan Saweran (TTS)</label>
                  <span className="char-count">{message.length}/250</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  placeholder="Tulis pesan yang bakal dibacain suara bot di stream..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Media Share */}
              {settings.mediaShareEnabled && (
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Media Share (Link YouTube)</label>
                    <span className="optional-tag">Opsional</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={mediaUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMediaUrl(val);
                      // Auto extract start timestamp if user pasted link with ?t=... or &start=...
                      const tMatch = val.match(/[?&](?:t|start)=([^&#]+)/);
                      if (tMatch) {
                        const tVal = tMatch[1];
                        if (/^\d+$/.test(tVal)) {
                          setMediaStart(formatSecondsToTime(parseInt(tVal, 10)));
                        } else {
                          const hours = (tVal.match(/(\d+)h/) || [])[1] || 0;
                          const mins = (tVal.match(/(\d+)m/) || [])[1] || 0;
                          const secs = (tVal.match(/(\d+)s/) || [])[1] || 0;
                          const sec = parseInt(hours, 10) * 3600 + parseInt(mins, 10) * 60 + parseInt(secs, 10);
                          if (sec > 0) setMediaStart(formatSecondsToTime(sec));
                        }
                      }
                    }}
                    className="form-input"
                  />

                  {/* Custom Cut Start Time Input */}
                  {mediaUrl && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '6px',
                      backgroundColor: '#141827',
                      border: '1px solid rgba(79, 93, 150, 0.3)',
                      borderRadius: '10px',
                      padding: '8px 12px'
                    }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                        ✂️ Mulai dari menit/detik:
                      </label>
                      <input
                        type="text"
                        placeholder="00:00 (misal 10:00)"
                        value={mediaStart}
                        onChange={(e) => setMediaStart(e.target.value)}
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '12.5px', width: '120px', height: '30px' }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        (MM:SS)
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <span className="input-hint">
                      Tarif: Min. Rp {settings.minAmountForMedia.toLocaleString('id-ID')} ({settings.secPerThousand} dtk/Rp 1.000, maks. {settings.maxDurationSec} dtk).
                    </span>
                    {mediaUrl && finalAmount < settings.minAmountForMedia && (
                      <span style={{ fontSize: '12px', color: '#93c5fd', fontWeight: '600' }}>
                        ⚠️ Naikkan nominal minimal Rp {settings.minAmountForMedia.toLocaleString('id-ID')} agar video bisa diputar di stream.
                      </span>
                    )}
                    {mediaUrl && finalAmount >= settings.minAmountForMedia && (() => {
                      const durSec = Math.min(settings.maxDurationSec, Math.floor((finalAmount / 1000) * settings.secPerThousand));
                      const startSec = parseTimeToSeconds(mediaStart);
                      const endSec = startSec + durSec;
                      return (
                        <div style={{
                          backgroundColor: '#141827',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          marginTop: '4px'
                        }}>
                          <span style={{ fontSize: '12.5px', color: '#38bdf8', fontWeight: '700' }}>
                            ✂️ Custom Cut: {formatSecondsToTime(startSec)} ➔ {formatSecondsToTime(endSec)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Video diputar selama {durSec} detik ({Math.round(durSec / 60 * 10) / 10} menit) sesuai nominal saweran Rp {finalAmount.toLocaleString('id-ID')}.
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="donate-submit-btn"
              >
                {isSubmitting ? (
                  <span className="btn-spinner">Membuat QRIS...</span>
                ) : (
                  <>
                    <span>Bayar Rp {finalAmount.toLocaleString('id-ID')} via QRIS</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </form>
            </>
            )}
          </div>
        )}

        {/* STATE 2: ACTIVE CHECKOUT / QRIS */}
        {checkout && !isSettled && (
          <div className="donate-card qris-card">
            <div className="qris-header">
              <span className="qris-tag">SCAN QRIS UNTUK MEMBAYAR</span>
              <div className="timer-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            <div className="amount-highlight">
              <span className="amount-label">Total Tagihan (Pas):</span>
              <div className="amount-val-row">
                <span className="amount-val">Rp {checkout.totalAmount.toLocaleString('id-ID')}</span>
                <button className="copy-btn" onClick={handleCopyAmount} title="Salin Nominal">
                  {copied ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <p className="unique-hint">
                *Termasuk kode unik <strong>+{checkout.uniqueCode}</strong> untuk verifikasi instan otomatis.
              </p>
            </div>

            {/* QR Image */}
            <div className="qris-img-container">
              <img src={checkout.qrImage} alt="QRIS Code" className="qris-img" />
              <div className="qris-watermark">
                <span>Dukung @cenot</span>
              </div>
            </div>

            {/* Waiting Pulse */}
            <div className="waiting-status">
              <div className="pulse-dot"></div>
              <span>Menunggu pembayaran kamu via e-Wallet / Mobile Banking...</span>
            </div>

            <div className="supported-apps">
              <span>BCA</span> • <span>Mandiri</span> • <span>GoPay</span> • <span>Dana</span> • <span>OVO</span> • <span>ShopeePay</span> • <span>Semua QRIS</span>
            </div>

            <button className="cancel-order-btn" onClick={() => setCheckout(null)}>
              Batal / Buat Pesanan Baru
            </button>
          </div>
        )}

        {/* STATE 3: SETTLED / SUCCESS */}
        {checkout && isSettled && (
          <div className="donate-card success-card">
            <div className="success-icon-bubble">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 className="success-title">Saweran Berhasil Masuk!</h2>
            <p className="success-sub">
              Terima kasih banyak, <strong>{checkout.donatorName}</strong>! Notifikasi & pesan kamu sudah dikirim ke overlay stream.
            </p>

            <div className="summary-box">
              <div className="summary-row">
                <span>Nominal:</span>
                <strong>Rp {checkout.totalAmount.toLocaleString('id-ID')}</strong>
              </div>
              {checkout.message && (
                <div className="summary-row message-row">
                  <span>Pesan:</span>
                  <em>"{checkout.message}"</em>
                </div>
              )}
            </div>

            <div className="success-actions">
              <button className="donate-submit-btn" onClick={() => setCheckout(null)}>
                Kirim Saweran Lagi
              </button>
              <button className="cancel-order-btn" onClick={onBack}>
                Kembali ke Beranda
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
