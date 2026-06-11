import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function checkRequired(key: string, value: string | undefined, defaultValue: string): string {
  if (!value || value === defaultValue) {
    console.warn(`⚠️  WARNING: ${key} is not set or using default value. Set it in .env for production.`);
  }
  return value || defaultValue;
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || checkRequired('DATABASE_URL', process.env.DATABASE_URL, 'postgresql://postgres:postgres@localhost:5432/edusync_ai'),
  jwtSecret: checkRequired('JWT_SECRET', process.env.JWT_SECRET, 'edusync_ai_super_secret_jwt_key_2026'),
  jwtRefreshSecret: checkRequired('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET, 'edusync_ai_super_secret_refresh_jwt_key_2026'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
