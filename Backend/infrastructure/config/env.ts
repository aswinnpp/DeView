import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });
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
    ACCESS_TOKEN_TTL?: string;
    REFRESH_TOKEN_TTL?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    STRIPE_CURRENCY?: string;
    GOOGLE_AI_API_KEY?: string;
    LOG_TO_FILE?: string;
    LOG_RETENTION_DAYS?: string;
    /** DocuSign integration (JWT grant) — all optional until you enable signing */
    DOCUSIGN_INTEGRATION_KEY?: string;
    DOCUSIGN_USER_ID?: string;
    /** PEM string; use literal \\n newlines in .env or base64 of the PEM file */
    DOCUSIGN_PRIVATE_KEY?: string;
    /** e.g. account-d.docusign.com (demo) */
    DOCUSIGN_OAUTH_HOST?: string;
    /** OAuth redirect: backend GET /offer/success → 302 to FRONTEND_URL/company/offer-letters (must match DocuSign app URIs) */
    DOCUSIGN_REDIRECT_URI?: string;
    DOCUSIGN_JWT_LIFETIME_SECONDS?: string;
    /** REST base for API calls; default demo: https://demo.docusign.net/restapi */
    DOCUSIGN_REST_BASE_URL?: string;
    /** Optional; if set, must match an account from /oauth/userinfo when the user has several */
    DOCUSIGN_ACCOUNT_ID?: string;
}
function validateEnv(): IEnvConfig {
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
        FRONTEND_URL: process.env.FRONTEND_URL || 'https://deview.serveftp.com',
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        COMPILER_URL: process.env.COMPILER_URL || process.env.JUDGE0_URL || 'https://ce.judge0.com',
        COMPILER_AUTH_TOKEN: process.env.COMPILER_AUTH_TOKEN,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
        ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL,
        REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || 'inr',
        GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
        LOG_TO_FILE: process.env.LOG_TO_FILE,
        LOG_RETENTION_DAYS: process.env.LOG_RETENTION_DAYS,

        DOCUSIGN_INTEGRATION_KEY: process.env.DOCUSIGN_INTEGRATION_KEY,
        DOCUSIGN_USER_ID: process.env.DOCUSIGN_USER_ID,
        DOCUSIGN_PRIVATE_KEY: process.env.DOCUSIGN_PRIVATE_KEY,
        DOCUSIGN_OAUTH_HOST: process.env.DOCUSIGN_OAUTH_HOST,
        DOCUSIGN_REDIRECT_URI: process.env.DOCUSIGN_REDIRECT_URI,
        DOCUSIGN_JWT_LIFETIME_SECONDS: process.env.DOCUSIGN_JWT_LIFETIME_SECONDS,
        DOCUSIGN_REST_BASE_URL: process.env.DOCUSIGN_REST_BASE_URL,
        DOCUSIGN_ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID,
    };
}
export const env = validateEnv();
