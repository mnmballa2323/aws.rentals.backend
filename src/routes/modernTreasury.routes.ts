import { Router } from 'express';
import { modernTreasuryController } from '../controllers/modernTreasury.controller';

const router = Router();

// Internal Accounts
router.get('/internal-accounts', (req, res, next) => modernTreasuryController.listInternalAccounts(req, res, next));
router.get('/internal-accounts/:id', (req, res, next) => modernTreasuryController.getInternalAccount(req, res, next));

// Counterparties
router.get('/counterparties', (req, res, next) => modernTreasuryController.listCounterparties(req, res, next));
router.post('/counterparties', (req, res, next) => modernTreasuryController.createCounterparty(req, res, next));

// Payment Orders
router.get('/payment-orders', (req, res, next) => modernTreasuryController.listPaymentOrders(req, res, next));
router.post('/payment-orders', (req, res, next) => modernTreasuryController.createPaymentOrder(req, res, next));
router.post('/payment-orders/collect-rent', (req, res, next) => modernTreasuryController.collectRent(req, res, next));
router.post('/payment-orders/disburse-owner', (req, res, next) => modernTreasuryController.disburseOwnerDistribution(req, res, next));
router.post('/payment-orders/pay-vendor', (req, res, next) => modernTreasuryController.payVendorInvoice(req, res, next));

// Expected Payments & Auto-Reconciliation
router.get('/expected-payments', (req, res, next) => modernTreasuryController.listExpectedPayments(req, res, next));
router.post('/expected-payments', (req, res, next) => modernTreasuryController.createExpectedPayment(req, res, next));

// Virtual Accounts
router.get('/virtual-accounts', (req, res, next) => modernTreasuryController.listVirtualAccounts(req, res, next));
router.post('/virtual-accounts', (req, res, next) => modernTreasuryController.createVirtualAccount(req, res, next));

// Double-Entry Ledgers
router.get('/ledgers', (req, res, next) => modernTreasuryController.getLedger(req, res, next));
router.post('/ledgers/accounts', (req, res, next) => modernTreasuryController.createLedgerAccount(req, res, next));
router.post('/ledgers/transactions', (req, res, next) => modernTreasuryController.createLedgerTransaction(req, res, next));

// Returns & NACHA Exceptions
router.get('/returns', (req, res, next) => modernTreasuryController.listReturns(req, res, next));

// Webhooks
router.post('/webhook', (req, res, next) => modernTreasuryController.handleWebhook(req, res, next));

export default router;
