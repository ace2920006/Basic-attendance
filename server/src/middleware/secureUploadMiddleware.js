const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Private secure storage directory - isolated from static express routes
const secureUploadDir = path.join(__dirname, '../../secure_uploads/documents');

if (!fs.existsSync(secureUploadDir)) {
  fs.mkdirSync(secureUploadDir, { recursive: true });
}

// Cryptographically randomized file naming to prevent predictability and path traversal
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, secureUploadDir);
  },
  filename(req, file, cb) {
    const randomHex = crypto.randomBytes(12).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `doc-${Date.now()}-${randomHex}${ext}`);
  }
});

// Strict MIME and extension filter for PDF, JPG, PNG
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|jpg|jpeg|png/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isValidExt = allowedExtensions.test(ext);

  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const isValidMime = allowedMimeTypes.includes(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    const error = new Error('Invalid document format. Only PDF, JPG, and PNG files are supported for leave applications.');
    error.code = 'INVALID_DOCUMENT_TYPE';
    cb(error, false);
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
});

/**
 * Express middleware wrapper to provide clean, standardized JSON errors for upload rejections
 */
const handleSecureDocumentUpload = (fieldName = 'document') => {
  const singleUpload = upload.single(fieldName);

  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds maximum allowed limit of 5MB. Please upload a smaller document.',
            code: 'FILE_TOO_LARGE'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          code: err.code
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Only PDF, JPG, and PNG files are accepted.',
          code: err.code || 'INVALID_DOCUMENT_TYPE'
        });
      }
      next();
    });
  };
};

module.exports = {
  secureUploadDir,
  handleSecureDocumentUpload,
  MAX_FILE_SIZE
};
