import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import type { StorageConfigService } from '@core/config';
import type {
  PresignedUploadUrlResult,
  StorageDrivenPort,
  StorageFile,
  UploadedFileResult,
} from '@core/domain';

@Injectable()
export class S3StorageAdapter implements StorageDrivenPort, OnModuleInit {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly s3Client: S3Client;

  constructor(private readonly config: StorageConfigService) {
    this.s3Client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint || undefined,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: this.config.forcePathStyle,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    const bucket = this.config.bucket;
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      this.logger.log(`Bucket "${bucket}" not found. Creating bucket...`);
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        this.logger.log(`Bucket "${bucket}" successfully created.`);
      } catch (createErr) {
        this.logger.warn(
          `Could not create bucket "${bucket}": ${(createErr as Error).message}`,
        );
      }
    }
  }

  async uploadFile(file: StorageFile): Promise<UploadedFileResult> {
    const fileData = file.data;
    const key = fileData.path
      ? `${fileData.path.replace(/^\/+|\/+$/g, '')}/${fileData.filename}`
      : fileData.filename;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: fileData.buffer,
      ContentType: fileData.mimetype,
    });

    await this.s3Client.send(command);

    const url = await this.getPresignedDownloadUrl(key);

    return {
      key,
      filename: fileData.filename,
      url,
      mimetype: fileData.mimetype,
      size: fileData.buffer.length,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const expiresIn = expiresInSeconds ?? this.config.urlExpirationSeconds;
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getPresignedUploadUrl(
    key: string,
    mimetype: string,
    expiresInSeconds?: number,
  ): Promise<PresignedUploadUrlResult> {
    const expiresIn = expiresInSeconds ?? this.config.urlExpirationSeconds;
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: mimetype,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return {
      uploadUrl,
      key,
      expiresInSeconds: expiresIn,
    };
  }
}
