import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Env } from './Env';
import { logger } from './Logger';

let r2Client: S3Client | null = null;

const getR2Client = () => {
  if (
    !Env.R2_ACCOUNT_ID
    || !Env.R2_ACCESS_KEY_ID
    || !Env.R2_SECRET_ACCESS_KEY
    || !Env.R2_BUCKET_NAME
  ) {
    throw new Error('Storage is not configured. Please add Cloudflare R2 credentials.');
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${Env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: Env.R2_ACCESS_KEY_ID,
        secretAccessKey: Env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
};

export const uploadImageToR2 = async (file: File) => {
  const client = getR2Client();

  const extension = file.type?.split('/').at(1) ?? 'bin';
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(new PutObjectCommand({
    Bucket: Env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  const baseUrl = Env.R2_PUBLIC_BASE_URL
    ?? `https://${Env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${Env.R2_BUCKET_NAME}`;
  const publicUrl = `${baseUrl}/${key}`;

  logger.info('Image uploaded to R2', () => ({
    key,
    url: publicUrl,
    contentType: file.type,
    size: file.size,
  }));

  return { key, url: publicUrl };
};
