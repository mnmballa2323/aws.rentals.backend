import Stripe from 'stripe';
import { logger } from '../utils/logger';

/**
 * Payment service abstraction layer.
 * Stripe implementation with a mock fallback when no secret key is set.
 */
export class PaymentService {
  private stripe?: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key);
    } else {
      logger.warn('STRIPE_SECRET_KEY is not set. Running in mock payment mode.');
    }
  }

  /**
   * Create a payment intent for rent collection.
   */
  async createPaymentIntent(
    amountCents: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {},
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!this.stripe) {
      logger.info(`[MOCK] Created payment intent for ${amountCents} cents`);
      return { clientSecret: 'mock_client_secret_intent', paymentIntentId: 'mock_pi_123' };
    }
    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata,
      payment_method_types: ['us_bank_account'],
    });
    return {
      clientSecret: intent.client_secret || '',
      paymentIntentId: intent.id,
    };
  }

  /**
   * Confirm a payment has been completed.
   */
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    if (!this.stripe) {
      logger.info(`[MOCK] Confirmed payment ${paymentIntentId}`);
      return true;
    }
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return intent.status === 'succeeded';
  }

  /**
   * Process a refund.
   */
  async refundPayment(
    paymentIntentId: string,
    amountCents?: number,
  ): Promise<{ refundId: string }> {
    if (!this.stripe) {
      logger.info(`[MOCK] Refunded payment ${paymentIntentId}`);
      return { refundId: 'mock_ref_123' };
    }
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
    });
    return { refundId: refund.id };
  }

  /**
   * Create a connected account for an owner for disbursement.
   */
  async createConnectedAccount(
    email: string,
    metadata: Record<string, string> = {},
  ): Promise<{ accountId: string }> {
    if (!this.stripe) {
      logger.info(`[MOCK] Created connected account for ${email}`);
      return { accountId: 'mock_acct_123' };
    }
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      metadata,
    });
    return { accountId: account.id };
  }

  /**
   * Create Plaid Link Token.
   */
  async createPlaidLinkToken(userId: string): Promise<{ linkToken: string }> {
    logger.info(`[MOCK] Created Plaid link token for user ${userId}`);
    return { linkToken: `mock_link_token_for_${userId}_${Date.now()}` };
  }

  /**
   * Exchange Plaid Public Token.
   */
  async exchangePlaidPublicToken(
    publicToken: string,
    userId: string,
  ): Promise<{ accessToken: string; bankAccountToken: string }> {
    logger.info(`[MOCK] Exchanged Plaid public token ${publicToken} for user ${userId}`);
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      bankAccountToken: `btok_mock_${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}

export const paymentService = new PaymentService();
