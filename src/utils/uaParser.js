const crypto = require('node:crypto');

/**
 * Anonymize or hash IP address
 */
function hashIp(ip) {
  if (!ip) return '0.0.0.0';
  const clean = ip.replace(/^::ffff:/, '').trim();
  const hash = crypto.createHash('sha256').update(clean + '_salt_rawlink').digest('hex');
  return hash.substring(0, 10);
}

/**
 * Parse raw User-Agent string without heavy external libraries
 */
function parseUserAgent(uaString) {
  if (!uaString || typeof uaString !== 'string') {
    return {
      browser: 'Unknown',
      browser_version: '',
      os: 'Unknown',
      device_type: 'Unknown',
    };
  }

  const ua = uaString.trim();

  // 1. Device Type
  let device_type = 'Desktop';
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    device_type = 'Mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    device_type = 'Tablet';
  } else if (/curl|wget|python|httpie|postman|node-fetch|axios|bot|crawl|spider/i.test(ua)) {
    device_type = 'CLI/Bot';
  }

  // 2. Operating System
  let os = 'Other';
  if (/windows nt 10\.0/i.test(ua)) os = 'Windows 10/11';
  else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
  else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/cros/i.test(ua)) os = 'ChromeOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // 3. Browser detection
  let browser = 'Other';
  let browser_version = '';

  const edgeMatch = ua.match(/Edg(?:e|A|iOS)?\/([0-9.]+)/i);
  const operaMatch = ua.match(/(?:OPR|Opera)\/([0-9.]+)/i);
  const chromeMatch = ua.match(/(?:Chrome|CriOS)\/([0-9.]+)/i);
  const firefoxMatch = ua.match(/(?:Firefox|FxiOS)\/([0-9.]+)/i);
  const safariMatch = ua.match(/Version\/([0-9.]+).*Safari/i);
  const curlMatch = ua.match(/curl\/([0-9.]+)/i);

  if (edgeMatch) {
    browser = 'Edge';
    browser_version = edgeMatch[1].split('.')[0];
  } else if (operaMatch) {
    browser = 'Opera';
    browser_version = operaMatch[1].split('.')[0];
  } else if (chromeMatch) {
    browser = 'Chrome';
    browser_version = chromeMatch[1].split('.')[0];
  } else if (firefoxMatch) {
    browser = 'Firefox';
    browser_version = firefoxMatch[1].split('.')[0];
  } else if (safariMatch) {
    browser = 'Safari';
    browser_version = safariMatch[1].split('.')[0];
  } else if (curlMatch) {
    browser = 'cURL';
    browser_version = curlMatch[1];
  } else if (/bot|spider|crawl/i.test(ua)) {
    browser = 'Web Bot';
  }

  return {
    browser,
    browser_version,
    os,
    device_type,
  };
}

module.exports = {
  hashIp,
  parseUserAgent,
};
