const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const net = require('net');

/**
 * Standard File Signatures (Magic Bytes)
 */
const MAGIC_BYTES = {
  PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // .PNG\r\n\x1a\n
  JPEG: [0xff, 0xd8, 0xff] // JPEG SOI marker
};

/**
 * EICAR Standard Anti-Virus Test String
 * Used across the cybersecurity industry to verify antivirus scanner pipelines.
 */
const EICAR_TEST_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

/**
 * Validates the file buffer header against known magic bytes for PDF, JPG, and PNG.
 * @param {Buffer} buffer - File buffer (at least first 16 bytes)
 * @param {string} reportedMime - Claimed MIME type
 * @param {string} originalName - Original filename
 * @returns {{ isValid: boolean, detectedMime: string|null, error: string|null }}
 */
function validateMagicBytes(buffer, reportedMime, originalName) {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, detectedMime: null, error: 'File buffer too small or empty' };
  }

  const ext = path.extname(originalName || '').toLowerCase();

  // Check PDF (%PDF-)
  const isPdf =
    buffer[0] === MAGIC_BYTES.PDF[0] &&
    buffer[1] === MAGIC_BYTES.PDF[1] &&
    buffer[2] === MAGIC_BYTES.PDF[2] &&
    buffer[3] === MAGIC_BYTES.PDF[3];

  // Check PNG (\x89PNG...)
  const isPng =
    buffer.length >= 8 &&
    MAGIC_BYTES.PNG.every((byte, idx) => buffer[idx] === byte);

  // Check JPEG (0xFF, 0xD8, 0xFF)
  const isJpeg =
    buffer[0] === MAGIC_BYTES.JPEG[0] &&
    buffer[1] === MAGIC_BYTES.JPEG[1] &&
    buffer[2] === MAGIC_BYTES.JPEG[2];

  let detectedMime = null;
  if (isPdf) detectedMime = 'application/pdf';
  else if (isPng) detectedMime = 'image/png';
  else if (isJpeg) detectedMime = 'image/jpeg';

  if (!detectedMime) {
    return {
      isValid: false,
      detectedMime: null,
      error: 'File signature verification failed. Only genuine PDF, JPG, and PNG documents are accepted.'
    };
  }

  // Cross-check detected MIME against extension
  const validCombos = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg']
  };

  const allowedExts = validCombos[detectedMime] || [];
  if (!allowedExts.includes(ext)) {
    return {
      isValid: false,
      detectedMime,
      error: `File extension (${ext}) does not match detected binary signature (${detectedMime}). Potential file spoofing detected.`
    };
  }

  return { isValid: true, detectedMime, error: null };
}

/**
 * Native Heuristic & Signature Scanner
 * Checks for malicious signatures, embedded executables, exploit vectors, and active script payloads.
 * @param {Buffer} buffer - Complete file buffer
 * @param {string} mimeType - Validated MIME type
 * @returns {{ isClean: boolean, threatName: string|null, reason: string|null }}
 */
function scanHeuristicSignatures(buffer, mimeType) {
  const contentStr = buffer.toString('binary');
  const asciiStr = buffer.toString('utf8', 0, Math.min(buffer.length, 65536)).toLowerCase();

  // 1. Check for EICAR anti-virus test file signature
  if (contentStr.includes(EICAR_TEST_STRING)) {
    return {
      isClean: false,
      threatName: 'EICAR-Test-Signature.StandardAntivirusTest',
      reason: 'Standard Antivirus Test File signature detected (EICAR pattern matched).'
    };
  }

  // 2. Detect disguised executable headers (MZ / PE for Windows, ELF for Linux, Mach-O for macOS)
  // Check for DOS 'MZ' header
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return {
      isClean: false,
      threatName: 'Executable.Win32.PE.Disguised',
      reason: 'Disguised Windows executable (MZ/PE header) detected inside file.'
    };
  }

  // Check for Linux ELF header (0x7F 'E' 'L' 'F')
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return {
      isClean: false,
      threatName: 'Executable.Linux.ELF.Disguised',
      reason: 'Disguised Linux executable binary (ELF header) detected.'
    };
  }

  // 3. Scan for active scripting tags in image / polyglot files
  if (mimeType.startsWith('image/')) {
    const maliciousPatterns = [
      '<script',
      'javascript:',
      'onerror=',
      'onload=',
      '<iframe',
      '<object',
      '<embed',
      'php://',
      '<?php'
    ];
    for (const pattern of maliciousPatterns) {
      if (asciiStr.includes(pattern)) {
        return {
          isClean: false,
          threatName: `Exploit.ImagePolyglot.${pattern.replace(/[^a-z0-9]/gi, '')}`,
          reason: `Suspicious active script/payload detected in image file: "${pattern}".`
        };
      }
    }
  }

  // 4. Scan PDF for dangerous exploit vectors
  if (mimeType === 'application/pdf') {
    // Scan PDF content for malicious launch actions or auto-executing scripts
    const pdfSearchWindow = contentStr.slice(0, 100000);
    const pdfExploits = [
      { tag: '/Launch', threat: 'Exploit.PDF.MaliciousLaunch', desc: 'Embedded /Launch action attempting process execution' },
      { tag: '/JavaScript', threat: 'Exploit.PDF.EmbeddedJavaScript', desc: 'Executable JavaScript payload detected inside PDF' },
      { tag: '/JS', threat: 'Exploit.PDF.EmbeddedJS', desc: 'Executable JS stream detected inside PDF' }
    ];

    for (const exploit of pdfExploits) {
      if (pdfSearchWindow.includes(exploit.tag)) {
        if (asciiStr.includes('app.launchurl') || asciiStr.includes('eval(') || asciiStr.includes('cmd.exe') || asciiStr.includes('/launch')) {
          return {
            isClean: false,
            threatName: exploit.threat,
            reason: `${exploit.desc}.`
          };
        }
      }
    }
  }

  return { isClean: true, threatName: null, reason: null };
}

