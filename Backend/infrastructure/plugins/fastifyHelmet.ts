import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
import { getHelmetFrameParticipantSources } from '../config/corsOrigins.js';
import { env } from '../config/env.js';

export async function registerHelmet(
    fastify: FastifyInstance
): Promise<void> {
    const frameParticipants = getHelmetFrameParticipantSources();

    const s3BucketHost = env.AWS_S3_BUCKET
        ? `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`
        : null;

    const stripeScriptHosts = [
        'https://js.stripe.com',
    ];

    const stripeConnectHosts = [
        'https://api.stripe.com',
        'https://r.stripe.com',
        'https://m.stripe.network',
        'https://q.stripe.com',
    ];

    const allowedImageHosts = [
        "'self'",
        'data:',
        'blob:',
        'https:',
    ];

    if (s3BucketHost) {
        allowedImageHosts.push(s3BucketHost);
    }

    await fastify.register(helmet, {
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                formAction: ["'self'"],

                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                ],

                scriptSrc: [
                    "'self'",
                    ...stripeScriptHosts,
                ],

                scriptSrcElem: [
                    "'self'",
                    ...stripeScriptHosts,
                ],

                imgSrc: allowedImageHosts,

                fontSrc: [
                    "'self'",
                    'data:',
                    'https:',
                ],

                connectSrc: [
                    "'self'",
                    ...stripeConnectHosts,
                    ...(s3BucketHost ? [s3BucketHost] : []),
                ],

                frameSrc: [
                    ...frameParticipants,
                    ...stripeScriptHosts,
                    'https://hooks.stripe.com',
                ],

                frameAncestors: frameParticipants,

                workerSrc: [
                    "'self'",
                    'blob:',
                ],

                manifestSrc: ["'self'"],

                upgradeInsecureRequests: [],
            },
        },

        crossOriginEmbedderPolicy: false,
        frameguard: false,
    });

    fastify.log.info('Security headers (Helmet) registered');
}