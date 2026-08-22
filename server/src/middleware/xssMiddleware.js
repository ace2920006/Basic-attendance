/**
 * XSS Protection Middleware
 * Recursively cleans and sanitizes request payloads (body, query, params)
 * to prevent Cross-Site Scripting (XSS) payload injection attacks.
 */

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // Replace script tags and dangerous HTML/javascript attributes
  let cleaned = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // Escape basic HTML characters to prevent tag injection
  cleaned = cleaned
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return cleaned;
};

const sanitizeValue = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    const sanitizedObj = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[sanitizeString(key)] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }

  return value;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
};

module.exports = xssSanitizer;
