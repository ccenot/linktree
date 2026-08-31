// src/JoinNetwork.jsx
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import './JoinNetwork.css';

// SVG Icons for Platforms
const AppleIcon = () => (
  <svg className="platform-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg className="platform-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3l1.816 3.146a.5.5 0 1 1-.866.5l-1.838-3.185a8.966 8.966 0 0 1-9.27 0l-1.838 3.185a.5.5 0 0 1-.866-.5L6.477 15.3A9 9 0 0 1 3 7.556h18a9 9 0 0 1-3.477 7.744zM7 10.056a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

const WindowsIcon = () => (
  <svg className="platform-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/>
  </svg>
);

export default function JoinNetwork({ onBack }) {
  const [nwid, setNwid] = useState('76fc96e49815492c');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract network ID from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('nwid');
    if (id && /^[0-9A-Fa-f]{16}$/.test(id)) {
      setNwid(id);
    }
  }, []);

  const targetUrl = `https://joinzt.com/addnetwork?nwid=${nwid}&v=1`;

  // Generate QR Code data URL
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0e0e11',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [targetUrl]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(nwid)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy network ID:', err));
  };

  return (
    <div className="join-network-container">
      {/* Background ambient glows */}
      <div className="join-glow-1"></div>
      <div className="join-glow-2"></div>

      <div className="join-content">
        <h1 className="join-title">Join ke NOTNOT SERVER</h1>
        <p className="join-subtitle">
          Use your phone camera to join this Not Gang network.
        </p>

        <div className="join-card">
          {/* QR Code Wrapper with active scanning line */}
          <div className="qr-container">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="ZeroTier QR Code" className="qr-image" />
            ) : (
              <div style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>
                Generating QR...
              </div>
            )}
            <div className="qr-scanner-line"></div>
          </div>

          {/* Network ID display & Copy */}
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '8px' }}>
            <span className="nwid-label">Network ID</span>
          </div>
          <div className="nwid-box" onClick={handleCopy} title="Copy Network ID">
            <span className="nwid-value">{nwid}</span>
            <button className="copy-btn">
              {copied ? (
                <span className="copied-tooltip">Copied!</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>

          <p className="trust-disclaimer">
            Only use this if it was sent from someone you trust.
          </p>

          {/* Actions */}
          <div className="action-buttons">
            <a 
              href={targetUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Join Directly on Phone
            </a>

            <button onClick={onBack} className="btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Kembali
            </button>
          </div>
        </div>

        {/* Tutorial Section */}
        <div className="tutorial-section">
          <h2 className="tutorial-header">Cara Join</h2>
          
          {/* Steps Grid */}
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-text">Download Apps</div>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-text">Join lewat scan</div>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-text">Happy Gaming</div>
            </div>
          </div>

          {/* Download Platforms Table */}
          <h2 className="tutorial-header" style={{ marginTop: '16px' }}>Unduh ZeroTier</h2>
          <div className="download-table-container">
            <table className="download-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="platform-cell">
                      <AppleIcon />
                      iOS
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <a 
                      href="https://apps.apple.com/us/app/zerotier-one/id1084101492"
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="download-btn"
                    >
                      Unduh
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="platform-cell">
                      <AndroidIcon />
                      Android
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.zerotier.one&pcampaignid=web_share"
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="download-btn"
                    >
                      Unduh
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="platform-cell">
                      <WindowsIcon />
                      Windows
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <a 
                      href="https://download.zerotier.com/dist/ZeroTier%20One.msi"
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="download-btn"
                    >
                      Unduh
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
