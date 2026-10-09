import React, { useState, useEffect, useRef } from 'react';
import './OverlayPage.css';

const API_BASE = 'https://kasir.notnot.store';

// Helper to extract YouTube Video ID
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

// Play modern synth chime using Web Audio API (zero external assets needed)
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    const playTone = (freq, time, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    };

    playTone(523.25, now, 0.4);       // C5
    playTone(659.25, now + 0.12, 0.4); // E5
    playTone(783.99, now + 0.24, 0.5); // G5
    playTone(1046.50, now + 0.36, 0.8);// C6
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}

// Speak TTS message in Indonesian
function speakTTS(text) {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('TTS failed:', e);
  }
}

export default function OverlayPage() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const isProcessingRef = useRef(false);

  // Isolate transparent background only when on overlay route
  useEffect(() => {
    document.documentElement.classList.add('is-overlay');
    document.body.classList.add('is-overlay');

    return () => {
      document.documentElement.classList.remove('is-overlay');
      document.body.classList.remove('is-overlay');
    };
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    let evtSource = null;

    const connect = () => {
      evtSource = new EventSource(`${API_BASE}/api/public/overlay/events`);

      evtSource.onopen = () => {
        setIsConnected(true);
        console.log('[OBS Overlay] Connected to SSE');
      };

      evtSource.addEventListener('donation', (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log('[OBS Overlay] Received donation:', data);
          setQueue(prev => [...prev, data]);
        } catch (err) {
          console.error('[OBS Overlay] Error parsing donation event:', err);
        }
      });

      evtSource.onerror = () => {
        setIsConnected(false);
        evtSource.close();
        setTimeout(connect, 4000); // Reconnect
      };
    };

    connect();
    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  // Process Queue
  useEffect(() => {
    if (!activeAlert && queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setActiveAlert(next);
    }
  }, [queue, activeAlert]);

  // Alert Timer & Sound
  useEffect(() => {
    if (!activeAlert) return;

    // Play chime
    playChime();

    // Prepare speech text
    const ttsText = activeAlert.message 
      ? `${activeAlert.donatorName} menyawer Rp ${activeAlert.amount.toLocaleString('id-ID')}. Pesan: ${activeAlert.message}`
      : `${activeAlert.donatorName} menyawer Rp ${activeAlert.amount.toLocaleString('id-ID')}!`;

    // Speak after chime starts
    const ttsTimer = setTimeout(() => {
      speakTTS(ttsText);
    }, 600);

    // Duration: compact test alert (8s), normal video (15s), text only (9s)
    const ytId = getYouTubeId(activeAlert.mediaUrl);
    const isTest = Boolean(activeAlert.id && String(activeAlert.id).startsWith('TEST-'));
    const displayDuration = isTest ? 8000 : (ytId ? 15000 : 9000);

    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, displayDuration);

    return () => {
      clearTimeout(ttsTimer);
      clearTimeout(timer);
    };
  }, [activeAlert]);

  const ytVideoId = activeAlert ? getYouTubeId(activeAlert.mediaUrl) : null;

  return (
    <div className="overlay-viewport">
      {/* POPUP ALERT CONTAINER */}
      {activeAlert && (
        <div className="alert-card-container animate-slide-in">
          
          {/* Main Donation Card */}
          <div className="alert-card">
            <div className="alert-coin-bubble">
              <span className="coin-icon">💰</span>
            </div>

            <div className="alert-body">
              <div className="alert-headline">
                <span className="donator-name">{activeAlert.donatorName}</span>
                <span className="action-text">menyawer</span>
                <span className="amount-badge">Rp {activeAlert.amount.toLocaleString('id-ID')}</span>
              </div>

              {activeAlert.message && (
                <div className="alert-message-box">
                  <p className="alert-message-text">"{activeAlert.message}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Media Share Video Player (if YouTube attached) */}
          {ytVideoId && (
            <div className="media-player-box animate-fade-in">
              <div className="media-header">
                <span className="media-tag">MEDIA SHARE BY {activeAlert.donatorName}</span>
              </div>
              <iframe
                className="media-iframe"
                src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&controls=0&mute=0`}
                title="Donation Media"
                allow="autoplay; encrypted-media"
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
}
