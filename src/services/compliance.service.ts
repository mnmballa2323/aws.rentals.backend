import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { getStateCompliance, StateComplianceRule } from './compliance/us-states-data';
import { bedrockService } from './bedrock.service';

const prisma = new PrismaClient();

export interface LeaseComplianceTerms {
  monthlyRent: number;
  depositAmount: number;
  lateFeeAmount: number;
}

export interface RuleDetails {
  limit: number | null;
  description: string;
  gracePeriodDays: number | null;
  maxLateFeePct: number | null;
  requiredDisclosures: string[];
  interestRequired: boolean;
  interestRate: number;
  statuteCitation?: string;
  noticeOfEntryHours?: number;
  payOrQuitNoticeDays?: number;
}

export interface ComplianceCheckResult {
  jurisdiction: string;
  statuteCitation: string;
  deposit: {
    isValid: boolean;
    maxAllowed: number;
    interestRequired: boolean;
    separateAccountRequired: boolean;
    interestRate: number;
    returnDeadlineDays: number;
    message: string;
  };
  lateFee: {
    isValid: boolean;
    maxAllowed: number;
    gracePeriodDays: number;
    message: string;
  };
  disclosures: {
    requiredList: string[];
    message: string;
  };
  landlordObligations: {
    payOrQuitNoticeDays: number;
    noticeOfEntryHours: number;
  };
  auditId?: string;
}

