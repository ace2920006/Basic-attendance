const jwt = require('jsonwebtoken');

const generateAccessToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'attendance_jwt_super_secret_key_2026_spec',
    {
      expiresIn: process.env.JWT_EXPIRE || '1h'
    }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'attendance_jwt_refresh_secret_key_2026_spec',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    }
  );
};

module.exports = {
  generateToken: generateAccessToken,
  generateAccessToken,
  generateRefreshToken
};
