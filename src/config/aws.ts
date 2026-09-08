import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { SNSClient } from '@aws-sdk/client-sns';
import { config } from './index';
import { logger } from '../utils/logger';

const region = config.aws.region;

/**
 * Amazon Bedrock Runtime Client for AI Agents (Claude 3.5 Sonnet, Nova, Titan)
 */
export const bedrockClient = new BedrockRuntimeClient({
  region: config.aws.bedrockRegion || region,
  credentials: config.aws.accessKeyId && config.aws.secretAccessKey ? {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  } : undefined,
});

/**
 * Amazon S3 Client for Leases, Disclosures, Inspections & Documents
 */
export const s3Client = new S3Client({
  region,
  credentials: config.aws.accessKeyId && config.aws.secretAccessKey ? {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  } : undefined,
});

/**
 * Amazon SES Client for Statutory Legal Notices, Pre-Adverse Letters & Disclosures
 */
export const sesClient = new SESClient({
  region,
  credentials: config.aws.accessKeyId && config.aws.secretAccessKey ? {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  } : undefined,
});

/**
 * Amazon SNS Client for Emergency Maintenance Alerts & SMS
 */
export const snsClient = new SNSClient({
  region,
  credentials: config.aws.accessKeyId && config.aws.secretAccessKey ? {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  } : undefined,
});

logger.info(`AWS Clients initialized in region: ${region}`);
