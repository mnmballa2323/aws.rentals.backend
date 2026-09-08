import { Request, Response, NextFunction } from 'express';
import { modernTreasuryService } from '../services/modernTreasury.service';
import { sendSuccess } from '../utils/response';

export class ModernTreasuryController {
  // ─── Internal Accounts ─────────────────────────────────────

  async listInternalAccounts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await modernTreasuryService.listInternalAccounts();
      sendSuccess(res, accounts, 200, { message: 'Internal accounts retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async getInternalAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await modernTreasuryService.getInternalAccount(req.params.id as string);
      sendSuccess(res, account, 200, { message: 'Internal account details retrieved' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Counterparties ────────────────────────────────────────

  async listCounterparties(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const counterparties = await modernTreasuryService.listCounterparties();
      sendSuccess(res, counterparties, 200, { message: 'Counterparties retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async createCounterparty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, role, plaidProcessorToken, routingNumber, accountNumber, accountType } = req.body;
      const counterparty = await modernTreasuryService.createCounterparty({
        name,
        email,
        role,
        plaidProcessorToken,
        routingNumber,
        accountNumber,
        accountType,
      });
      sendSuccess(res, counterparty, 201, { message: 'Counterparty created successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Payment Orders ────────────────────────────────────────

  async listPaymentOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await modernTreasuryService.listPaymentOrders();
      sendSuccess(res, orders, 200, { message: 'Payment orders retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async createPaymentOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, direction, amountCents, originatingAccountId, counterpartyId, description, metadata } = req.body;
      const order = await modernTreasuryService.createPaymentOrder({
        type: type || 'ach',
        direction: direction || 'debit',
        amountCents: Number(amountCents),
        originatingAccountId,
        counterpartyId,
        description,
        metadata,
      });
      sendSuccess(res, order, 201, { message: 'Payment order created' });
    } catch (error) {
      next(error);
    }
  }

  async collectRent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { counterpartyId, amountDollars, leaseId, tenantName } = req.body;
      const order = await modernTreasuryService.collectRent(
        counterpartyId || 'cp_tenant_4b',
        Number(amountDollars || 2850),
        leaseId || 'lease-4b-2026',
        tenantName || 'Michael Meram',
      );
      sendSuccess(res, order, 201, { message: 'ACH rent collection payment order initiated' });
    } catch (error) {
      next(error);
    }
  }

  async disburseOwnerDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { counterpartyId, amountDollars, propertyId, ownerName, method } = req.body;
      const order = await modernTreasuryService.disburseOwnerDistribution(
        counterpartyId || 'cp_owner_apex',
        Number(amountDollars || 2565),
        propertyId || 'prop-valencia-1250',
        ownerName || 'Apex Residential Holdings LLC',
        method || 'rtp',
      );
      sendSuccess(res, order, 201, { message: 'Owner net distribution payment order dispatched' });
    } catch (error) {
      next(error);
    }
  }

  async payVendorInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { counterpartyId, amountDollars, workOrderId, vendorName } = req.body;
      const order = await modernTreasuryService.payVendorInvoice(
        counterpartyId || 'cp_vendor_plumbing',
        Number(amountDollars || 320),
        workOrderId || 'wo-8821',
        vendorName || 'Bay Area Master Plumbers LLC',
      );
      sendSuccess(res, order, 201, { message: 'Vendor invoice payment order executed' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Expected Payments ─────────────────────────────────────

  async listExpectedPayments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await modernTreasuryService.listExpectedPayments();
      sendSuccess(res, list, 200, { message: 'Expected payments retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async createExpectedPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amountLowerBoundCents, amountUpperBoundCents, direction, internalAccountId, counterpartyId, description } = req.body;
      const expectedPayment = await modernTreasuryService.createExpectedPayment({
        amountLowerBoundCents: Number(amountLowerBoundCents),
        amountUpperBoundCents: Number(amountUpperBoundCents),
        direction: direction || 'credit',
        internalAccountId: internalAccountId || 'ia_clearing_002',
        counterpartyId,
        description: description || 'Expected lease payment',
      });
      sendSuccess(res, expectedPayment, 201, { message: 'Expected payment registered for auto-reconciliation' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Virtual Accounts ──────────────────────────────────────

  async listVirtualAccounts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await modernTreasuryService.listVirtualAccounts();
      sendSuccess(res, accounts, 200, { message: 'Virtual accounts retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async createVirtualAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, internalAccountId, counterpartyId, description } = req.body;
      const va = await modernTreasuryService.createVirtualAccount({
        name,
        internalAccountId: internalAccountId || 'ia_clearing_002',
        counterpartyId,
        description,
      });
      sendSuccess(res, va, 201, { message: 'Virtual account provisioned' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Double-Entry Ledgers ──────────────────────────────────

  async getLedger(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ledger = await modernTreasuryService.getOrCreateLedger();
      sendSuccess(res, ledger, 200, { message: 'Double-entry ledger retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async createLedgerAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ledgerId, name, normalBalance } = req.body;
      const account = await modernTreasuryService.createLedgerAccount(
        ledgerId || 'led_master_01',
        name,
        normalBalance || 'credit',
      );
      sendSuccess(res, account, 201, { message: 'Ledger account created' });
    } catch (error) {
      next(error);
    }
  }

  async createLedgerTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ledgerId, description, entries, metadata } = req.body;
      const transaction = await modernTreasuryService.createLedgerTransaction(
        ledgerId || 'led_master_01',
        description,
        entries,
        metadata,
      );
      sendSuccess(res, transaction, 201, { message: 'Balanced double-entry journal entry posted' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Returns ───────────────────────────────────────────────

  async listReturns(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const returns = await modernTreasuryService.listReturns();
      sendSuccess(res, returns, 200, { message: 'Modern Treasury NACHA returns retrieved' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Webhooks ──────────────────────────────────────────────

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await modernTreasuryService.handleWebhook(req.body);
      sendSuccess(res, result, 200, { message: 'Modern Treasury webhook acknowledged' });
    } catch (error) {
      next(error);
    }
  }
}

export const modernTreasuryController = new ModernTreasuryController();
