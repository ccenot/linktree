import React, { useState, useEffect } from 'react';
import './DonatePage.css';

const API_BASE = 'https://kasir.notnot.store';

const PRESET_AMOUNTS = [
  { label: 'Rp 5.000', value: 5000 },
  { label: 'Rp 10.000', value: 10000, tag: 'Populer' },
  { label: 'Rp 25.000', value: 25000 },
  { label: 'Rp 50.000', value: 50000 },
  { label: 'Rp 100.000', value: 100000 }
];

export default function DonatePage({ onBack }) {
  const [name, setName] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/public/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonim',
          amount: finalAmount,
          message: message.trim(),
          mediaUrl: mediaUrl.trim()
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
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Media Share (Opsional)</label>
                  <span className="optional-tag">YouTube</span>
                </div>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="form-input"
                />
                <span className="input-hint">Video bakal otomatis keputar di layar stream penonton.</span>
              </div>

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