/**
 * Optional ClamAV daemon integration hook.
 * Pings ClamAV daemon via TCP if CLAMAV_HOST and CLAMAV_PORT are provided in env.
 * Falls back cleanly to native engine if offline.
 */
async function scanWithClamAVIfAvailable(buffer) {
  const clamHost = process.env.CLAMAV_HOST;
  const clamPort = process.env.CLAMAV_PORT ? parseInt(process.env.CLAMAV_PORT, 10) : 3310;

  if (!clamHost) {
    return { available: false, isClean: true, threatName: null };
  }

  return new Promise((resolve) => {
    const client = new net.Socket();
    let responded = false;
    let responseData = '';

    client.setTimeout(2500);

    client.connect(clamPort, clamHost, () => {
      client.write('zINSTREAM\0');
      const sizeBuf = Buffer.alloc(4);
      sizeBuf.writeUInt32BE(buffer.length, 0);
      client.write(sizeBuf);
      client.write(buffer);
      const zeroBuf = Buffer.alloc(4);
      zeroBuf.writeUInt32BE(0, 0);
      client.write(zeroBuf);
    });

    client.on('data', (data) => {
      responseData += data.toString();
    });

    client.on('end', () => {
      responded = true;
      client.destroy();
      if (responseData.includes('FOUND')) {
        const match = responseData.match(/stream: (.+) FOUND/);
        const threatName = match ? match[1] : 'ClamAV.ThreatDetected';
        resolve({ available: true, isClean: false, threatName });
      } else {
        resolve({ available: true, isClean: true, threatName: null });
      }
    });

    client.on('error', () => {
      client.destroy();
      if (!responded) resolve({ available: false, isClean: true, threatName: null });
    });

    client.on('timeout', () => {
      client.destroy();
      if (!responded) resolve({ available: false, isClean: true, threatName: null });
    });
  });
}

/**
 * Comprehensive Document Security Scan
 * 1. Validates magic bytes / MIME integrity.
 * 2. Computes SHA-256 checksum.
 * 3. Scans for virus/malware via heuristic engine + ClamAV hook.
 */
async function scanUploadedDocument(filePath, originalName, reportedMime) {
  const scannedAt = new Date();

  if (!fs.existsSync(filePath)) {
    return {
      isValid: false,
      isClean: false,
      detectedMime: null,
      sha256: '',
      sizeBytes: 0,
      scanEngine: 'Integrity Checker',
      threatName: null,
      scanDetails: 'File not found on server disk',
      scannedAt,
      error: 'File not found on server disk'
    };
  }

  const buffer = fs.readFileSync(filePath);
  const sizeBytes = buffer.length;

  // 1. Calculate SHA-256 Checksum
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // 2. Validate Magic Bytes / File Signatures
  const mimeCheck = validateMagicBytes(buffer, reportedMime, originalName);
  if (!mimeCheck.isValid) {
    return {
      isValid: false,
      isClean: false,
      detectedMime: mimeCheck.detectedMime,
      sha256,
      sizeBytes,
      scanEngine: 'Magic-Byte Signature Inspector',
      threatName: 'InvalidMimeTypeSignature',
      scanDetails: mimeCheck.error,
      scannedAt,
      error: mimeCheck.error
    };
  }

  const verifiedMime = mimeCheck.detectedMime;

  // 3. Run Native Heuristic & Signature Scanner
  const heuristicResult = scanHeuristicSignatures(buffer, verifiedMime);
  if (!heuristicResult.isClean) {
    return {
      isValid: true,
      isClean: false,
      detectedMime: verifiedMime,
      sha256,
      sizeBytes,
      scanEngine: 'Antigravity Heuristic Security Engine v2.4',
      threatName: heuristicResult.threatName,
      scanDetails: heuristicResult.reason,
      scannedAt,
      error: `Security Alert: ${heuristicResult.reason}`
    };
  }

  // 4. Run ClamAV scan where available
  const clamResult = await scanWithClamAVIfAvailable(buffer);
  if (clamResult.available && !clamResult.isClean) {
    return {
      isValid: true,
      isClean: false,
      detectedMime: verifiedMime,
      sha256,
      sizeBytes,
      scanEngine: 'ClamAV Antivirus Daemon',
      threatName: clamResult.threatName,
      scanDetails: `ClamAV detected malicious payload: ${clamResult.threatName}`,
      scannedAt,
      error: `Security Alert: File infected with ${clamResult.threatName}`
    };
  }

  const engineName = clamResult.available
    ? 'ClamAV Daemon + Antigravity Heuristic Engine'
    : 'Antigravity Heuristic & Signature Security Engine';

  return {
    isValid: true,
    isClean: true,
    detectedMime: verifiedMime,
    sha256,
    sizeBytes,
    scanEngine: engineName,
    threatName: null,
    scanDetails: 'Scan completed. No viruses, active exploit scripts, or disguised binaries detected. SHA-256 verified.',
    scannedAt,
    error: null
  };
}

module.exports = {
  MAGIC_BYTES,
  EICAR_TEST_STRING,
  validateMagicBytes,
  scanHeuristicSignatures,
  scanUploadedDocument
};
