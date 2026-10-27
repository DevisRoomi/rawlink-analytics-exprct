const express = require('express');
const db = require('../db/database');
const { generateSlug, sanitizeCustomSlug } = require('../utils/slug');

const router = express.Router();

// Prepared statements for high performance
const getAllLinksStmt = db.prepare(`
  SELECT id, code, original_url, title, click_count, created_at, last_clicked_at
  FROM links
  ORDER BY id DESC
`);

const getLinkByCodeStmt = db.prepare(`
  SELECT * FROM links WHERE code = ? LIMIT 1
`);

const insertLinkStmt = db.prepare(`
  INSERT INTO links (code, original_url, title, created_at)
  VALUES (?, ?, ?, ?)
`);

const deleteLinkStmt = db.prepare(`
  DELETE FROM links WHERE code = ?
`);

const getClicksForLinkStmt = db.prepare(`
  SELECT id, code, clicked_at, ip_hash, browser, browser_version, os, device_type, referrer, user_agent
  FROM clicks
  WHERE code = ?
  ORDER BY id DESC
  LIMIT 150
`);

const getGlobalStatsStmt = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM links) as total_links,
    (SELECT COALESCE(SUM(click_count), 0) FROM links) as total_clicks
`);

// 1. GET /api/links — List all shortened links
router.get('/links', (req, res) => {
  try {
    const links = getAllLinksStmt.all();
    res.json({
      status: 'ok',
      total: links.length,
      data: links,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data tautan: ' + err.message });
  }
});

// 2. POST /api/links — Create new short link
router.post('/links', (req, res) => {
  try {
    const { original_url, custom_slug, title } = req.body || {};

    if (!original_url || typeof original_url !== 'string') {
      return res.status(400).json({ error: 'URL tujuan wajib diisi.' });
    }

    const trimmedUrl = original_url.trim();

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
    if (!urlPattern.test(trimmedUrl) && !/^https?:\/\/localhost(:\d+)?/i.test(trimmedUrl)) {
      return res.status(400).json({
        error: 'Format URL tidak valid. Gunakan format standar seperti https://example.com atau localhost.',
      });
    }

    let code = '';
    if (custom_slug) {
      const sanitized = sanitizeCustomSlug(custom_slug);
      if (sanitized.length < 3) {
        return res.status(400).json({ error: 'Slug kustom minimal 3 karakter (huruf/angka/tanda hubung).' });
      }

      // Check if taken
      const existing = getLinkByCodeStmt.get(sanitized);
      if (existing) {
        return res.status(409).json({ error: `Slug '${sanitized}' sudah dipakai. Gunakan slug lain.` });
      }
      code = sanitized;
    } else {
      // Generate unique random slug
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateSlug(6);
        const exists = getLinkByCodeStmt.get(candidate);
        if (!exists) {
          code = candidate;
          break;
        }
        attempts++;
      }
      if (!code) {
        return res.status(500).json({ error: 'Gagal membuat kode acak unik setelah beberapa percobaan.' });
      }
    }

    const nowIso = new Date().toISOString();
    const cleanTitle = (title && typeof title === 'string') ? title.trim().substring(0, 100) : '';

    insertLinkStmt.run(code, trimmedUrl, cleanTitle, nowIso);
    const createdLink = getLinkByCodeStmt.get(code);

    res.status(201).json({
      status: 'created',
      message: 'Tautan berhasil dipendekkan.',
      data: createdLink,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan tautan: ' + err.message });
  }
});

// 3. GET /api/links/:code — Detailed link metrics & click log
router.get('/links/:code', (req, res) => {
  try {
    const code = req.params.code;
    const link = getLinkByCodeStmt.get(code);

    if (!link) {
      return res.status(404).json({ error: `Tautan dengan kode '${code}' tidak ditemukan.` });
    }

    const clicks = getClicksForLinkStmt.all(code);

    // Compute aggregations
    const osMap = {};
    const browserMap = {};
    const deviceMap = {};

    clicks.forEach((c) => {
      osMap[c.os] = (osMap[c.os] || 0) + 1;
      browserMap[c.browser] = (browserMap[c.browser] || 0) + 1;
      deviceMap[c.device_type] = (deviceMap[c.device_type] || 0) + 1;
    });

    const formatBreakdown = (map) =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    res.json({
      status: 'ok',
      link,
      metrics: {
        total_clicks_recorded: clicks.length,
        breakdown_os: formatBreakdown(osMap),
        breakdown_browser: formatBreakdown(browserMap),
        breakdown_device: formatBreakdown(deviceMap),
      },
      recent_clicks: clicks,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil rincian analitik: ' + err.message });
  }
});

// 4. DELETE /api/links/:code — Remove link
router.delete('/links/:code', (req, res) => {
  try {
    const code = req.params.code;
    const existing = getLinkByCodeStmt.get(code);

    if (!existing) {
      return res.status(404).json({ error: `Tautan dengan kode '${code}' tidak ditemukan.` });
    }

    deleteLinkStmt.run(code);

    res.json({
      status: 'ok',
      message: `Tautan '${code}' beserta catatan analitiknya berhasil dihapus.`,
      code,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus tautan: ' + err.message });
  }
});

// 5. GET /api/stats — Global dashboard metrics
router.get('/stats', (req, res) => {
  try {
    const counts = getGlobalStatsStmt.get();

    // Top OS & Browser across all links
    const topOsStmt = db.prepare(`
      SELECT os as name, COUNT(*) as count FROM clicks GROUP BY os ORDER BY count DESC LIMIT 5
    `);
    const topBrowserStmt = db.prepare(`
      SELECT browser as name, COUNT(*) as count FROM clicks GROUP BY browser ORDER BY count DESC LIMIT 5
    `);
    const topDeviceStmt = db.prepare(`
      SELECT device_type as name, COUNT(*) as count FROM clicks GROUP BY device_type ORDER BY count DESC
    `);
    const mostActiveLinkStmt = db.prepare(`
      SELECT code, original_url, title, click_count FROM links ORDER BY click_count DESC LIMIT 1
    `);

    res.json({
      status: 'ok',
      total_links: counts.total_links || 0,
      total_clicks: counts.total_clicks || 0,
      most_active_link: mostActiveLinkStmt.get() || null,
      top_os: topOsStmt.all(),
      top_browser: topBrowserStmt.all(),
      top_device: topDeviceStmt.all(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil ringkasan statistik: ' + err.message });
  }
});

module.exports = router;
