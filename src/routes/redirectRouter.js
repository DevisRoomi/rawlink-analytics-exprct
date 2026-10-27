const express = require('express');
const db = require('../db/database');
const { parseUserAgent, hashIp } = require('../utils/uaParser');

const router = express.Router();

const findLinkStmt = db.prepare('SELECT * FROM links WHERE code = ? LIMIT 1');
const insertClickStmt = db.prepare(`
  INSERT INTO clicks (
    link_id, code, clicked_at, ip_hash, user_agent, browser, browser_version, os, device_type, referrer
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateLinkCountStmt = db.prepare(`
  UPDATE links SET click_count = click_count + 1, last_clicked_at = ? WHERE id = ?
`);

router.get('/:code', (req, res) => {
  const code = req.params.code;

  // Ignore internal assets/favicons
  if (code === 'favicon.ico' || code === 'robots.txt' || code === 'api') {
    return res.status(404).send('Not Found');
  }

  const link = findLinkStmt.get(code);

  if (!link) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>RAWLINK // 404 TAUTAN TIDAK DITEMUKAN</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; }
          body { background: #f4f4f0; color: #000; padding: 40px 20px; line-height: 1.5; }
          .card { max-width: 600px; margin: 40px auto; border: 2px solid #000; background: #fff; padding: 24px; box-shadow: 6px 6px 0px #000; }
          .header { font-weight: bold; font-size: 20px; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
          .code-box { background: #eee; border: 1px solid #000; padding: 8px; margin: 12px 0; font-size: 14px; word-break: break-all; }
          .btn { display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 8px 16px; margin-top: 16px; font-weight: bold; border: 2px solid #000; }
          .btn:hover { background: #fff; color: #000; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">[STATUS: 404] TAUTAN TIDAK DITEMUKAN</div>
          <p>Kode tautan berikut tidak terdaftar dalam basis data RawLink:</p>
          <div class="code-box">KODE: ${code}</div>
          <p>Tautan mungkin telah dihapus oleh pemilik atau salah ketik.</p>
          <a class="btn" href="/">&larr; KEMBALI KE TERMINAL RAWLINK</a>
        </div>
      </body>
      </html>
    `);
  }

  // Record click event
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipHashed = hashIp(rawIp);
    const userAgentRaw = req.headers['user-agent'] || 'Unknown';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';
    const uaParsed = parseUserAgent(userAgentRaw);
    const nowIso = new Date().toISOString();

    insertClickStmt.run(
      link.id,
      link.code,
      nowIso,
      ipHashed,
      userAgentRaw,
      uaParsed.browser,
      uaParsed.browser_version,
      uaParsed.os,
      uaParsed.device_type,
      referrer
    );

    updateLinkCountStmt.run(nowIso, link.id);
  } catch (err) {
    console.error('[RawLink Clicks] Gagal mencatat analitik:', err.message);
  }

  // Redirect to destination
  let destination = link.original_url;
  if (!/^https?:\/\//i.test(destination)) {
    destination = 'http://' + destination;
  }

  res.redirect(302, destination);
});

module.exports = router;
