import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

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
}

export interface ComplianceCheckResult {
  jurisdiction: string;
  deposit: {
    isValid: boolean;
    maxAllowed: number;
    interestRequired: boolean;
    interestRate: number;
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
    const disclosureText = `LEAD-BASED PAINT DISCLOSURE
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
   * Fetch compliance rules for a specific jurisdiction and category.
   * Leverages the database cache first, and falls back to Gemini legal researcher.
   */
  async getJurisdictionRules(
    state: string,
    county: string,
    city: string,
    category: 'security_deposits' | 'late_fees'
  ): Promise<RuleDetails> {
    const jurisdictionKey = `${state.toUpperCase()}:${(county || '').trim().toUpperCase()}:${(city || '').trim().toUpperCase()}`;
    
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
      logger.warn('Failed to query compliance cache from DB, falling back to provider lookup', err);
    }

    // 2. Try Gemini AI legal lookup if API key is set
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        logger.info(`Invoking Gemini compliance agent to research local laws for ${jurisdictionKey} - ${category}`);
        const prompt = `Research the landlord-tenant compliance laws for the following US jurisdiction:
State: ${state}
County: ${county || 'Unknown'}
City: ${city || 'Unknown'}

Provide the current legal limits for the following category: "${category}".
Ensure your response is accurate according to the latest statutes in this state, county, and city.

Respond only with a JSON object conforming exactly to this structure:
{
  "jurisdiction": "${state}:${county}:${city}",
  "category": "${category}",
  "rules": {
    "limit": 100,
    "description": "Short explanation of the law",
    "gracePeriodDays": 1,
    "maxLateFeePct": 10,
    "requiredDisclosures": ["Disclosure Name 1", "Disclosure Name 2"],
    "interestRequired": true,
    "interestRate": 0.01
  },
  "source": "Statute name or reference citation"
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (response.ok) {
          const json = (await response.json()) as any;
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const result = JSON.parse(cleanText);
          const rules = result.rules as RuleDetails;

          // Store in cache
          await prisma.complianceRule.create({
            data: {
              jurisdiction: jurisdictionKey,
              category,
              ruleKey: 'rules',
              ruleValue: rules as any,
              effectiveDate: new Date(),
              source: result.source || 'Gemini Legal Research'
            }
          });

          return rules;
        }
      } catch (err) {
        logger.error(`Gemini compliance research failed for ${jurisdictionKey}`, err);
      }
    }

    // 3. High-fidelity static rules fallback
    logger.warn(`No compliance rules cached or research failed. Returning fallback rules for ${jurisdictionKey}`);
    const fallbackRules: RuleDetails = {
      limit: null,
      description: 'Default US compliance fallback limits applied.',
      gracePeriodDays: 5,
      maxLateFeePct: 10,
      requiredDisclosures: ['Standard Lead-Based Paint (if pre-1978)'],
      interestRequired: false,
      interestRate: 0
    };

    if (state.toUpperCase() === 'CA') {
      fallbackRules.limit = 1; // CA limits security deposits to 1 month rent
      fallbackRules.description = 'California AB 12 limits deposit to 1 month. Late fees must be reasonable.';
      fallbackRules.gracePeriodDays = 3;
      fallbackRules.maxLateFeePct = 6;
      fallbackRules.requiredDisclosures = ['AB 1482 Rent Control Exemption Notice', 'Mold Disclosure', 'Bed Bug Information Notice'];
      if (city.toUpperCase() === 'SAN FRANCISCO') {
        fallbackRules.interestRequired = true;
        fallbackRules.interestRate = 0.005; // 0.5% local SF rule
      }
    } else if (state.toUpperCase() === 'NY') {
      fallbackRules.limit = 1;
      fallbackRules.description = 'New York Housing Stability and Tenant Protection Act of 2019.';
      fallbackRules.gracePeriodDays = 5;
      fallbackRules.maxLateFeePct = 8;
      fallbackRules.requiredDisclosures = ['Bed Bug History Disclosure', 'Sprinkler System Notice', 'Lead Hazard Notice'];
      fallbackRules.interestRequired = true;
      fallbackRules.interestRate = 0.01;
    }

    return fallbackRules;
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

    // Fetch local rules
    const depositRules = await this.getJurisdictionRules(state, county, city, 'security_deposits');
    const lateFeeRules = await this.getJurisdictionRules(state, county, city, 'late_fees');

    // 1. Validate Deposit
    const maxDepositMultiplier = depositRules.limit ?? 2; // Default to 2 months rent
    const maxDeposit = terms.monthlyRent * maxDepositMultiplier;
    const isDepositValid = terms.depositAmount <= maxDeposit;
    const depositMessage = isDepositValid
      ? `Security deposit of $${terms.depositAmount} satisfies the local limit of $${maxDeposit} in ${jurisdiction}.`
      : `Security deposit of $${terms.depositAmount} exceeds the local limit of $${maxDeposit} (${maxDepositMultiplier} month(s) rent) in ${jurisdiction}.`;

    // 2. Validate Late Fees
    const maxFeePct = lateFeeRules.maxLateFeePct ?? 10; // Default to 10%
    const maxLateFee = terms.monthlyRent * (maxFeePct / 100);
    const isLateFeeValid = terms.lateFeeAmount <= maxLateFee;
    const lateFeeMessage = isLateFeeValid
      ? `Late fee of $${terms.lateFeeAmount} satisfies the maximum allowed $${maxLateFee} (${maxFeePct}%) in ${jurisdiction}.`
      : `Late fee of $${terms.lateFeeAmount} exceeds the maximum allowed $${maxLateFee} (${maxFeePct}%) in ${jurisdiction}.`;

    // 3. Assemble Disclosures Checklist
    const disclosuresList = [...(depositRules.requiredDisclosures || []), ...(lateFeeRules.requiredDisclosures || [])];
    
    // Check FHA Lead-Based Paint
    if (property.yearBuilt && property.yearBuilt < 1978) {
      disclosuresList.push('FHA Lead-Based Paint Disclosure Form');
    }

    // Deduplicate disclosures
    const uniqueDisclosures = Array.from(new Set(disclosuresList));

    const result: ComplianceCheckResult = {
      jurisdiction,
      deposit: {
        isValid: isDepositValid,
        maxAllowed: maxDeposit,
        interestRequired: depositRules.interestRequired,
        interestRate: depositRules.interestRate,
        message: depositMessage
      },
      lateFee: {
        isValid: isLateFeeValid,
        maxAllowed: maxLateFee,
        gracePeriodDays: lateFeeRules.gracePeriodDays ?? 5,
        message: lateFeeMessage
      },
      disclosures: {
        requiredList: uniqueDisclosures,
        message: `Found ${uniqueDisclosures.length} required disclosure(s) for the ${jurisdiction} jurisdiction.`
      }
    };

    // Log the compliance audit check
    logger.audit('LEASE_COMPLIANCE_CHECK_PERFORMED', {
      actorId: 'compliance_engine',
      targetId: propertyId,
      changes: {
        terms,
        result
      }
    });

    return result;
  }
}

export const complianceService = new ComplianceService();
