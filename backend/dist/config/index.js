import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edusync_ai',
    dbSsl: process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false' && !process.env.DATABASE_URL?.includes('@db') && !process.env.DATABASE_URL?.includes('localhost') && !process.env.DATABASE_URL?.includes('127.0.0.1')),
    jwtSecret: process.env.JWT_SECRET || 'edusync_ai_super_secret_jwt_key_2026',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'edusync_ai_super_secret_refresh_jwt_key_2026',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
};
