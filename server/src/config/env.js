const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

/**
 * Validates environment variables. Throws fatal error if mandatory variables are missing.
 */
const validateEnv = () => {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName] || process.env[varName].trim() === ''
  );

  if (missingVars.length > 0) {
    const errorMsg = `FATAL SECURITY CONFIGURATION ERROR: Missing required environment variable(s): ${missingVars.join(
      ', '
    )}. Default/fallback credentials have been removed. Application startup aborted.`;

    console.error(`\n❌ ${errorMsg}\n`);
    throw new Error(errorMsg);
  }
};

// Validate environment immediately on import
validateEnv();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1h',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  validateEnv
};
