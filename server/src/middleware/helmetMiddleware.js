/**
 * Helmet Security Middleware
 * Sets secure HTTP headers to mitigate vulnerabilities like Clickjacking,
 * MIME Sniffing, XSS, and Information Disclosure.
 */

const helmetMiddleware = (req, res, next) => {
  // Hide server technology details
  res.removeHeader('X-Powered-By');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking (framing attacks)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // XSS Protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Enforce HTTPS transmission (HSTS)
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Control referrer information sent in HTTP headers
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict cross-origin resource embedding
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Content Security Policy (CSP) defaults
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws: wss: https:;"
  );

  next();
};

module.exports = helmetMiddleware;
