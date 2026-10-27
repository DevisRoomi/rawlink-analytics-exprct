const db = require('../src/db/database');
const { parseUserAgent, hashIp } = require('../src/utils/uaParser');

console.log('--- SEEDING RAWLINK DATABASE ---');

const clearClicks = db.prepare('DELETE FROM clicks');
const clearLinks = db.prepare('DELETE FROM links');
clearClicks.run();
clearLinks.run();

const insertLink = db.prepare(`
  INSERT INTO links (code, original_url, title, click_count, created_at, last_clicked_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertClick = db.prepare(`
  INSERT INTO clicks (
    link_id, code, clicked_at, ip_hash, user_agent, browser, browser_version, os, device_type, referrer
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleLinks = [
  {
    code: 'docs-api',
    url: 'https://nodejs.org/api/sqlite.html',
    title: 'Node.js SQLite Native Documentation',
    clicks: 14,
  },
  {
    code: 'react-dev',
    url: 'https://react.dev/reference/react',
    title: 'React 18 Core API Reference',
    clicks: 9,
  },
  {
    code: 'github-raw',
    url: 'https://github.com/DevisRoomi',
    title: 'DevisRoomi GitHub Profile',
    clicks: 6,
  },
];

const mockUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.60 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'curl/8.4.0',
];

const mockReferrers = [
  'https://news.ycombinator.com/',
  'https://github.com/',
  'https://twitter.com/',
  'Direct / None',
];

const now = Date.now();

for (const item of sampleLinks) {
  const createdAt = new Date(now - 86400000 * 3).toISOString();
  const lastClickedAt = new Date(now - 1000 * 60 * 12).toISOString();

  insertLink.run(
    item.code,
    item.url,
    item.title,
    item.clicks,
    createdAt,
    lastClickedAt
  );

  const linkRow = db.prepare('SELECT id FROM links WHERE code = ?').get(item.code);

  for (let i = 0; i < item.clicks; i++) {
    const clickTime = new Date(now - Math.floor(Math.random() * 86400000 * 2)).toISOString();
    const ua = mockUserAgents[i % mockUserAgents.length];
    const parsed = parseUserAgent(ua);
    const ip = `192.168.1.${10 + (i % 20)}`;
    const ref = mockReferrers[i % mockReferrers.length];

    insertClick.run(
      linkRow.id,
      item.code,
      clickTime,
      hashIp(ip),
      ua,
      parsed.browser,
      parsed.browser_version,
      parsed.os,
      parsed.device_type,
      ref
    );
  }
}

console.log('--- SEEDING COMPLETED: 3 Links & 29 Click Records Created ---');
