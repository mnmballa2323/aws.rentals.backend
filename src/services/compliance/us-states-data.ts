/**
 * Comprehensive 50-State (+ DC) USA Residential Landlord-Tenant Statutory Compliance Database.
 * Accurately models security deposit caps, return deadlines, escrow rules, statutory late fee
 * limitations, pay-or-quit notice durations, and mandatory state-specific lease disclosures.
 */

export interface StateComplianceRule {
  stateCode: string;
  stateName: string;
  statuteCitation: string;
  
  // Security Deposit Statutory Rules
  securityDeposit: {
    maxMonthsLimit: number | null; // null = no statutory limit set by state law
    returnDeadlineDays: number;    // calendar days to return itemized deposit
    separateAccountRequired: boolean;
    interestRequired: boolean;
    interestRateDescription?: string;
    bankNoticeRequired: boolean;  // Must notify tenant of bank name and address
    description: string;
  };

  // Late Fee Statutory Rules
  lateFee: {
    gracePeriodDays: number;       // Statutory mandatory grace period before fee can be assessed
    maxLateFeeDescription: string;
    maxPercentLimit?: number;
    maxDollarLimit?: number;
  };

  // Eviction / Non-Payment Notice Requirements
  payOrQuitNoticeDays: number;

  // Landlord Notice of Entry (hours)
  noticeOfEntryHours: number;

  // Mandatory Federal & State Disclosures
  requiredDisclosures: string[];

  // Tenant Screening & Application Fee Restrictions
  screeningRules: {
    maxApplicationFee?: number;
    banCriminalHistoryLookback?: boolean;
    banEvictionHistoryLookback?: boolean;
    sourceOfIncomeProtection: boolean; // Section 8 / housing voucher discrimination banned
  };
}

