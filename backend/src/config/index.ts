import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edusync_ai',
  jwtSecret: process.env.JWT_SECRET || 'edusync_ai_super_secret_jwt_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'edusync_ai_super_secret_refresh_jwt_key_2026',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
