import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '../../../.env');
const fallbackEnvPath = join(process.cwd(), '.env');

if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config({ path: fallbackEnvPath });
}


function parseTtlToSeconds(value: string | undefined, defaultSeconds: number): number {
    if (!value || !value.trim()) return defaultSeconds;
    const trimmed = value.trim().toLowerCase();
    const match = trimmed.match(/^(\d+)\s*(s|m|h|d)?$/);
    if (!match) return defaultSeconds;
    const num = parseInt(match[1], 10);
    const unit = match[2] || 's';
    switch (unit) {
        case 's': return num;
        case 'm': return num * 60;
        case 'h': return num * 3600;
        case 'd': return num * 86400;
        default:  return defaultSeconds;
    }
}

function optionalInt(raw: string | undefined, fallback: number): number {
    if (!raw?.trim()) return fallback;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
}

export interface IEnvConfig {
    PORT: number;
    MONGO_URI: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV: string;
    FRONTEND_URL: string;
    REDIS_URL: string;
    COMPILER_URL: string;
    COMPILER_AUTH_TOKEN?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    AWS_S3_BUCKET?: string;
    EMAIL_USER?: string;
    EMAIL_PASSWORD?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    STRIPE_CURRENCY: string;
    GOOGLE_AI_API_KEY?: string;
    LOG_TO_FILE?: string;
    LOG_RETENTION_DAYS?: string;
    LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    LOG_DIRECTORY?: string;
    DOCUSIGN_INTEGRATION_KEY?: string;
    DOCUSIGN_USER_ID?: string;
    DOCUSIGN_PRIVATE_KEY?: string;
    DOCUSIGN_OAUTH_HOST?: string;
    DOCUSIGN_REDIRECT_URI?: string;
    DOCUSIGN_JWT_LIFETIME_SECONDS?: string;
    DOCUSIGN_REST_BASE_URL?: string;
    DOCUSIGN_ACCOUNT_ID?: string;
    CORS_ALLOWED_ORIGINS: string;
    ACCESS_TOKEN_TTL: string;
    ACCESS_TOKEN_TTL_SECONDS: number;
    REFRESH_TOKEN_TTL: string;
    REFRESH_TOKEN_TTL_SECONDS: number;
    OTP_TTL_SECONDS: number;
    OAUTH_SESSION_TTL_SECONDS: number;

    RATE_LIMIT_GLOBAL_MAX: number;
    RATE_LIMIT_MUTATING_MAX: number;
    RATE_LIMIT_AUTH_MAX: number;
    RATE_LIMIT_WINDOW_SECONDS: number;

    BODY_LIMIT_BYTES: number;
    UPLOAD_MAX_FILE_SIZE_BYTES: number;

    S3_UPLOAD_URL_EXPIRES_SECONDS: number;
    S3_PROFILE_VIEW_URL_EXPIRES_SECONDS: number;
    S3_FILE_VIEW_URL_EXPIRES_SECONDS: number;
    S3_DEFAULT_VIEW_URL_EXPIRES_SECONDS: number;

    GOOGLE_AI_MODEL_ID: string;

    EMAIL_SERVICE: string;

    BCRYPT_SALT_ROUNDS: number;

    MONGO_MAX_POOL_SIZE: number;
    MONGO_MIN_POOL_SIZE: number;
    MONGO_MAX_IDLE_TIME_MS: number;
    MONGO_SERVER_SELECTION_TIMEOUT_MS: number;
    MONGO_SOCKET_TIMEOUT_MS: number;

    STRIPE_API_VERSION: string;

    LOG_ROTATION_INTERVAL: string;
}

