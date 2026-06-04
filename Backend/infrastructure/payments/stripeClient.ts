import Stripe from 'stripe';
import { env } from '../config/env.js';

if (!env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: (env.STRIPE_API_VERSION || '2026-02-25.clover') as Stripe.LatestApiVersion,
});

