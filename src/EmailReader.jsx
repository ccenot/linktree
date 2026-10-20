import { useState, useEffect, useMemo, useRef } from 'react';
import './EmailReader.css';

const CORRECT_PIN = '6969';
const TARGET_EMAIL = 'notcloud693@gmail.com';

export default function EmailReader({ onBack }) {
  // Authentication State
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('notnot_email_pin') === CORRECT_PIN;
  });
  const [pinError, setPinError] = useState('');

  // Email Data State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewTab, setViewTab] = useState('html'); // 'html' or 'text'
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedCardOtp, setCopiedCardOtp] = useState(null);

  // Auto-refresh timer
  const autoRefreshTimerRef = useRef(null);

  // Handle PIN button click
  const handlePinInput = (num) => {
    setPinError('');
    setPin((prev) => {
      if (prev.length < 4) {
        const next = prev + num;
        if (next.length === 4) {
          // Verify on next tick so state is clean
          setTimeout(() => verifyPin(next), 50);
        }
        return next;
      }
      return prev;
    });
  };

  const handlePinDelete = () => {
    setPinError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setPinError('');
    setPin('');
  };

  const verifyPin = (candidatePin) => {
    if (candidatePin === CORRECT_PIN) {
      sessionStorage.setItem('notnot_email_pin', CORRECT_PIN);
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN salah! Silakan coba lagi.');
      setTimeout(() => {
        setPin('');
      }, 400);
    }
  };

  // Keyboard support for PIN entry
  useEffect(() => {
    if (isAuthenticated) return;
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handlePinInput(e.key);
      } else if (e.key === 'Backspace') {
        handlePinDelete();
      } else if (e.key === 'Escape') {
        handlePinClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isAuthenticated]);

  // Fetch emails from API (Primary: /api/email, Fallback: home-server.notnot.store)
  const fetchEmails = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    const payload = JSON.stringify({ pin: CORRECT_PIN, top: 25 });
    let fetchedData = null;

    // 1. Try local same-origin /api/email first
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          fetchedData = data;
        }
      }
    } catch (err) {
      console.warn('API /api/email failed, attempting fallback...', err);
    }

    // 2. Fallback to direct Home Server tunnel
    if (!fetchedData) {
      try {
        const fbRes = await fetch('https://home-server.notnot.store/api/public/email-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        if (fbRes.ok) {
          const data = await fbRes.json();
          if (data && data.success) {
            fetchedData = data;
          }
        } else {
          const errJson = await fbRes.json().catch(() => ({}));
          throw new Error(errJson.error || 'Server backend merespons error');
        }
      } catch (fbErr) {
        console.error('Home server fallback error:', fbErr);
        setError('Gagal memuat email: ' + (fbErr.message || 'Koneksi terputus'));
      }
    }

    if (fetchedData) {
      setMessages(fetchedData.messages || []);
      setLastUpdated(new Date());
    }

    if (!silent) setIsLoading(false);
  };

  // On successful auth, fetch emails
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
      // Auto-refresh every 30 seconds
      autoRefreshTimerRef.current = setInterval(() => {
        fetchEmails(true);
      }, 30000);
      return () => {
        if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
      };
    }
  }, [isAuthenticated]);

  // Handle Logout / Lock
  const handleLock = () => {
    sessionStorage.removeItem('notnot_email_pin');
    setIsAuthenticated(false);
    setPin('');
    setMessages([]);
  };

  // Copy OTP helper
  const copyToClipboard = (text, isCard = false, cardId = null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isCard && cardId) {
      setCopiedCardOtp(cardId);
      setTimeout(() => setCopiedCardOtp(null), 2000);
    } else {
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  // Find latest message with OTP
  const latestOtpMessage = useMemo(() => {
    return messages.find((m) => m.otp && m.otp.length >= 4);
  }, [messages]);

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase().trim();
    return messages.filter((m) => {
      const subject = (m.subject || '').toLowerCase();
      const from = (m.from || '').toLowerCase();
      const fromName = (m.fromName || '').toLowerCase();
      const preview = (m.preview || '').toLowerCase();
      const otp = (m.otp || '').toLowerCase();
      return (
        subject.includes(q) ||
        from.includes(q) ||
        fromName.includes(q) ||
        preview.includes(q) ||
        otp.includes(q)
      );
    });
  }, [messages, searchQuery]);

  // Format relative/short time
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins}m lalu`;
      if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours}j lalu`;
      }
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // ==================== 1. RENDER PIN LOCK SCREEN ====================
  if (!isAuthenticated) {
    return (
      <div className="email-reader-root">
        <div className="pin-lock-card">
          <div className="pin-icon-wrapper">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h2 className="pin-lock-title">NOTMAIL IMAP</h2>
          <p className="pin-lock-desc">Masukkan PIN Keamanan untuk membuka Inbox</p>

          <div className="pin-badge-account">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {TARGET_EMAIL}
          </div>

          <div className="pin-display-dots">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`pin-dot ${pin.length > idx ? 'filled' : ''}`}
              />
            ))}
          </div>

          <div className="pin-error-text">{pinError}</div>

          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                className="pin-btn"
                onClick={() => handlePinInput(String(num))}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="pin-btn action-btn"
              onClick={handlePinClear}
            >
              CLEAR
            </button>
            <button
              type="button"
              className="pin-btn"
              onClick={() => handlePinInput('0')}
            >
              0
            </button>
            <button
              type="button"
              className="pin-btn action-btn"
              onClick={handlePinDelete}
            >
              ⌫
            </button>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                marginTop: '24px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ← Kembali ke Beranda
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==================== 2. RENDER EMAIL INBOX ====================
  return (
    <div className="email-reader-root">
      <div className="email-reader-container">
        {/* Top Navbar */}
        <header className="email-topbar">
          <div className="email-brand-group">
            {onBack && (
              <button
                type="button"
                className="email-back-btn"
                onClick={onBack}
                title="Kembali"
              >
                ←
              </button>
            )}
            <div className="email-brand-info">
              <h1>
                NOTMAIL
                <span style={{ fontSize: '11px', color: '#00c48c', fontWeight: 600 }}>
                  IMAP
                </span>
              </h1>
              <div className="email-status-pill">
                <span className="email-status-dot"></span>
                <span>Terhubung</span>
                {lastUpdated && (
                  <span style={{ color: '#64748b', marginLeft: '4px' }}>
                    · {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="email-top-actions">
            <button
              type="button"
              className="refresh-btn"
              onClick={() => fetchEmails(false)}
              disabled={isLoading}
              title="Perbarui Kotak Masuk"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isLoading ? 'spin-icon' : ''}
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              {isLoading ? 'Memuat...' : 'Refresh'}
            </button>

            <button
              type="button"
              className="lock-btn"
              onClick={handleLock}
              title="Kunci Sesi"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* Account Meta Card */}
        <div className="account-card">
          <div className="acc-details">
            <div className="acc-avatar">G</div>
            <div className="acc-meta">
              <span className="acc-email">{TARGET_EMAIL}</span>
              <div className="acc-tag-row">
                <span className="badge-god">NETFLIX GOD</span>
                <span className="badge-provider">Gmail IMAP 993 (TLS)</span>
              </div>
            </div>
          </div>
          <div className="acc-counter">
            <div className="acc-counter-num">{messages.length}</div>
            <div className="acc-counter-label">Pesan</div>
          </div>
        </div>

        {/* Highlighted Latest OTP Hero Banner */}
        {latestOtpMessage && (
          <div className="otp-hero-card">
            <div className="otp-hero-head">
              <span className="otp-hero-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Kode Verifikasi / OTP Terdeteksi
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {formatTime(latestOtpMessage.receivedAt)}
              </span>
            </div>

            <div className="otp-hero-body">
              <div className="otp-code-huge">{latestOtpMessage.otp}</div>
              <button
                type="button"
                className="otp-copy-btn"
                onClick={() => copyToClipboard(latestOtpMessage.otp)}
              >
                {copiedOtp ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Tersalin!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Salin Kode
                  </>
                )}
              </button>
            </div>

            <div className="otp-hero-foot">
              <span>
                Pengirim: <strong>{latestOtpMessage.fromName || latestOtpMessage.from}</strong>
              </span>
              <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {latestOtpMessage.subject}
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '14px',
              padding: '12px 16px',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchEmails(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="email-search-wrapper">
          <svg
            className="email-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="email-search-input"
            placeholder="Cari email, pengirim, subjek, atau kode OTP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Email Messages List */}
        <div className="email-list">
          {isLoading && messages.length === 0 ? (
            <div className="loading-box">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00c48c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="spin-icon"
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              <span>Mengambil kotak masuk dari imap.gmail.com...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? 'Tidak ada email yang cocok dengan pencarian.' : 'Kotak masuk kosong.'}
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`email-item-card ${msg.otp ? 'has-otp' : ''}`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="email-item-header">
                  <span className="email-sender-name">
                    {msg.fromName || msg.from}
                  </span>
                  <span className="email-time-tag">
                    {formatTime(msg.receivedAt)}
                  </span>
                </div>

                <div className="email-subject">{msg.subject}</div>

                <div className="email-preview-snippet">{msg.preview}</div>

                {msg.otp && (
                  <div className="email-card-tags">
                    <span
                      className="card-otp-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(msg.otp, true, msg.id);
                      }}
                      title="Klik untuk salin OTP"
                    >
                      OTP: {msg.otp}
                      <span style={{ fontSize: '10px', color: '#38bdf8', marginLeft: '4px' }}>
                        {copiedCardOtp === msg.id ? '✓ Tersalin' : '📋 Salin'}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div
          className="email-modal-overlay"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="email-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="email-modal-header">
              <div className="email-modal-meta">
                <h2>{selectedMessage.subject}</h2>
                <div className="email-modal-submeta">
                  <span>Dari: <strong>{selectedMessage.from}</strong></span>
                  <span>·</span>
                  <span>{new Date(selectedMessage.receivedAt).toLocaleString('id-ID')}</span>
                  {selectedMessage.otp && (
                    <span
                      style={{
                        background: 'rgba(0, 196, 140, 0.2)',
                        color: '#00c48c',
                        padding: '1px 8px',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}
                    >
                      OTP: {selectedMessage.otp}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="email-modal-close"
                onClick={() => setSelectedMessage(null)}
              >
                ✕
              </button>
            </div>

            <div className="email-modal-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${viewTab === 'html' ? 'active' : ''}`}
                onClick={() => setViewTab('html')}
              >
                Format Asli (HTML)
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${viewTab === 'text' ? 'active' : ''}`}
                onClick={() => setViewTab('text')}
              >
                Teks Bersih
              </button>
            </div>

            <div className="email-modal-body">
              {viewTab === 'html' && selectedMessage.html ? (
                <iframe
                  className="email-html-iframe"
                  srcDoc={selectedMessage.html}
                  sandbox="allow-same-origin"
                  title="Pratinjau Email"
                />
              ) : (
                <div className="email-text-content">
                  {selectedMessage.text || selectedMessage.preview || '(Pesan kosong)'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