function validateEnv(): IEnvConfig {
    const requiredVars = [
        'PORT',
        'MONGO_URI',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
        'FRONTEND_URL',
        'REDIS_URL',
        'CORS_ALLOWED_ORIGINS',
    ];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const accessTtlRaw = process.env.ACCESS_TOKEN_TTL || '15m';
    const refreshTtlRaw = process.env.REFRESH_TOKEN_TTL || '7d';

    return {
        PORT: parseInt(process.env.PORT!, 10),
        MONGO_URI: process.env.MONGO_URI!,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
        NODE_ENV: process.env.NODE_ENV || 'development',
        FRONTEND_URL: process.env.FRONTEND_URL!.trim().replace(/\/$/, ''),
        REDIS_URL: process.env.REDIS_URL!,
        COMPILER_URL: (process.env.COMPILER_URL || process.env.JUDGE0_URL || '').trim(),
        COMPILER_AUTH_TOKEN: process.env.COMPILER_AUTH_TOKEN,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: (() => {
            const v = process.env.GOOGLE_CALLBACK_URL?.trim();
            return v ? v.replace(/\/$/, '') : undefined;
        })(),
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.trim(),
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET?.trim(),
        STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || 'inr',
        GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
        LOG_TO_FILE: process.env.LOG_TO_FILE,
        LOG_RETENTION_DAYS: process.env.LOG_RETENTION_DAYS,
        LOG_LEVEL: (() => {
            const valid = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
            const raw = (process.env.LOG_LEVEL ?? 'info').trim().toLowerCase();
            return (valid.includes(raw as typeof valid[number]) ? raw : 'info') as typeof valid[number];
        })(),
        LOG_DIRECTORY: process.env.LOG_DIRECTORY || 'logs',

        DOCUSIGN_INTEGRATION_KEY: process.env.DOCUSIGN_INTEGRATION_KEY,
        DOCUSIGN_USER_ID: process.env.DOCUSIGN_USER_ID,
        DOCUSIGN_PRIVATE_KEY: process.env.DOCUSIGN_PRIVATE_KEY,
        DOCUSIGN_OAUTH_HOST: process.env.DOCUSIGN_OAUTH_HOST,
        DOCUSIGN_REDIRECT_URI: process.env.DOCUSIGN_REDIRECT_URI,
        DOCUSIGN_JWT_LIFETIME_SECONDS: process.env.DOCUSIGN_JWT_LIFETIME_SECONDS,
        DOCUSIGN_REST_BASE_URL: process.env.DOCUSIGN_REST_BASE_URL,
        DOCUSIGN_ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID,

        CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS!,

        ACCESS_TOKEN_TTL: accessTtlRaw,
        ACCESS_TOKEN_TTL_SECONDS: parseTtlToSeconds(accessTtlRaw, 900),
        REFRESH_TOKEN_TTL: refreshTtlRaw,
        REFRESH_TOKEN_TTL_SECONDS: parseTtlToSeconds(refreshTtlRaw, 604800),
        OTP_TTL_SECONDS: optionalInt(process.env.OTP_TTL_SECONDS, 60),
        OAUTH_SESSION_TTL_SECONDS: optionalInt(process.env.OAUTH_SESSION_TTL_SECONDS, 900),

        RATE_LIMIT_GLOBAL_MAX: optionalInt(process.env.RATE_LIMIT_GLOBAL_MAX, 150),
        RATE_LIMIT_MUTATING_MAX: optionalInt(process.env.RATE_LIMIT_MUTATING_MAX, 60),
        RATE_LIMIT_AUTH_MAX: optionalInt(process.env.RATE_LIMIT_AUTH_MAX, 8),
        RATE_LIMIT_WINDOW_SECONDS: optionalInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 60),

        BODY_LIMIT_BYTES: optionalInt(process.env.BODY_LIMIT_BYTES, 1048576),
        UPLOAD_MAX_FILE_SIZE_BYTES: optionalInt(process.env.UPLOAD_MAX_FILE_SIZE_BYTES, 100 * 1024 * 1024),

        S3_UPLOAD_URL_EXPIRES_SECONDS: optionalInt(process.env.S3_UPLOAD_URL_EXPIRES_SECONDS, 300),
        S3_PROFILE_VIEW_URL_EXPIRES_SECONDS: optionalInt(process.env.S3_PROFILE_VIEW_URL_EXPIRES_SECONDS, 604800),
        S3_FILE_VIEW_URL_EXPIRES_SECONDS: optionalInt(process.env.S3_FILE_VIEW_URL_EXPIRES_SECONDS, 300),
        S3_DEFAULT_VIEW_URL_EXPIRES_SECONDS: optionalInt(process.env.S3_DEFAULT_VIEW_URL_EXPIRES_SECONDS, 3600),

        GOOGLE_AI_MODEL_ID: process.env.GOOGLE_AI_MODEL_ID || 'gemini-2.5-flash',

        EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',

        BCRYPT_SALT_ROUNDS: optionalInt(process.env.BCRYPT_SALT_ROUNDS, 10),

        MONGO_MAX_POOL_SIZE: optionalInt(process.env.MONGO_MAX_POOL_SIZE, 10),
        MONGO_MIN_POOL_SIZE: optionalInt(process.env.MONGO_MIN_POOL_SIZE, 2),
        MONGO_MAX_IDLE_TIME_MS: optionalInt(process.env.MONGO_MAX_IDLE_TIME_MS, 30000),
        MONGO_SERVER_SELECTION_TIMEOUT_MS: optionalInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 5000),
        MONGO_SOCKET_TIMEOUT_MS: optionalInt(process.env.MONGO_SOCKET_TIMEOUT_MS, 45000),

        STRIPE_API_VERSION: process.env.STRIPE_API_VERSION || '2026-02-25.clover',

        LOG_ROTATION_INTERVAL: process.env.LOG_ROTATION_INTERVAL || '1d',
    };
}
export const env = validateEnv();
