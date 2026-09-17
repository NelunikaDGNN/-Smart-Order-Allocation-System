require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  mlPythonBin: process.env.ML_PYTHON_BIN || 'python3',
  mlScriptPath: process.env.ML_SCRIPT_PATH || './ml/predict.py',
  mlConfidenceThreshold: parseFloat(process.env.ML_CONFIDENCE_THRESHOLD || '0.55'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
