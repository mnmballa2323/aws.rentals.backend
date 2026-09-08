import { Router } from 'express';
import { modernTreasuryController } from '../controllers/modernTreasury.controller';

const router = Router();

// Internal Accounts & Balance Reports
router.get('/internal-accounts', (req, res, next) => modernTreasuryController.listInternalAccounts(req, res, next));
router.get('/internal-accounts/:id', (req, res, next) => modernTreasuryController.getInternalAccount(req, res, next));
router.get('/internal-accounts/:id/balance-reports', (req, res, next) => modernTreasuryController.getBalanceReports(req, res, next));

// Counterparties & Hosted Onboarding
router.get('/counterparties', (req, res, next) => modernTreasuryController.listCounterparties(req, res, next));
router.post('/counterparties', (req, res, next) => modernTreasuryController.createCounterparty(req, res, next));
router.post('/counterparties/:id/collect', (req, res, next) => modernTreasuryController.collectAccount(req, res, next));

// Payment Orders & Multi-Rail Execution
router.get('/payment-orders', (req, res, next) => modernTreasuryController.listPaymentOrders(req, res, next));
router.post('/payment-orders', (req, res, next) => modernTreasuryController.createPaymentOrder(req, res, next));
router.post('/payment-orders/collect-rent', (req, res, next) => modernTreasuryController.collectRent(req, res, next));
router.post('/payment-orders/disburse-owner', (req, res, next) => modernTreasuryController.disburseOwnerDistribution(req, res, next));
router.post('/payment-orders/pay-vendor', (req, res, next) => modernTreasuryController.payVendorInvoice(req, res, next));
router.post('/payment-orders/:id/reverse', (req, res, next) => modernTreasuryController.reversePaymentOrder(req, res, next));
router.post('/payment-orders/:id/stop', (req, res, next) => modernTreasuryController.stopPaymentOrder(req, res, next));

// Expected Payments & Auto-Reconciliation
router.get('/expected-payments', (req, res, next) => modernTreasuryController.listExpectedPayments(req, res, next));
router.post('/expected-payments', (req, res, next) => modernTreasuryController.createExpectedPayment(req, res, next));
router.post('/expected-payments/:id/reconcile', (req, res, next) => modernTreasuryController.reconcileExpectedPayment(req, res, next));

// Virtual Accounts (Dedicated per Unit/Tenant)
router.get('/virtual-accounts', (req, res, next) => modernTreasuryController.listVirtualAccounts(req, res, next));
router.post('/virtual-accounts', (req, res, next) => modernTreasuryController.createVirtualAccount(req, res, next));
router.post('/virtual-accounts/:id/deactivate', (req, res, next) => modernTreasuryController.deactivateVirtualAccount(req, res, next));

// Double-Entry Ledgers & Chart of Accounts
router.get('/ledgers', (req, res, next) => modernTreasuryController.getLedger(req, res, next));
router.get('/ledgers/categories', (req, res, next) => modernTreasuryController.listLedgerAccountCategories(req, res, next));
router.post('/ledgers/categories', (req, res, next) => modernTreasuryController.createLedgerAccountCategory(req, res, next));
router.get('/ledgers/accounts', (req, res, next) => modernTreasuryController.listLedgerAccounts(req, res, next));
router.post('/ledgers/accounts', (req, res, next) => modernTreasuryController.createLedgerAccount(req, res, next));
router.post('/ledgers/transactions', (req, res, next) => modernTreasuryController.createLedgerTransaction(req, res, next));

// Clearing Transactions & Invoices
router.get('/transactions', (req, res, next) => modernTreasuryController.listTransactions(req, res, next));
router.get('/invoices', (req, res, next) => modernTreasuryController.listInvoices(req, res, next));
router.post('/invoices', (req, res, next) => modernTreasuryController.createInvoice(req, res, next));

// Returns & NACHA Exceptions
router.get('/returns', (req, res, next) => modernTreasuryController.listReturns(req, res, next));

// Payment Rails & Bank Connections
router.get('/connections', (req, res, next) => modernTreasuryController.getConnectionsStatus(req, res, next));

// Webhooks
router.post('/webhook', (req, res, next) => modernTreasuryController.handleWebhook(req, res, next));

export default router;