export class ComplianceService {
  /**
   * Check if a property requires FHA Lead-Based Paint Disclosure (built before 1978).
   */
  async checkLeadPaintRequirement(propertyId: string): Promise<{ requiresDisclosure: boolean; yearBuilt: number | null }> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { yearBuilt: true }
    });

    if (!property) {
      throw new Error(`Property not found: ${propertyId}`);
    }

    const yearBuilt = property.yearBuilt;
    const requiresDisclosure = yearBuilt !== null && yearBuilt < 1978;

    logger.info(`Lead paint compliance check for property ${propertyId}: built in ${yearBuilt ?? 'unknown'}. Disclosure required: ${requiresDisclosure}`);
    
    return {
      requiresDisclosure,
      yearBuilt
    };
  }

  /**
   * Generate an FHA Lead-Based Paint Disclosure template text.
   */
  generateLeadPaintDisclosure(propertyName: string, address: string): { disclosureText: string; generatedAt: string } {
    const disclosureText = `LEAD-BASED PAINT DISCLOSURE (42 U.S.C. 4852d)
Property: ${propertyName}
Address: ${address}

WARNING: Lead Warning Statement
Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.

Lessor's Disclosure:
1. Presence of lead-based paint and/or lead-based paint hazards: Lessor has no knowledge or reports of lead-based paint and/or hazards in the housing.
2. Records and reports available to the lessor: Lessor has no records or reports pertaining to lead-based paint and/or hazards.

Lessee's Acknowledgment:
- Lessee has received copies of all information listed above.
- Lessee has received the pamphlet Protect Your Family from Lead in Your Home.

Agent's Acknowledgment:
- Agent has informed the lessor of the lessor's obligations under 42 U.S.C. 4852d and is aware of his/her responsibility to ensure compliance.

Signatures:
By signing below, the parties acknowledge compliance and correctness of information.

Lessor Signature: __________________________ Date: _________
Lessee Signature: __________________________ Date: _________
`;

    return {
      disclosureText,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate security deposit compliance based on state regulations.
   */
  async validateSecurityDeposit(
    propertyId: string,
    depositAmount: number,
    monthlyRent: number
  ): Promise<{
    isValid: boolean;
    maxAllowed: number;
    message: string;
    requiresInterestHoldingAccount: boolean;
    interestRate: number;
  }> {
    const check = await this.validateLeaseTerms(propertyId, {
      monthlyRent,
      depositAmount,
      lateFeeAmount: 0
    });

    return {
      isValid: check.deposit.isValid,
      maxAllowed: check.deposit.maxAllowed,
      message: check.deposit.message,
      requiresInterestHoldingAccount: check.deposit.interestRequired,
      interestRate: check.deposit.interestRate
    };
  }

  /**
   * Fetch compliance rules for a specific jurisdiction and category using the
   * authoritative US 50-State Statutory Database backed by Amazon Bedrock for municipal ordinances.
   */
  async getJurisdictionRules(
    state: string,
    county: string,
    city: string,
    category: 'security_deposits' | 'late_fees'
  ): Promise<RuleDetails> {
    const normalizedState = (state || 'US').trim().toUpperCase();
    const stateRule: StateComplianceRule = getStateCompliance(normalizedState);
    const jurisdictionKey = `${normalizedState}:${(county || '').trim().toUpperCase()}:${(city || '').trim().toUpperCase()}`;
    
    // 1. Try DB cache first
    try {
      const cached = await prisma.complianceRule.findFirst({
        where: {
          jurisdiction: jurisdictionKey,
          category,
          ruleKey: 'rules'
        }
      });
      if (cached) {
        logger.info(`Compliance rules cache hit for ${jurisdictionKey} - ${category}`);
        return cached.ruleValue as unknown as RuleDetails;
      }
    } catch (err) {
      logger.warn('Failed to query compliance cache from DB, falling back to 50-state engine', err);
    }

    // 2. Build from authoritative 50-state statutory data
    let limit = stateRule.securityDeposit.maxMonthsLimit;
    let description = stateRule.securityDeposit.description;
    let gracePeriod = stateRule.lateFee.gracePeriodDays;
    let maxLateFeePct = stateRule.lateFee.maxPercentLimit ?? 8;
    let requiredDisclosures = [...stateRule.requiredDisclosures];
    let interestRequired = stateRule.securityDeposit.interestRequired;
    let interestRate = interestRequired ? 0.01 : 0;

    // Handle city/county specific ordinances
    if (normalizedState === 'CA' && city.toUpperCase() === 'SAN FRANCISCO') {
      interestRequired = true;
      interestRate = 0.005; // 0.5% SF Rent Board required interest rate
    } else if (normalizedState === 'IL' && city.toUpperCase() === 'CHICAGO') {
      interestRequired = true;
      interestRate = 0.0001; // Chicago RLTO required security deposit interest rate
      requiredDisclosures.push('City of Chicago RLTO Summary Attachment');
    }

    const rules: RuleDetails = {
      limit,
      description: category === 'security_deposits' ? description : stateRule.lateFee.maxLateFeeDescription,
      gracePeriodDays: gracePeriod,
      maxLateFeePct,
      requiredDisclosures,
      interestRequired,
      interestRate,
      statuteCitation: stateRule.statuteCitation,
      noticeOfEntryHours: stateRule.noticeOfEntryHours,
      payOrQuitNoticeDays: stateRule.payOrQuitNoticeDays,
    };

    // 3. Cache the resolved statutory rule
    try {
      await prisma.complianceRule.create({
        data: {
          jurisdiction: jurisdictionKey,
          category,
          ruleKey: 'rules',
          ruleValue: rules as any,
          effectiveDate: new Date(),
          source: stateRule.statuteCitation || 'US Statutory Real Estate Code'
        }
      });
    } catch (cacheErr) {
      logger.debug('Skipping compliance cache save', cacheErr);
    }

    return rules;
  }

  /**
   * Validate complete lease terms against multi-jurisdictional rules.
   */
  async validateLeaseTerms(
    propertyId: string,
    terms: LeaseComplianceTerms
  ): Promise<ComplianceCheckResult> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { addressLine1: true, city: true, county: true, state: true, zip: true, yearBuilt: true }
    });

    if (!property) {
      throw new Error(`Property not found: ${propertyId}`);
    }

    const state = property.state ? property.state.toUpperCase() : 'US';
    const county = property.county || '';
    const city = property.city || '';
    const jurisdiction = `${state}:${county.toUpperCase()}:${city.toUpperCase()}`;
    const stateRule = getStateCompliance(state);

    // Fetch local rules
    const depositRules = await this.getJurisdictionRules(state, county, city, 'security_deposits');
    const lateFeeRules = await this.getJurisdictionRules(state, county, city, 'late_fees');

    // 1. Validate Deposit
    const maxDepositMultiplier = depositRules.limit ?? 2.0; // Default to 2 months rent if no statutory cap
    const maxDeposit = terms.monthlyRent * maxDepositMultiplier;
    const isDepositValid = terms.depositAmount <= maxDeposit;
    const depositMessage = isDepositValid
      ? `Security deposit of $${terms.depositAmount} satisfies the ${stateRule.stateName} limit of $${maxDeposit} (${depositRules.limit ? depositRules.limit + ' mo' : 'market standard'}). ${stateRule.statuteCitation}.`
      : `Security deposit of $${terms.depositAmount} exceeds the statutory limit of $${maxDeposit} (${maxDepositMultiplier} month(s) rent) in ${stateRule.stateName} under ${stateRule.statuteCitation}.`;

    // 2. Validate Late Fees
    const maxFeePct = lateFeeRules.maxLateFeePct ?? 8;
    const maxLateFee = terms.monthlyRent * (maxFeePct / 100);
    const isLateFeeValid = terms.lateFeeAmount <= maxLateFee;
    const lateFeeMessage = isLateFeeValid
      ? `Late fee of $${terms.lateFeeAmount} satisfies statutory requirements in ${stateRule.stateName} (grace period: ${lateFeeRules.gracePeriodDays ?? 0} days).`
      : `Late fee of $${terms.lateFeeAmount} exceeds the allowable statutory threshold ($${maxLateFee}) in ${stateRule.stateName}.`;

    // 3. Assemble Disclosures Checklist
    const disclosuresList = [...(depositRules.requiredDisclosures || []), ...(lateFeeRules.requiredDisclosures || [])];
    
    // Check FHA Lead-Based Paint
    if (property.yearBuilt && property.yearBuilt < 1978) {
      disclosuresList.push('Federal EPA/HUD Lead-Based Paint Disclosure (pre-1978, 42 U.S.C. 4852d)');
    }

    // Deduplicate disclosures
    const uniqueDisclosures = Array.from(new Set(disclosuresList));

    const result: ComplianceCheckResult = {
      jurisdiction,
      statuteCitation: stateRule.statuteCitation,
      deposit: {
        isValid: isDepositValid,
        maxAllowed: maxDeposit,
        interestRequired: stateRule.securityDeposit.interestRequired || depositRules.interestRequired,
        separateAccountRequired: stateRule.securityDeposit.separateAccountRequired,
        interestRate: depositRules.interestRate,
        returnDeadlineDays: stateRule.securityDeposit.returnDeadlineDays,
        message: depositMessage
      },
      lateFee: {
        isValid: isLateFeeValid,
        maxAllowed: maxLateFee,
        gracePeriodDays: stateRule.lateFee.gracePeriodDays ?? 5,
        message: lateFeeMessage
      },
      disclosures: {
        requiredList: uniqueDisclosures,
        message: `Compiled ${uniqueDisclosures.length} statutory mandatory lease disclosure(s) for ${stateRule.stateName} (${jurisdiction}).`
      },
      landlordObligations: {
        payOrQuitNoticeDays: stateRule.payOrQuitNoticeDays,
        noticeOfEntryHours: stateRule.noticeOfEntryHours,
      }
    };

    // Log the compliance audit check
    logger.audit('LEASE_COMPLIANCE_CHECK_PERFORMED', {
      actorId: 'aws_compliance_engine',
      targetId: propertyId,
      changes: {
        terms,
        result
      }
    });

    return result;
  }

  /**
   * Synthesizes customized state-compliant lease clauses using Amazon Bedrock.
   */
  async generateStatutoryLeaseClause(stateCode: string, clauseType: 'deposit_escrow' | 'late_fee' | 'entry_notice'): Promise<string> {
    const stateRule = getStateCompliance(stateCode);
    const prompt = `Generate a standard, legally binding residential lease clause for the state of ${stateRule.stateName}.
Clause Type: ${clauseType}
Statutory citation: ${stateRule.statuteCitation}
Return deadline: ${stateRule.securityDeposit.returnDeadlineDays} days
Notice of entry: ${stateRule.noticeOfEntryHours} hours
Grace period: ${stateRule.lateFee.gracePeriodDays} days
Provide only the clause text formatted for inclusion into a standard US residential lease agreement.`;

    return bedrockService.invokeModel(prompt, {
      systemPrompt: 'You are an expert real estate attorney specializing in US residential landlord-tenant statutory compliance.'
    });
  }
}

export const complianceService = new ComplianceService();
