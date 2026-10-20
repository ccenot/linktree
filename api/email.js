import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

function extractOtp(subject, bodyText) {
  const combined = `${subject || ''} \n ${bodyText || ''}`;
  
  // 1. Context keyword match
  const kw = combined.match(/(?:code|kode|otp|verification(?:\s*code)?|security\s*code|pin|token|sandi|konfirmasi)\s*(?:is|adalah|:|=|-)?\s*[:=]?\s*([0-9]{4,8})/i);
  if (kw && kw[1]) {
    const val = kw[1];
    const n = parseInt(val, 10);
    if (!(val.length === 4 && n >= 1970 && n <= 2035 && !/(?:code|kode|otp|pin)/i.test(kw[0]))) {
      return val;
    }
  }

  // 2. Trailing pattern: e.g. "335304 is your verification code"
  const trailing = combined.match(/\b([0-9]{4,8})\b\s*(?:is\s+(?:your\s+)?(?:verification|login|security|confirmation)?\s*code|adalah\s+kode)/i);
  if (trailing && trailing[1]) {
    return trailing[1];
  }

  // 3. "Enter / Masukkan [code]"
  const enterMatch = combined.match(/(?:enter|masukkan)\s*([0-9]{4,8})\b/i);
  if (enterMatch && enterMatch[1]) {
    return enterMatch[1];
  }

  // 4. Standalone 6-digit code in SUBJECT line only
  if (subject) {
    const subMatch = subject.match(/\b([0-9]{6})\b/);
    if (subMatch && subMatch[1]) {
      return subMatch[1];
    }
  }

  return null;
}

async function fetchDirectGmail(top = 25) {
  const config = {
    imap: {
      user: 'notcloud693@gmail.com',
      password: 'ocujxebyxwauzpjk',
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    }
  };

  const connection = await imaps.connect(config);
  try {
    const box = await connection.openBox('INBOX');
    const total = box.messages?.total || 0;
    if (total === 0) return [];

    const fetchLimit = Math.min(top || 25, 30);
    const startSeq = Math.max(1, total - fetchLimit + 1);

    const f = connection.imap.seq.fetch(`${startSeq}:${total}`, {
      bodies: [''],
      struct: true
    });

    const rawList = [];
    f.on('message', (msg) => {
      let body = '';
      let attrs = null;
      msg.on('body', (stream) => {
        stream.on('data', (chunk) => { body += chunk.toString('utf8'); });
      });
      msg.on('attributes', (a) => { attrs = a; });
      msg.on('end', () => {
        rawList.push({ body, attrs });
      });
    });

    await new Promise((resolve, reject) => {
      f.once('error', reject);
      f.once('end', resolve);
    });

    const parsedMessages = await Promise.all(rawList.map(async (item) => {
      try {
        const parsed = await simpleParser(item.body);
        const fullText = parsed.text || '';
        const fullHtml = typeof parsed.html === 'string' ? parsed.html : '';
        const previewText = fullText || fullHtml.replace(/<[^>]+>/g, ' ') || '';
        const subject = parsed.subject || '(Tanpa Subjek)';
        const from = parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown';
        const fromName = parsed.from?.value?.[0]?.name || '';
        const receivedAt = parsed.date ? parsed.date.toISOString() : (item.attrs?.date ? new Date(item.attrs.date).toISOString() : new Date().toISOString());
        const otp = extractOtp(subject, fullText || previewText);

        return {
          id: 'gmail_' + (item.attrs?.uid || Date.now() + Math.random()),
          from,
          fromName,
          subject,
          preview: previewText.replace(/\s+/g, ' ').trim().slice(0, 160),
          text: fullText || previewText,
          html: fullHtml,
          receivedAt,
          otp
        };
      } catch (err) {
        return null;
      }
    }));

    const validMessages = parsedMessages.filter(Boolean);
    validMessages.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
    return validMessages;
  } finally {
    try {
      connection.end();
    } catch (e) {}
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get PIN from body, query, or authorization header
  let pin = '';
  if (req.body && typeof req.body === 'object') {
    pin = req.body.pin || '';
  } else if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      pin = parsed.pin || '';
    } catch (e) {}
  }
  if (!pin && req.query) {
    pin = req.query.pin || '';
  }

  if (String(pin).trim() !== '6969') {
    return res.status(401).json({ success: false, error: 'PIN salah! Masukkan PIN yang benar.' });
  }

  // 1. Try Home Server proxy first (reliable residential IP)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const upstreamRes = await fetch('https://home-server.notnot.store/api/public/email-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '6969', top: 25 }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      return res.status(200).json(data);
    }
  } catch (upstreamErr) {
    console.warn('Home server proxy fallback to direct IMAP:', upstreamErr.message);
  }

  // 2. Direct IMAP Fallback
  try {
    const messages = await fetchDirectGmail(25);
    const firstOtp = messages.find(m => m.otp)?.otp || null;
    return res.status(200).json({
      success: true,
      provider: 'gmail',
      email: 'notcloud693@gmail.com',
      firstOtp,
      count: messages.length,
      messages
    });
  } catch (directErr) {
    console.error('Direct IMAP failed:', directErr);
    return res.status(500).json({
      success: false,
      error: 'Gagal menghubungkan ke Gmail: ' + directErr.message
    });
  }
}
