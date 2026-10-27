const crypto = require('node:crypto');

const CHARSET = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

function generateSlug(length = 6) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

function sanitizeCustomSlug(slug) {
  if (!slug || typeof slug !== 'string') return '';
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '')
    .substring(0, 32);
}

module.exports = {
  generateSlug,
  sanitizeCustomSlug,
};
