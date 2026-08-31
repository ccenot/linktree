import React, { useState, useEffect, useRef } from 'react';
import './SpinWheel.css';

// Predefined Themes for the Wheel segments (zero green/teal colors to avoid OBS chroma key transparency)
const THEMES = {
  neon: ['#ff0055', '#9900ff', '#ffcc00', '#ff6600', '#0099ff', '#ff00cc'],
  pastel: ['#ffb3ba', '#bae1ff', '#ffffba', '#ffdfba', '#e8bcf0', '#ffd3b6'],
  classic: ['#e11d48', '#2563eb', '#ca8a04', '#7c3aed', '#ea580c', '#0284c7'],
  dark: ['#1e1b4b', '#311042', '#0f172a', '#4c1d95', '#581c87', '#7c2d12'],
};

// Web Audio API Synthesizer for high-quality standalone sound effects
class WheelAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick(volume = 0.5) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // High frequency decay for a crisp wooden click sound
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playWin(volume = 0.5) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Arpeggio of major scale chimes for victory celebration
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Add a slight frequency modulation for a magical vibe
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + idx * 0.08 + 0.4);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(volume * 0.2, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.61);
    });
  }
}

const audioSynth = new WheelAudio();

export default function SpinWheel({ onBack }) {
  const [entriesText, setEntriesText] = useState(
    'Anya\nBudi\nCici\nDedi\nEuis\nFajar\nGita\nHadi'
  );
  const [theme, setTheme] = useState('neon');
  const [spinDuration, setSpinDuration] = useState(5); // in seconds
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(60); // 0-100
  
  // State for winner celebration
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [greenScreenEnabled, setGreenScreenEnabled] = useState(false);


  const canvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const confettiFrameRef = useRef(null);
  
  // Physics & Spin variables stored in refs to avoid React re-renders interrupting the loop
  const spinState = useRef({
    angle: 0,
    angularVelocity: 0,
    isSpinning: false,
    durationMs: 5000,
    startTime: 0,
    startAngle: 0,
    targetAngle: 0,
    lastTickIndex: -1,
  });

  const parsedEntries = entriesText
    .split('\n')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  // Override body styling to be full-screen for the spin wheel page
  useEffect(() => {
    document.body.classList.add('spin-body-override');
    return () => {
      document.body.classList.remove('spin-body-override');
    };
  }, []);

  // Redraw the wheel whenever entries or theme changes
  useEffect(() => {
    drawWheel();
  }, [entriesText, theme]);

  // Handle canvas sizing and high-DPI scaling
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual canvas drawing size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    ctx.clearRect(0, 0, width, height);

    const segments = parsedEntries;
    const numSegments = segments.length;

    if (numSegments === 0) {
      // Empty Wheel State
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 15px Outfit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Masukkan entri nama di kanan', centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / numSegments;
    const colors = THEMES[theme];

    // Current angle from physics
    const startAngleOffset = spinState.current.angle;

    for (let i = 0; i < numSegments; i++) {
      const angle = startAngleOffset + i * arcSize;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Fine border between segments
      ctx.strokeStyle = 'rgba(12, 11, 20, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw rotated Text inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      // Rotate to center of the slice
      ctx.rotate(angle + arcSize / 2);

      // Calculate font size dynamically based on slice width at the outer rim (fills slice but doesn't overflow)
      const sliceWidthAtRim = radius * arcSize;
      let fontSize = Math.floor(sliceWidthAtRim * 0.58);
      
      if (numSegments <= 4) {
        fontSize = Math.min(52, fontSize);
      } else if (numSegments <= 8) {
        fontSize = Math.min(42, fontSize);
      } else if (numSegments <= 16) {
        fontSize = Math.min(30, fontSize);
      } else {
        fontSize = Math.max(11, Math.min(22, fontSize));
      }

      ctx.fillStyle = '#ffffff';
      // Add subtle text shadow/glow for Neon theme
      if (theme === 'neon') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
      }
      ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Trim name if it's too long
      let text = segments[i];
      const maxLen = Math.max(10, Math.floor(60 / fontSize));
      if (text.length > maxLen) {
        text = text.substring(0, maxLen - 2) + '...';
      }

      // Draw text near outer rim
      ctx.fillText(text, radius - 20, 0);
      ctx.restore();
    }

    // Outer ring border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 6;
    ctx.stroke();
  };

  // Main Spinning Loop using cubic ease-out physics
  const animateSpin = (timestamp) => {
    const state = spinState.current;
    if (!state.isSpinning) return;

    if (!state.startTime) state.startTime = timestamp;
    const elapsed = timestamp - state.startTime;

    if (elapsed >= state.durationMs) {
      // Wheel has stopped
      state.isSpinning = false;
      state.angle = state.targetAngle;
      setIsSpinning(false);
      drawWheel();
      
      // Determine the winner
      const numSegments = parsedEntries.length;
      const arcSize = (2 * Math.PI) / numSegments;
      
      // Pointer is at 0 rad (right side) in default coordinates.
      // The slice that lands at the pointer is:
      // normalized_angle = (2*PI - (finalAngle % 2*PI)) % 2*PI
      const normalizedAngle = (2 * Math.PI - (state.angle % (2 * Math.PI))) % (2 * Math.PI);
      const winnerIndex = Math.floor(normalizedAngle / arcSize) % numSegments;
      const winnerName = parsedEntries[winnerIndex];

      setWinner(winnerName);
      setShowWinnerModal(true);

      if (soundEnabled) {
        audioSynth.playWin(volume / 100);
      }
      
      // Launch confetti
      startConfetti();
      return;
    }

    // Easing factor: cubic ease-out
    const t = elapsed / state.durationMs;
    const easeOutFactor = 1 - Math.pow(1 - t, 3); // 1 to 0 decelerating
    
    // Interpolated angle
    state.angle = state.startAngle + (state.targetAngle - state.startAngle) * easeOutFactor;

    // Trigger tick sound based on slice passing the pointer (0 rad)
    const numSegments = parsedEntries.length;
    if (numSegments > 0) {
      const arcSize = (2 * Math.PI) / numSegments;
      const normalizedAngle = (2 * Math.PI - (state.angle % (2 * Math.PI))) % (2 * Math.PI);
      const currentSegmentIndex = Math.floor(normalizedAngle / arcSize) % numSegments;
      
      if (currentSegmentIndex !== state.lastTickIndex) {
        state.lastTickIndex = currentSegmentIndex;
        if (soundEnabled) {
          audioSynth.playTick(volume / 100);
        }
      }
    }

    drawWheel();
    animationFrameRef.current = requestAnimationFrame(animateSpin);
  };

  const handleSpinClick = () => {
    if (isSpinning || parsedEntries.length === 0) return;

    // Initialize/resume AudioContext on first user interaction
    audioSynth.init();

    const minRotations = 5;
    const maxRotations = 9;
    const totalRotation = (minRotations + Math.random() * (maxRotations - minRotations)) * 2 * Math.PI;

    const state = spinState.current;
    state.isSpinning = true;
    state.startTime = 0;
    state.startAngle = state.angle % (2 * Math.PI);
    state.targetAngle = state.startAngle + totalRotation;
    state.durationMs = spinDuration * 1000;
    state.lastTickIndex = -1;

    setIsSpinning(true);
    animationFrameRef.current = requestAnimationFrame(animateSpin);
  };

  // Quick action: Shuffle list
  const handleShuffle = () => {
    if (isSpinning) return;
    const shuffled = [...parsedEntries].sort(() => Math.random() - 0.5);
    setEntriesText(shuffled.join('\n'));
  };

  // Quick action: Sort list alphabetically
  const handleSort = () => {
    if (isSpinning) return;
    const sorted = [...parsedEntries].sort((a, b) => a.localeCompare(b));
    setEntriesText(sorted.join('\n'));
  };

  // Quick action: Clear entries
  const handleClear = () => {
    if (isSpinning) return;
    setEntriesText('');
  };

  // Quick action: Reset to default
  const handleReset = () => {
    if (isSpinning) return;
    setEntriesText('Anya\nBudi\nCici\nDedi\nEuis\nFajar\nGita\nHadi');
  };

  // Remove winner from the list and close modal
  const handleRemoveWinner = () => {
    const newEntries = parsedEntries.filter((e) => e !== winner);
    setEntriesText(newEntries.join('\n'));
    closeWinnerModal();
  };

  const closeWinnerModal = () => {
    setShowWinnerModal(false);
    stopConfetti();
  };

  // High Performance Canvas Confetti Particle System
  const confettiParticles = useRef([]);
  
  const startConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#f87171'];
    const particles = [];
    
    // Spawn 150 particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
      });
    }
    
    confettiParticles.current = particles;

    const drawConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let alive = false;
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.tilt = Math.sin(p.tiltAngle - p.r/2) * 15;

        if (p.y <= canvas.height) {
          alive = true;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (alive) {
        confettiFrameRef.current = requestAnimationFrame(drawConfetti);
      }
    };

    drawConfetti();
  };

  const stopConfetti = () => {
    if (confettiFrameRef.current) {
      cancelAnimationFrame(confettiFrameRef.current);
    }
    const canvas = confettiCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    confettiParticles.current = [];
  };

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (confettiFrameRef.current) cancelAnimationFrame(confettiFrameRef.current);
    };
  }, []);

  return (
    <div className={`spin-page-container ${greenScreenEnabled ? 'green-screen-active' : ''}`}>
      <div className="spin-ambient-1"></div>
      <div className="spin-ambient-2"></div>

      {/* Confetti canvas */}
      <canvas ref={confettiCanvasRef} className="spin-confetti-canvas" />

      {/* Navbar Section */}
      <nav className="spin-navbar">
        <div className="spin-logo-section">
          <span className="spin-logo-icon">🎡</span>
          <span className="spin-logo-text">Gacha Wheel</span>
        </div>
        <button onClick={onBack} className="spin-back-btn">
          ← Beranda
        </button>
      </nav>

      {/* Main App Layout */}
      <main className="spin-main-layout">
        
        {/* Left Side: Wheel */}
        <section className="spin-wheel-section">
          <div className="spin-wheel-wrapper">
            <div className="spin-pointer" />
            <canvas 
              ref={canvasRef} 
              className="spin-canvas" 
              onClick={handleSpinClick}
              style={{ cursor: isSpinning ? 'not-allowed' : 'pointer' }}
            />
            <div className="spin-center-pin" onClick={handleSpinClick} title="Klik untuk memutar roda!" />
          </div>
          <div className="spin-play-hint">
            {isSpinning ? 'Memutar...' : 'Klik RODA atau PIN TENGAH untuk memutar!'}
          </div>
        </section>

        {/* Right Side: Sidebar Panels */}
        <section className="spin-sidebar">
          
          {/* Entries Input Box */}
          <div className="spin-card">
            <h3 className="spin-card-title">📝 Daftar Entri</h3>
            <textarea
              className="spin-textarea"
              value={entriesText}
              onChange={(e) => !isSpinning && setEntriesText(e.target.value)}
              placeholder="Masukkan satu nama per baris..."
              disabled={isSpinning}
            />
            <div className="spin-controls-row">
              <button className="spin-btn-action" onClick={handleShuffle} disabled={isSpinning}>
                <span>🔀</span> Acak
              </button>
              <button className="spin-btn-action" onClick={handleSort} disabled={isSpinning}>
                <span>🔤</span> Urut
              </button>
              <button className="spin-btn-action" onClick={handleClear} disabled={isSpinning}>
                <span>🗑️</span> Hapus
              </button>
              <button className="spin-btn-action" onClick={handleReset} disabled={isSpinning}>
                <span>🔄</span> Reset
              </button>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="spin-card">
            <h3 className="spin-card-title">⚙️ Pengaturan Roda</h3>
            
            {/* Theme Select */}
            <div className="spin-form-group">
              <label className="spin-label">Tema Warna</label>
              <select
                className="spin-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled={isSpinning}
              >
                <option value="neon">Neon Vibe (Glow)</option>
                <option value="pastel">Pastel Sweet</option>
                <option value="classic">Retro Classic</option>
                <option value="dark">Stealth Dark</option>
              </select>
            </div>

            {/* Spin Duration Range */}
            <div className="spin-form-group">
              <label className="spin-label">Durasi Putaran (Detik)</label>
              <div className="spin-range-group">
                <input
                  type="range"
                  className="spin-range"
                  min="3"
                  max="15"
                  step="1"
                  value={spinDuration}
                  onChange={(e) => setSpinDuration(Number(e.target.value))}
                  disabled={isSpinning}
                />
                <span className="spin-range-value">{spinDuration}s</span>
              </div>
            </div>

            {/* Sound Toggle & Volume */}
            <div className="spin-form-group">
              <div className="spin-switch-group">
                <label className="spin-label">Suara Roda (SFX)</label>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  style={{ accentColor: '#8b5cf6', cursor: 'pointer' }}
                />
              </div>
              {soundEnabled && (
                <div className="spin-range-group" style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Vol</span>
                  <input
                    type="range"
                    className="spin-range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                  <span className="spin-range-value">{volume}%</span>
                </div>
              )}
            </div>

            {/* Green Screen Switch */}
            <div className="spin-form-group" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '12px' }}>
              <div className="spin-switch-group">
                <label className="spin-label" style={{ color: greenScreenEnabled ? '#00ff00' : '#9ca3af', fontWeight: 'bold' }}>
                  🟢 Greenscreen Mode
                </label>
                <input
                  type="checkbox"
                  checked={greenScreenEnabled}
                  onChange={(e) => setGreenScreenEnabled(e.target.checked)}
                  style={{ accentColor: '#00ff00', cursor: 'pointer' }}
                />
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Winner Celebration Modal */}
      {showWinnerModal && (
        <div className="spin-modal-overlay">
          <div className="spin-modal-content">
            <h4 className="spin-modal-title">🎉 Selamat Kepada 🎉</h4>
            <h1 className="spin-modal-winner">{winner}</h1>
            <div className="spin-modal-actions">
              <button className="spin-btn-primary" onClick={closeWinnerModal}>
                Mantap!
              </button>
              <button className="spin-btn-secondary" onClick={handleRemoveWinner}>
                Hapus & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