export const US_50_STATES_COMPLIANCE: Record<string, StateComplianceRule> = {
  AL: {
    stateCode: 'AL',
    stateName: 'Alabama',
    statuteCitation: 'Ala. Code § 35-9A-201',
    securityDeposit: {
      maxMonthsLimit: 1.0, // 1 month rent (pets/hazards can add more)
      returnDeadlineDays: 60,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 1 month rent for standard residential security deposit.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Must be reasonable estimate of landlord expenses.',
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Authorized Landlord Agent Identification'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  AK: {
    stateCode: 'AK',
    stateName: 'Alaska',
    statuteCitation: 'Alaska Stat. § 34.03.070',
    securityDeposit: {
      maxMonthsLimit: 2.0, // 2 months rent (unless rent > $2,000/mo)
      returnDeadlineDays: 14, // 30 days if tenant leaves without notice
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Maximum 2 months rent. Must be held in a trust account in a financial institution.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable liquidated damages specified in lease agreement.',
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Trust Account Location', 'Notice of Entry Guidelines'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  AZ: {
    stateCode: 'AZ',
    stateName: 'Arizona',
    statuteCitation: 'Ariz. Rev. Stat. § 33-1321',
    securityDeposit: {
      maxMonthsLimit: 1.5,
      returnDeadlineDays: 14, // 14 business days
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 1.5 months rent cannot be exceeded unless tenant voluntarily pays more.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable late fee as expressly stated in written rental agreement.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Bed Bug Educational Notice', 'Arizona Residential Landlord & Tenant Act Availability Notice'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  AR: {
    stateCode: 'AR',
    stateName: 'Arkansas',
    statuteCitation: 'Ark. Code § 18-16-304',
    securityDeposit: {
      maxMonthsLimit: 2.0,
      returnDeadlineDays: 60,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 2 months rent for landlords owning 6 or more units.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and defined in written lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Landlord Contact Disclosure'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    statuteCitation: 'Cal. Civ. Code § 1950.5 & AB 12',
    securityDeposit: {
      maxMonthsLimit: 1.0, // AB 12 (effective July 1, 2024): strictly 1 month rent (max 2 months only for qualifying mom-and-pop landlords)
      returnDeadlineDays: 21,
      separateAccountRequired: false,
      interestRequired: false, // Required by local ordinances in San Francisco, Berkeley, Los Angeles
      bankNoticeRequired: false,
      description: 'Strict 1 month rent cap under California AB 12. Itemized accounting & receipts required within 21 calendar days.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Must reflect actual administrative cost. Cannot be punitive.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'AB 1482 Tenant Protection Act (Rent Cap & Just Cause Eviction Notice)',
      'AB 551 Bed Bug Information Disclosure',
      'Megan\'s Law Sex Offender Database Disclosure (Cal. Civ. Code § 2079.10a)',
      'Proposition 65 Warning for Chemical Exposure',
      'Flood Hazard Disclosure (Government Code § 8589.45)',
      'Shared Utilities Disclosure (Cal. Civ. Code § 1940.9)',
      'Periodic Pest Control Notice'
    ],
    screeningRules: {
      maxApplicationFee: 62.00, // Adjusted annually based on CPI
      banCriminalHistoryLookback: false, // Fair Chance ordinances in Oakland/Berkeley/SF
      sourceOfIncomeProtection: true, // SB 329: Prohibits discrimination against Section 8 voucher holders
    },
  },
  CO: {
    stateCode: 'CO',
    stateName: 'Colorado',
    statuteCitation: 'Colo. Rev. Stat. § 38-12-103',
    securityDeposit: {
      maxMonthsLimit: null, // No statutory limit
      returnDeadlineDays: 30, // Can be extended to 60 days in lease
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 30 days (or up to 60 days if stipulated in lease). Treble damages for willful retention.',
    },
    lateFee: {
      gracePeriodDays: 7,
      maxLateFeeDescription: 'Lesser of $50 or 5% of monthly past due rent after mandatory 7-day grace period.',
      maxPercentLimit: 5,
      maxDollarLimit: 50,
    },
    payOrQuitNoticeDays: 10,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Warranty of Habitability Disclosure', 'Radon Hazard Disclosure'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  CT: {
    stateCode: 'CT',
    stateName: 'Connecticut',
    statuteCitation: 'Conn. Gen. Stat. § 47a-21',
    securityDeposit: {
      maxMonthsLimit: 2.0, // 1 month if tenant is 62 or older
      returnDeadlineDays: 30, // or 15 days after receiving forwarding address
      separateAccountRequired: true,
      interestRequired: true,
      interestRateDescription: 'Must pay annual interest set by Connecticut Banking Commissioner.',
      bankNoticeRequired: true,
      description: 'Maximum 2 months rent (1 month if 62+). Mandatory interest-bearing escrow account.',
    },
    lateFee: {
      gracePeriodDays: 9,
      maxLateFeeDescription: 'Lesser of $5 or 5% of past due balance after 9-day statutory grace period.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Escrow Bank Details', 'Bed Bug Inspection & History Notice'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  DE: {
    stateCode: 'DE',
    stateName: 'Delaware',
    statuteCitation: 'Del. Code tit. 25 § 5514',
    securityDeposit: {
      maxMonthsLimit: 1.0, // 1 month for primary 1-year leases
      returnDeadlineDays: 20,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Maximum 1 month rent for year-long leases. Must be in escrow account in a federally insured bank in Delaware.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Cannot exceed 5% of monthly rent after 5-day grace period.',
      maxPercentLimit: 5,
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Summary of Delaware Landlord-Tenant Code', 'Security Deposit Bank Account Location'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  DC: {
    stateCode: 'DC',
    stateName: 'District of Columbia',
    statuteCitation: 'D.C. Code § 42-3502.17',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 45,
      separateAccountRequired: true,
      interestRequired: true,
      interestRateDescription: 'Statement savings rate in DC financial institution.',
      bankNoticeRequired: true,
      description: 'Strict 1 month rent ceiling. Must be held in an interest-bearing escrow account in DC.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Strict statutory cap of 5% of monthly rent after 5-day grace period.',
      maxPercentLimit: 5,
    },
    payOrQuitNoticeDays: 30,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'DC Tenant Bill of Rights', 'Rent Control Exemption or Registration Disclosure'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    statuteCitation: 'Fla. Stat. § 83.49',
    securityDeposit: {
      maxMonthsLimit: null, // No statutory limit
      returnDeadlineDays: 15, // 15 days if no claim, 30 days if claiming deductions
      separateAccountRequired: true,
      interestRequired: false, // Optional: if interest bearing, pay 5% or 75% of annualized earnings
      bankNoticeRequired: true, // Must notify tenant within 30 days of receiving deposit
      description: 'Must be held in Florida banking institution in separate account (non-commingled) or surety bond.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Must be reasonable liquidated damages stated in written lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Statutory Radon Gas Notification (Fla. Stat. § 404.056(5))',
      'Security Deposit Bank Location & Handling Disclosure (Fla. Stat. § 83.49(3))'
    ],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    statuteCitation: 'Ga. Code § 44-7-30',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30,
      separateAccountRequired: true, // If landlord manages 10+ units
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Separate escrow account required if owning 10+ units. Pre-move-in condition checklist mandatory.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable fee agreed upon in lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Pre-Existing Property Damage Inspection Checklist', 'Flooding Disclosure'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  HI: {
    stateCode: 'HI',
    stateName: 'Hawaii',
    statuteCitation: 'Haw. Rev. Stat. § 521-44',
    securityDeposit: {
      maxMonthsLimit: 1.0, // 1 month rent (plus pet deposit if applicable)
      returnDeadlineDays: 14,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 1 month rent. Return within 14 days of lease termination with receipts.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Cannot exceed 8% of late amount.',
      maxPercentLimit: 8,
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Condition of Premises Inventory Report'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  ID: {
    stateCode: 'ID',
    stateName: 'Idaho',
    statuteCitation: 'Idaho Code § 6-321',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 21, // up to 30 days by written agreement
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 21 days (or up to 30 days if specified in lease).',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and stated in lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    statuteCitation: '765 Ill. Comp. Stat. § 710/1',
    securityDeposit: {
      maxMonthsLimit: null, // No state limit (Chicago municipal rules may apply)
      returnDeadlineDays: 30, // 45 days if full deposit returned without deductions
      separateAccountRequired: false,
      interestRequired: true, // For landlords with 25+ units held over 6 months
      interestRateDescription: 'Annual interest equal to minimum rate set by Illinois State Treasurer.',
      bankNoticeRequired: false,
      description: 'Landlords with 25+ units must pay interest on deposits held > 6 months.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'For rent under $500: max $20; for rent over $500: max $20 + 20% of amount over $500.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Radon Gas Hazard Disclosure (420 ILCS 46/25)',
      'Shared Utility Metering Disclosure',
      'Heating Cost History (upon request)'
    ],
    screeningRules: {
      sourceOfIncomeProtection: true,
      banCriminalHistoryLookback: false, // Cook County Just Housing Amendment requires two-step screening
    },
  },
  IN: {
    stateCode: 'IN',
    stateName: 'Indiana',
    statuteCitation: 'Ind. Code § 32-31-3-12',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 45,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory limit. Return within 45 days with itemized deductions.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed upon in writing.',
    },
    payOrQuitNoticeDays: 10,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Smoke Detector Functionality Acknowledgment', 'Manager Contact Information'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  IA: {
    stateCode: 'IA',
    stateName: 'Iowa',
    statuteCitation: 'Iowa Code § 562A.12',
    securityDeposit: {
      maxMonthsLimit: 2.0,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: false, // Landlord may keep interest earned during first 5 years
      bankNoticeRequired: false,
      description: 'Maximum 2 months rent. Must be deposited in a federally insured bank account.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'If rent is $700 or less: max $12/day or $60/mo. If rent > $700: max $20/day or $100/mo.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Comprehensive Environmental Cleanup Disclosures'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  KS: {
    stateCode: 'KS',
    stateName: 'Kansas',
    statuteCitation: 'Kan. Stat. § 58-2550',
    securityDeposit: {
      maxMonthsLimit: 1.0, // 1.5 months if furnished or pets
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Max 1 month rent for unfurnished; 1.5 months if furnished.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable fee defined in lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  KY: {
    stateCode: 'KY',
    stateName: 'Kentucky',
    statuteCitation: 'Ky. Rev. Stat. § 383.580',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30, // 60 days if contested
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Mandatory separate banking account used solely for security deposits. Location disclosure required.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed in writing.',
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Security Deposit Bank Account Location', 'Move-In Condition Checklist'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  LA: {
    stateCode: 'LA',
    stateName: 'Louisiana',
    statuteCitation: 'La. Rev. Stat. § 9:3251',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 30 days with itemization.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Agreed in contract.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  ME: {
    stateCode: 'ME',
    stateName: 'Maine',
    statuteCitation: 'Me. Rev. Stat. tit. 14 § 6032',
    securityDeposit: {
      maxMonthsLimit: 2.0,
      returnDeadlineDays: 30, // 21 days for tenancy-at-will
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Maximum 2 months rent. Escrow account protected from landlord creditors.',
    },
    lateFee: {
      gracePeriodDays: 15,
      maxLateFeeDescription: 'Maximum 4% of monthly rent after mandatory 15-day grace period.',
      maxPercentLimit: 4,
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Bed Bug Infestation History', 'Energy Efficiency Disclosure', 'Smoking Policy Disclosure'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  MD: {
    stateCode: 'MD',
    stateName: 'Maryland',
    statuteCitation: 'Md. Code Real Prop. § 8-203',
    securityDeposit: {
      maxMonthsLimit: 1.0, // Reduced from 2 months under recent statutory amendments
      returnDeadlineDays: 45,
      separateAccountRequired: true,
      interestRequired: true,
      interestRateDescription: 'Daily U.S. Treasury yield curve rate or statutory minimum.',
      bankNoticeRequired: true,
      description: 'Strict statutory limit. Must be deposited in an insured Maryland banking account within 30 days.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Cannot exceed 5% of monthly rent amount.',
      maxPercentLimit: 5,
    },
    payOrQuitNoticeDays: 10,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Tenant Receipt for Security Deposit', 'Water and Sewage Billing Allocations'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  MA: {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    statuteCitation: 'Mass. Gen. Laws ch. 186 § 15B',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: true,
      interestRateDescription: '5% interest per year or actual bank interest earned.',
      bankNoticeRequired: true,
      description: 'Strict 1 month rent limit. Dedicated interest-bearing escrow account in MA bank. Detailed condition statement required.',
    },
    lateFee: {
      gracePeriodDays: 30,
      maxLateFeeDescription: 'Late fee prohibited until rent is 30 days overdue.',
    },
    payOrQuitNoticeDays: 14,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Security Deposit Bank & Account Details Receipt',
      'Apartment Condition Statement (signed within 15 days of move-in)',
      'Insurance Notification'
    ],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  MI: {
    stateCode: 'MI',
    stateName: 'Michigan',
    statuteCitation: 'Mich. Comp. Laws § 554.602',
    securityDeposit: {
      maxMonthsLimit: 1.5,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Maximum 1.5 months rent. Bank location notice must be provided within 14 days of move-in.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed upon in contract.',
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Truth in Renting Act Notice', 'Security Deposit Bank Address Notice', 'Inventory Checklist'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  MN: {
    stateCode: 'MN',
    stateName: 'Minnesota',
    statuteCitation: 'Minn. Stat. § 504B.178',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 21,
      separateAccountRequired: false,
      interestRequired: true,
      interestRateDescription: '1% non-compounded annual simple interest.',
      bankNoticeRequired: false,
      description: 'Return within 21 days with 1% simple interest.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Cannot exceed 8% of overdue rent payment.',
      maxPercentLimit: 8,
    },
    payOrQuitNoticeDays: 14,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Outstanding Inspection Orders and Citations'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  MS: {
    stateCode: 'MS',
    stateName: 'Mississippi',
    statuteCitation: 'Miss. Code § 89-8-21',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 45,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 45 days.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and stipulated in lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  MO: {
    stateCode: 'MO',
    stateName: 'Missouri',
    statuteCitation: 'Mo. Rev. Stat. § 535.300',
    securityDeposit: {
      maxMonthsLimit: 2.0,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 2 months rent. Must be held in a bank, credit union, or depository institution.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and established in lease agreement.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Methamphetamine Contamination Notice'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  MT: {
    stateCode: 'MT',
    stateName: 'Montana',
    statuteCitation: 'Mont. Code § 70-25-201',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30, // 10 days if no cleaning/damages
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Return within 10 days if no damage, 30 days if deductions made.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable fee defined in lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Condition of Premises Statement'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  NE: {
    stateCode: 'NE',
    stateName: 'Nebraska',
    statuteCitation: 'Neb. Rev. Stat. § 76-1416',
    securityDeposit: {
      maxMonthsLimit: 1.0, // 1.25 months if pets allowed
      returnDeadlineDays: 14,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 1 month rent (1.25 months with pets). 14-day return deadline.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable late charges.',
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Identification of Landlord/Manager'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  NV: {
    stateCode: 'NV',
    stateName: 'Nevada',
    statuteCitation: 'Nev. Rev. Stat. § 118A.242',
    securityDeposit: {
      maxMonthsLimit: 3.0,
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 3 months rent. Return within 30 days.',
    },
    lateFee: {
      gracePeriodDays: 3,
      maxLateFeeDescription: 'Cannot exceed 5% of monthly periodic rent.',
      maxPercentLimit: 5,
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'NRS 118A Summary Notice'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  NH: {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    statuteCitation: 'N.H. Rev. Stat. § 540-A:6',
    securityDeposit: {
      maxMonthsLimit: 1.0, // or $100, whichever is greater
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: true, // If held for 1+ year
      interestRateDescription: 'Interest equal to passbook savings rate in NH institution.',
      bankNoticeRequired: true,
      description: 'Maximum 1 month rent. Dedicated account; must pay interest on tenancies lasting > 1 year.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed in writing.',
    },
    payOrQuitNoticeDays: 7,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Security Deposit Bank Information Receipt'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  NJ: {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    statuteCitation: 'N.J. Stat. § 46:8-19',
    securityDeposit: {
      maxMonthsLimit: 1.5,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: true,
      interestRateDescription: 'Full interest earned or 1.5% statutory minimum.',
      bankNoticeRequired: true,
      description: 'Maximum 1.5 months rent. Must be in interest-bearing account in NJ bank. Annual interest payout to tenant required.',
    },
    lateFee: {
      gracePeriodDays: 5, // For senior citizens receiving pensions
      maxLateFeeDescription: 'Must be reasonable liquidated damages stated in lease.',
    },
    payOrQuitNoticeDays: 30,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Truth in Renting Act Booklet Acknowledgment',
      'Flood Hazard Disclosure (P.L. 2023, c. 94)',
      'Window Guard Notice'
    ],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  NM: {
    stateCode: 'NM',
    stateName: 'New Mexico',
    statuteCitation: 'N.M. Stat. § 47-8-18',
    securityDeposit: {
      maxMonthsLimit: 1.0, // If 1 year+ lease, can be higher but must earn interest
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false, // Required if deposit exceeds 1 month rent on multi-year lease
      bankNoticeRequired: false,
      description: 'Maximum 1 month rent for tenancies under 1 year.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Cannot exceed 10% of monthly rent installment.',
      maxPercentLimit: 10,
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Identity of Manager/Owner'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    statuteCitation: 'N.Y. Gen. Oblig. Law § 7-108 & HSTPA',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 14,
      separateAccountRequired: true,
      interestRequired: true, // For buildings with 6+ units, 1% administrative fee to landlord
      bankNoticeRequired: true,
      description: 'Strict 1 month rent limit under Housing Stability & Tenant Protection Act (HSTPA). 14-day return deadline with itemized receipts.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Lesser of $50 or 5% of monthly rent after 5-day mandatory grace period.',
      maxPercentLimit: 5,
      maxDollarLimit: 50,
    },
    payOrQuitNoticeDays: 14,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Fire Sprinkler System Disclosure',
      'Window Guard Notice (NYC & applicable municipalities)',
      'Bed Bug History Notice',
      'Security Deposit Bank Account Details Notice'
    ],
    screeningRules: {
      maxApplicationFee: 20.00, // Statewide statutory cap under HSTPA
      banEvictionHistoryLookback: true, // Anti-blacklisting statute
      sourceOfIncomeProtection: true,
    },
  },
  NC: {
    stateCode: 'NC',
    stateName: 'North Carolina',
    statuteCitation: 'N.C. Gen. Stat. § 42-51',
    securityDeposit: {
      maxMonthsLimit: 2.0, // 2 weeks for week-to-week, 1.5 mo for month-to-month, 2 mo for longer
      returnDeadlineDays: 30, // up to 60 days if interim notice provided
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Maximum 2 months rent. Must be in trust account in licensed NC bank or bonded.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Greater of $15 or 5% of monthly rent after 5-day grace period.',
      maxPercentLimit: 5,
      maxDollarLimit: 15,
    },
    payOrQuitNoticeDays: 10,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Security Deposit Trust Account Location', 'Smoke & Carbon Monoxide Detector Notices'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  ND: {
    stateCode: 'ND',
    stateName: 'North Dakota',
    statuteCitation: 'N.D. Cent. Code § 47-16-07.1',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: true,
      interestRateDescription: 'Passbook savings rate if held for more than 9 months.',
      bankNoticeRequired: false,
      description: 'Maximum 1 month rent (up to 2 months if pet or convicted felon). Must pay interest on tenancies > 9 months.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable late fee.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    statuteCitation: 'Ohio Rev. Code § 5321.16',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: true, // If deposit > $50 and tenant stays > 6 months
      interestRateDescription: '5% per annum on the amount exceeding 1 month rent.',
      bankNoticeRequired: false,
      description: 'No maximum limit. Must pay 5% interest per year on deposit amounts exceeding 1 month rent held > 6 months.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and stipulated in written lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Landlord or Agent Identity'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  OK: {
    stateCode: 'OK',
    stateName: 'Oklahoma',
    statuteCitation: 'Okla. Stat. tit. 41 § 115',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 45,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Must be held in an escrow account in a federally insured financial institution in Oklahoma.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable late fee agreed upon in lease.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Methamphetamine Contamination Disclosure', 'Flood Disclosure'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  OR: {
    stateCode: 'OR',
    stateName: 'Oregon',
    statuteCitation: 'Or. Rev. Stat. § 90.300',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 31,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Return within 31 days. Must give receipt within 2 weeks of payment.',
    },
    lateFee: {
      gracePeriodDays: 4,
      maxLateFeeDescription: 'One of 3 options: flat fee of reasonable cost, per-day fee of 6% flat, or 5% periodic fee.',
      maxPercentLimit: 5,
    },
    payOrQuitNoticeDays: 10, // 10 days if given on 8th day, 13 days if given on 5th day
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Flood Hazard Disclosure',
      'Carbon Monoxide Detector Notice',
      'Smoking Policy Disclosure',
      'Recycling Notice (for complexes with 5+ units)'
    ],
    screeningRules: {
      sourceOfIncomeProtection: true,
      banCriminalHistoryLookback: false, // Portland municipal rules enforce strict limits
    },
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    statuteCitation: '68 Pa. Stat. § 250.511a',
    securityDeposit: {
      maxMonthsLimit: 2.0, // 2 months 1st year, drops to 1 month 2nd year and beyond
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: true, // From 3rd year onwards
      interestRateDescription: 'Regular savings account interest minus 1% administrative fee to landlord.',
      bankNoticeRequired: true,
      description: 'Maximum 2 months rent first year; 1 month maximum thereafter. Escrow account in PA institution.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and defined in written lease.',
    },
    payOrQuitNoticeDays: 10,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Security Deposit Bank Account Details (after year 2)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  RI: {
    stateCode: 'RI',
    stateName: 'Rhode Island',
    statuteCitation: 'R.I. Gen. Laws § 34-18-19',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 20,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Strict 1 month rent maximum. Return within 20 days of vacating with itemization.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable late fee.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Lead Hazard Mitigation Compliance Certificate'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  SC: {
    stateCode: 'SC',
    stateName: 'South Carolina',
    statuteCitation: 'S.C. Code § 27-40-410',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 30 days.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Reasonable and stated in contract.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Unequal Deposit Disclosure (if charging different deposit rates)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  SD: {
    stateCode: 'SD',
    stateName: 'South Dakota',
    statuteCitation: 'S.D. Codified Laws § 43-32-6.1',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 14,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 1 month rent (higher by agreement if special conditions). Fastest in US: return within 14 days.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed upon in writing.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Methamphetamine Manufacturing Disclosure'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tennessee',
    statuteCitation: 'Tenn. Code § 66-28-301',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Mandatory separate bank account used exclusively for tenant deposits. Notice of bank location required.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Cannot exceed 10% of monthly rent balance after 5-day grace period.',
      maxPercentLimit: 10,
    },
    payOrQuitNoticeDays: 14,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Security Deposit Bank Account Location'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    statuteCitation: 'Tex. Prop. Code § 92.103',
    securityDeposit: {
      maxMonthsLimit: null, // No statutory limit
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory limit. Return within 30 days of surrender and written forwarding address.',
    },
    lateFee: {
      gracePeriodDays: 2,
      maxLateFeeDescription: 'Strict statutory cap under Tex. Prop. Code § 92.019: 10% (structures <= 4 units) or 12% (> 4 units) after mandatory 2 full days grace period.',
      maxPercentLimit: 12,
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Subchapter D Security Devices Statutory Notice (window latches, deadbolts, keyless bolting devices)',
      'Right to Repair and Deduct Remedies Notice',
      'Landlord\'s Towing or Parking Rules'
    ],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  UT: {
    stateCode: 'UT',
    stateName: 'Utah',
    statuteCitation: 'Utah Code § 57-17-3',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 30 days of tenancy conclusion.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Greater of $75 or 10% of rent amount.',
      maxPercentLimit: 10,
      maxDollarLimit: 75,
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Methamphetamine Decontamination Disclosure'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  VT: {
    stateCode: 'VT',
    stateName: 'Vermont',
    statuteCitation: 'Vt. Stat. tit. 9 § 4461',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 14,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Return within 14 days with written statement of deductions and receipts.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed in lease.',
    },
    payOrQuitNoticeDays: 14,
    noticeOfEntryHours: 48,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  VA: {
    stateCode: 'VA',
    stateName: 'Virginia',
    statuteCitation: 'Va. Code § 55.1-1226',
    securityDeposit: {
      maxMonthsLimit: 2.0,
      returnDeadlineDays: 45,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Maximum 2 months rent. Return within 45 days.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Cannot exceed the lesser of 10% of monthly rent or 10% of unpaid balance.',
      maxPercentLimit: 10,
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 72,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Statement of Tenant Rights and Responsibilities',
      'Mold Disclosure and Inspection Checklist',
      'Military Air Installation / Noise Zone Disclosure'
    ],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    statuteCitation: 'Wash. Rev. Code § 59.18.260',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 21,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: true,
      description: 'Mandatory escrow account in financial institution. Pre-move-in written condition checklist mandatory before collecting deposit.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and agreed in writing.',
    },
    payOrQuitNoticeDays: 14,
    noticeOfEntryHours: 48,
    requiredDisclosures: [
      'Lead-Based Paint (pre-1978)',
      'Move-In Condition Checklist (required to collect deposit)',
      'Security Deposit Bank Account Location Receipt',
      'Mold Information and Prevention Pamphlet',
      'Fire Safety & Evacuation Plan'
    ],
    screeningRules: {
      sourceOfIncomeProtection: true,
      banCriminalHistoryLookback: false, // Seattle Fair Chance Housing Ordinance prohibits criminal history inquiry
    },
  },
  WV: {
    stateCode: 'WV',
    stateName: 'West Virginia',
    statuteCitation: 'W. Va. Code § 37-6A-2',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 60, // 45 days if new tenant occupies
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory maximum. Return within 60 days of vacating.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable late fee.',
    },
    payOrQuitNoticeDays: 0, // Immediate notice allowed
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
  WI: {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    statuteCitation: 'Wis. Stat. § 704.28',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 21,
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'No statutory limit. Return within 21 days with itemized accounting.',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable and contracted in lease.',
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)', 'Pre-Existing Code Violations Notice', 'Shared Utility Disclosure', 'Check-In Checklist Notice'],
    screeningRules: { sourceOfIncomeProtection: true },
  },
  WY: {
    stateCode: 'WY',
    stateName: 'Wyoming',
    statuteCitation: 'Wyo. Stat. § 1-21-1208',
    securityDeposit: {
      maxMonthsLimit: null,
      returnDeadlineDays: 30, // 15 days if no damage
      separateAccountRequired: false,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Return within 30 days (15 days if no deductions).',
    },
    lateFee: {
      gracePeriodDays: 0,
      maxLateFeeDescription: 'Reasonable fee established in lease.',
    },
    payOrQuitNoticeDays: 3,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint (pre-1978)'],
    screeningRules: { sourceOfIncomeProtection: false },
  },
};

/**
 * Returns compliance rules for a specified US State.
 * Defaults to federal standard rules if state is unrecognized.
 */
export function getStateCompliance(stateCode: string): StateComplianceRule {
  const normalized = (stateCode || '').trim().toUpperCase();
  const rule = US_50_STATES_COMPLIANCE[normalized];
  if (rule) {
    return rule;
  }

  // Fallback baseline for US federal standards
  return {
    stateCode: normalized || 'US',
    stateName: 'United States (Federal Standard)',
    statuteCitation: 'Federal Fair Housing Act & FCRA',
    securityDeposit: {
      maxMonthsLimit: 1.0,
      returnDeadlineDays: 30,
      separateAccountRequired: true,
      interestRequired: false,
      bankNoticeRequired: false,
      description: 'Standard residential deposit baseline of 1 month rent.',
    },
    lateFee: {
      gracePeriodDays: 5,
      maxLateFeeDescription: 'Maximum 5% of monthly rent after 5-day grace period.',
      maxPercentLimit: 5,
    },
    payOrQuitNoticeDays: 5,
    noticeOfEntryHours: 24,
    requiredDisclosures: ['Lead-Based Paint Disclosure (pre-1978 properties, 42 U.S.C. 4852d)'],
    screeningRules: {
      sourceOfIncomeProtection: true,
    },
  };
}
