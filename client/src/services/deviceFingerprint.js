/**
 * Device Fingerprinting & Browser Identification Service
 * Provides persistent browser installation ID and device signature hash.
 */

// Generate a simple v4 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or initializes a persistent unique Browser ID stored in localStorage.
 */
export function getBrowserId() {
  let browserId = localStorage.getItem('app_browser_id');
  if (!browserId) {
    browserId = 'BID-' + generateUUID();
    localStorage.setItem('app_browser_id', browserId);
  }
  return browserId;
}

/**
 * Generates a device fingerprint hash based on client hardware & environment characteristics.
 */
export function getDeviceFingerprint() {
  const components = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth || '',
    navigator.hardwareConcurrency || '',
    new Date().getTimezoneOffset()
  ];

  const stringVal = components.join('||');
  
  // Simple FNV-1a hash function
  let hash = 0x811c9dc5;
  for (let i = 0; i < stringVal.length; i++) {
    hash ^= stringVal.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  
  return 'FP-' + (hash >>> 0).toString(16).toUpperCase();
}

/**
 * Convenience method returning full device payload
 */
export function getDevicePayload() {
  return {
    browserId: getBrowserId(),
    deviceFingerprint: getDeviceFingerprint(),
    userAgent: navigator.userAgent
  };
}
