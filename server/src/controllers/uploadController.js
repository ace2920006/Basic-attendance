const asyncHandler = require('../utils/asyncHandler');

// @desc    Upload file (image / csv / pdf)
// @route   POST /api/uploads
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const filePath = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    data: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: filePath
    }
  });
});

module.exports = { uploadFile };
