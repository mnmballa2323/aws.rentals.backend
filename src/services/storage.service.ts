import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws';
import { config } from '../config';
import { logger } from '../utils/logger';

export class StorageService {
  private defaultBucket = config.aws.s3Bucket || 'aws-rentals-documents';

  /**
   * Generates an Amazon S3 presigned URL for direct secure document uploads
   * (e.g. lease agreements, tenant ID verification, maintenance photos).
   */
  async getUploadPresignedUrl(
    key: string,
    contentType = 'application/octet-stream',
    expiresIn = 3600,
    bucket = this.defaultBucket
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      // If mock credentials in dev, return an S3 URL format
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        logger.info(`AWS credentials mock mode: returning simulated S3 presigned upload URL for s3://${bucket}/${key}`);
        return `https://${bucket}.s3.${config.aws.region}.amazonaws.com/${key}?mock-upload-token=valid`;
      }

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      logger.info(`Generated S3 presigned upload URL for key: ${key}`);
      return signedUrl;
    } catch (error) {
      logger.error(`Failed to generate S3 presigned upload URL for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Generates an Amazon S3 presigned URL for secure document viewing/downloading.
   */
  async getDownloadPresignedUrl(
    key: string,
    expiresIn = 3600,
    bucket = this.defaultBucket
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        logger.info(`AWS credentials mock mode: returning simulated S3 presigned download URL for s3://${bucket}/${key}`);
        return `https://${bucket}.s3.${config.aws.region}.amazonaws.com/${key}?mock-download-token=valid`;
      }

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      logger.info(`Generated S3 presigned download URL for key: ${key}`);
      return signedUrl;
    } catch (error) {
      logger.error(`Failed to generate S3 presigned download URL for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Directly uploads document or data buffer to Amazon S3.
   */
  async uploadDocument(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType = 'application/pdf',
    bucket = this.defaultBucket
  ): Promise<string> {
    try {
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        logger.info(`AWS credentials mock mode: document stored virtually at s3://${bucket}/${key}`);
        return `s3://${bucket}/${key}`;
      }

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await s3Client.send(command);
      logger.info(`Successfully uploaded document to s3://${bucket}/${key}`);
      return `s3://${bucket}/${key}`;
    } catch (error) {
      logger.error(`Error uploading document to S3 key ${key}`, error);
      throw error;
    }
  }

  /**
   * Deletes a document from Amazon S3.
   */
  async deleteDocument(key: string, bucket = this.defaultBucket): Promise<boolean> {
    try {
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        logger.info(`AWS credentials mock mode: document deleted virtually from s3://${bucket}/${key}`);
        return true;
      }

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3Client.send(command);
      logger.info(`Successfully deleted document s3://${bucket}/${key}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting document from S3 key ${key}`, error);
      return false;
    }
  }
}

export const storageService = new StorageService();
