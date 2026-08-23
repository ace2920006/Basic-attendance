/**
 * Rate Limiting Middleware
 * In-memory token bucket rate limiter to prevent brute-force attacks and DoS.
 */

class MemoryRateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100, message = 'Too many requests, please try again later.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.hits = new Map();

    // Clean up expired buckets periodically (every 5 minutes)
    const cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (cleanupInterval.unref) cleanupInterval.unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.hits.entries()) {
      if (now > record.resetTime) {
        this.hits.delete(ip);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const now = Date.now();

      let record = this.hits.get(ip);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs
        };
        this.hits.set(ip, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.maxRequests - record.count);
      const resetTimeSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTimeSeconds);

      if (record.count > this.maxRequests) {
        res.setHeader('Retry-After', resetTimeSeconds);
        return res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: this.message,
          retryAfterSeconds: resetTimeSeconds
        });
      }

      next();
    };
  }
}

// Global API rate limiter: 200 requests per 15 minutes
const globalLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  200,
  'Global API rate limit exceeded. Please wait 15 minutes before making further requests.'
).middleware();

// Auth rate limiter: 15 attempts per 15 minutes
const authLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  15,
  'Too many authentication attempts. Please try again after 15 minutes.'
).middleware();

// Sensitive actions rate limiter (e.g. password resets, QR generation): 10 requests per 15 mins
const sensitiveActionLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many requests for this operation. Please wait a few minutes before trying again.'
).middleware();

module.exports = {
  globalLimiter,
  authLimiter,
  sensitiveActionLimiter,
  MemoryRateLimiter
};
