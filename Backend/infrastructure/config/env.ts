import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });
export interface EnvConfig {
    PORT: number;
    MONGO_URI: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;
}
function validateEnv(): EnvConfig {
    const requiredVars = ['PORT', 'MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    return {
        PORT: parseInt(process.env.PORT!, 10),
        MONGO_URI: process.env.MONGO_URI!,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
        NODE_ENV: process.env.NODE_ENV || 'development',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    };
}
export const env = validateEnv();
