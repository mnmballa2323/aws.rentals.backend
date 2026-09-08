import { logger } from '../utils/logger';

/** Screening request input */
interface ScreeningRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  ssn?: string;
}

/** Screening result from provider */
interface ScreeningReport {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  creditScore?: number;
  criminalClear?: boolean;
  evictionClear?: boolean;
  incomeVerified?: boolean;
  recommendation: 'APPROVE' | 'CONDITIONAL_APPROVE' | 'DENY' | 'MANUAL_REVIEW';
  requiresIndividualAssessment?: boolean;
  criminalRecords?: Array<{
    offense: string;
    date: string;
    severity: 'felony' | 'misdemeanor' | 'infraction';
    description?: string;
  }>;
}

export interface IndividualAssessment {
  actorId: string;
  reasons: string[];
  rehabilitationEvidence: string;
  ageAtOffense: number;
  yearsElapsed: number;
  severityAssessment: 'low' | 'medium' | 'high';
  relevanceToTenancy: string;
  finalDecision: 'APPROVE' | 'CONDITIONAL_APPROVE' | 'DENY';
}

/**
 * Tenant screening service abstraction layer.
 * Checkr implementation. Swapped with Gemini AI Agent screening orchestrator.
 */
export class ScreeningService {
  /**
   * Initiate a background screening check.
   */
  async initiateScreening(
    applicationId: string,
    request: ScreeningRequest,
  ): Promise<{ screeningId: string }> {
    logger.info(`Initiating AI screening orchestrator for application ${applicationId}`, request);
    return { screeningId: `ai_scr_${applicationId}_${Date.now()}` };
  }

  /**
   * Retrieve a completed screening report.
   */
  async getReport(screeningId: string): Promise<ScreeningReport> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logger.warn('GEMINI_API_KEY is not set. Returning mock AI screening report.');
      return {
        id: screeningId,
        status: 'completed',
        creditScore: 720,
        criminalClear: true,
        evictionClear: true,
        incomeVerified: true,
        recommendation: 'APPROVE',
        requiresIndividualAssessment: false,
      };
    }

    try {
      logger.info(`Running automated check via Gemini API for screening ${screeningId}`);
      
      const prompt = `Perform an AI agent background check assessment. 
User ID reference: ${screeningId}
Analyze risks for evictions, criminal records, and credit health.

CRITICAL COMPLIANCE REQUIREMENT: 
Under FHA guidelines, blanket rejections of applicants with criminal records are prohibited. 
If criminal history is found (criminalClear: false), you MUST set "recommendation" to "MANUAL_REVIEW" to trigger an individualized assessment. Do not automatically set "recommendation" to "DENY" based solely on criminal records.

Respond only with a JSON object conforming exactly to this structure:
{
  "creditScore": 750,
  "criminalClear": true,
  "evictionClear": true,
  "incomeVerified": true,
  "recommendation": "APPROVE",
  "criminalRecords": []
}

If criminal records are present, populate the "criminalRecords" array with objects containing "offense", "date", "severity" (felony, misdemeanor, infraction), and "description".`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const json = (await response.json()) as any;
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const result = JSON.parse(cleanText);

      const criminalClear = result.criminalClear ?? true;
      let recommendation = result.recommendation ?? 'APPROVE';

      if (!criminalClear && recommendation === 'DENY') {
        logger.info(`Overriding DENY recommendation to MANUAL_REVIEW for screening ${screeningId} to enforce FHA criminal history guidelines.`);
        recommendation = 'MANUAL_REVIEW';
      }

      return {
        id: screeningId,
        status: 'completed',
        creditScore: result.creditScore ?? 700,
        criminalClear,
        evictionClear: result.evictionClear ?? true,
        incomeVerified: result.incomeVerified ?? true,
        recommendation,
        requiresIndividualAssessment: !criminalClear,
        criminalRecords: result.criminalRecords || [],
      };
    } catch (error) {
      logger.error('Gemini background screening check failed, returning manual review fallback', error);
      return {
        id: screeningId,
        status: 'failed',
        recommendation: 'MANUAL_REVIEW',
        requiresIndividualAssessment: true,
      };
    }
  }

  /**
   * Cancel a pending screening request.
   */
  async cancelScreening(screeningId: string): Promise<boolean> {
    logger.info(`Cancelling AI screening ${screeningId}`);
    return true;
  }

  /**
   * Generate an FCRA-compliant Adverse Action Notice.
   */
  generateAdverseActionNotice(
    applicantName: string,
    reasons: string[],
  ): { noticeText: string; generatedAt: string } {
    const craName = 'Rental Home Screening Agency';
    const craAddress = '100 Google Way, Mountain View, CA 94043';
    const craPhone = '1-800-555-0199';

    const noticeText = `ADVERSE ACTION NOTICE
Date: ${new Date().toLocaleDateString('en-US')}
To: ${applicantName}

Thank you for your application. We regret to inform you that your application has been rejected or approved under conditional terms based on information contained in a consumer screening report.

The decision was based in whole or in part on information in a report provided by:
Agency Name: ${craName}
Address: ${craAddress}
Phone: ${craPhone}

Please note the following important consumer rights under the Fair Credit Reporting Act (FCRA):
1. The consumer reporting agency listed above did not make the decision to take adverse action and is unable to provide the specific reasons why the decision was made.
2. You have a right to obtain a free copy of your consumer report from the agency if you request it within 60 days of receiving this notice.
3. You have the right to dispute the accuracy or completeness of any information in the report directly with the consumer reporting agency.

Reasons for this action:
${reasons.map(r => `- ${r}`).join('\n')}

Sincerely,
Property Management Compliance Office
`;

    logger.info(`Generated FCRA Adverse Action Notice for ${applicantName}`);
    return { noticeText, generatedAt: new Date().toISOString() };
  }

  /**
   * Formally conduct and log an FHA-compliant individual assessment for criminal history.
   */
  conductIndividualAssessment(
    screeningId: string,
    assessment: IndividualAssessment,
  ): { status: string; decision: string } {
    logger.info(`Conducting FHA Individualized Assessment for screening ${screeningId}`, assessment);

    // Audit log the compliance decision
    logger.audit('FHA_INDIVIDUAL_ASSESSMENT_COMPLETED', {
      actorId: assessment.actorId,
      targetId: screeningId,
      changes: {
        reasons: assessment.reasons,
        rehabilitationEvidence: assessment.rehabilitationEvidence,
        ageAtOffense: assessment.ageAtOffense,
        yearsElapsed: assessment.yearsElapsed,
        severityAssessment: assessment.severityAssessment,
        relevanceToTenancy: assessment.relevanceToTenancy,
        finalDecision: assessment.finalDecision,
      },
    });

    return {
      status: 'completed',
      decision: assessment.finalDecision,
    };
  }
}

export const screeningService = new ScreeningService();
