import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  dbSsl: process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false' && !process.env.DATABASE_URL?.includes('@db') && !process.env.DATABASE_URL?.includes('localhost') && !process.env.DATABASE_URL?.includes('127.0.0.1')),
  jwtSecret: checkRequired('JWT_SECRET', process.env.JWT_SECRET, 'edusync_ai_super_secret_jwt_key_2026'),
  jwtRefreshSecret: checkRequired('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET, 'edusync_ai_super_secret_refresh_jwt_key_2026'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
