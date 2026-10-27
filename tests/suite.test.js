const http = require('node:http');
const assert = require('node:assert');
const app = require('../src/app');

console.log('>>> MEMULAI PENGUJIAN INTEGRASI RAWLINK TRACKER <<<');

const TEST_PORT = 5069;
const server = app.listen(TEST_PORT, async () => {
  console.log(`[TEST RUNNER] Server pengujian aktif di port ${TEST_PORT}`);

  try {
    // 1. Test GET /api/links
    console.log('[1/7] Menguji GET /api/links...');
    const listRes = await request('/api/links');
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.status, 'ok');
    assert.ok(Array.isArray(listRes.body.data));
    console.log(`   ✓ Daftar tautan terbaca: ${listRes.body.data.length} item.`);

    // 2. Test POST /api/links (Create new link)
    console.log('[2/7] Menguji POST /api/links (Pembuatan tautan baru)...');
    const createRes = await request('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_url: 'https://example.org/artikel-riset-2026',
        custom_slug: 'riset-2026',
        title: 'Artikel Riset Komputasi 2026',
      }),
    });
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.body.data.code, 'riset-2026');
    console.log('   ✓ Tautan kustom /r/riset-2026 berhasil dibuat.');

    // 3. Test duplicate slug collision
    console.log('[3/7] Menguji validasi tabrakan slug kustom...');
    const duplicateRes = await request('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_url: 'https://example.org/halaman-lain',
        custom_slug: 'riset-2026',
      }),
    });
    assert.strictEqual(duplicateRes.status, 409);
    console.log('   ✓ Validasi bentrok slug (HTTP 409) terverifikasi.');

    // 4. Test Redirect & Analytics Logging
    console.log('[4/7] Menguji GET /r/riset-2026 (Pencatatan klik & User-Agent)...');
    const redirectRes = await request('/r/riset-2026', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://search.engine.local/',
      },
    });
    assert.strictEqual(redirectRes.status, 302);
    assert.strictEqual(redirectRes.headers.location, 'https://example.org/artikel-riset-2026');
    console.log('   ✓ Redirect 302 berhasil diarahkan ke tujuan.');

    // 5. Test Link Analytics Detail
    console.log('[5/7] Menguji GET /api/links/riset-2026 (Verifikasi audit klik)...');
    const analyticsRes = await request('/api/links/riset-2026');
    assert.strictEqual(analyticsRes.status, 200);
    assert.strictEqual(analyticsRes.body.link.click_count, 1);
    assert.strictEqual(analyticsRes.body.recent_clicks.length, 1);
    const click = analyticsRes.body.recent_clicks[0];
    assert.strictEqual(click.browser, 'Chrome');
    assert.strictEqual(click.os, 'Windows 10/11');
    assert.strictEqual(click.device_type, 'Desktop');
    console.log(`   ✓ Deteksi analitik akurat: OS=${click.os}, Browser=${click.browser}, Perangkat=${click.device_type}`);

    // 6. Test GET /api/stats (Global aggregates)
    console.log('[6/7] Menguji GET /api/stats (Statistik global)...');
    const statsRes = await request('/api/stats');
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.body.total_links >= 1);
    assert.ok(statsRes.body.total_clicks >= 1);
    console.log(`   ✓ Statistik global: ${statsRes.body.total_links} tautan, ${statsRes.body.total_clicks} total klik.`);

    // 7. Test DELETE /api/links/:code
    console.log('[7/7] Menguji DELETE /api/links/riset-2026...');
    const deleteRes = await request('/api/links/riset-2026', { method: 'DELETE' });
    assert.strictEqual(deleteRes.status, 200);
    const checkDeleted = await request('/api/links/riset-2026');
    assert.strictEqual(checkDeleted.status, 404);
    console.log('   ✓ Tautan dan relasi klik berhasil dihapus dari SQLite.');

    console.log('\n>>> SEMUA 7 PENGUJIAN INTEGRASI BERHASIL (PASS) <<<');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[ERROR PENGUJIAN]:', err);
    server.close();
    process.exit(1);
  }
});

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port: TEST_PORT,
        path,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let body = raw;
          try {
            body = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}
