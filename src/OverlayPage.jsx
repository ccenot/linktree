import React, { useState, useEffect, useRef } from 'react';
import './OverlayPage.css';
import FlyingCoinIcon from './FlyingCoinIcon';

const API_BASE = 'https://kasir.notnot.store';

// Helper to extract YouTube Video ID and start time
function parseYouTubeUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (!match) return null;
  const videoId = match[1];

  let startSec = 0;
  const tMatch = url.match(/[?&](?:t|start)=([^&#]+)/);
  if (tMatch) {
    const val = tMatch[1];
    if (/^\d+$/.test(val)) {
      startSec = parseInt(val, 10);
    } else {
      const hours = (val.match(/(\d+)h/) || [])[1] || 0;
      const mins = (val.match(/(\d+)m/) || [])[1] || 0;
      const secs = (val.match(/(\d+)s/) || [])[1] || 0;
      startSec = parseInt(hours, 10) * 3600 + parseInt(mins, 10) * 60 + parseInt(secs, 10);
    }
  }

  return { videoId, startSec: Math.max(0, startSec) };
}

function formatMediaTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
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

  const [settings, setSettings] = useState({
    secPerThousand: 3,
    maxDurationSec: 900
  });

  // Fetch settings from server
  useEffect(() => {
    fetch(`${API_BASE}/api/public/donation-settings`)
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

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

    // Duration: compact test alert (8s), dynamic video duration based on donation (capped at max), text only (9s)
    const ytData = parseYouTubeUrl(activeAlert.mediaUrl);
    const isTest = Boolean(activeAlert.id && String(activeAlert.id).startsWith('TEST-'));
    
    let displayDuration = 9000;
    if (isTest) {
      displayDuration = 8000;
    } else if (ytData) {
      const calculatedSec = Math.floor((activeAlert.amount / 1000) * (settings.secPerThousand || 3));
      const videoSec = activeAlert.durationSec 
        ? activeAlert.durationSec 
        : Math.max(5, Math.min(settings.maxDurationSec || 900, calculatedSec));
      displayDuration = videoSec * 1000;
    }

    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, displayDuration);

    return () => {
      clearTimeout(ttsTimer);
      clearTimeout(timer);
    };
  }, [activeAlert, settings]);

  const ytData = activeAlert ? parseYouTubeUrl(activeAlert.mediaUrl) : null;
  const currentDurationSec = activeAlert
    ? (activeAlert.durationSec || Math.max(5, Math.min(settings.maxDurationSec || 900, Math.floor((activeAlert.amount / 1000) * (settings.secPerThousand || 3)))))
    : 10;
  const endSec = ytData ? ytData.startSec + currentDurationSec : 0;

  return (
    <div className="overlay-viewport">
      {/* POPUP ALERT CONTAINER */}
      {activeAlert && (
        <div className="alert-card-container animate-slide-in">
          
          {/* Main Donation Card */}
          <div className="alert-card">
            <div className="alert-coin-bubble">
              <FlyingCoinIcon size={46} />
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
          {ytData && (
            <div className="media-player-box animate-fade-in">
              <div className="media-header">
                <span className="media-tag">
                  MEDIA SHARE BY {activeAlert.donatorName} ({formatMediaTime(ytData.startSec)} - {formatMediaTime(endSec)})
                </span>
              </div>
              <iframe
                className="media-iframe"
                src={`https://www.youtube-nocookie.com/embed/${ytData.videoId}?start=${ytData.startSec}&end=${endSec}&autoplay=1&controls=0&mute=0`}
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
