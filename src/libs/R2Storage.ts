import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Env } from './Env';
import { logger } from './Logger';

type UploadResult = {
  key: string;
  url: string;
};

type UploadOptions = {
  key?: string;
  prefix?: string;
  contentType?: string;
  contentLength?: number;
  baseUrl?: string;
};

type StreamUploadOptions = UploadOptions & {
  filename?: string;
};

// Default R2 endpoint: https://bde2a4fb5276f94ba60cec33fbe6ec38.r2.cloudflarestorage.com/images
const getEndpoint = () => {
  if (Env.R2_ACCOUNT_ID) {
    return `https://${Env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }
  // Fallback to default account ID from provided endpoint
  return 'https://bde2a4fb5276f94ba60cec33fbe6ec38.r2.cloudflarestorage.com';
};

const getBucket = () => {
  return Env.R2_BUCKET ?? 'images';
};

// Keep a single client instance to avoid extra sockets during hot reload
const r2Client = new S3Client({
  region: 'auto',
  endpoint: getEndpoint(),
  credentials: {
    accessKeyId: Env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: Env.R2_SECRET_ACCESS_KEY ?? '',
  },
  forcePathStyle: false,
});

const isWebReadableStream = (
  stream: unknown,
): stream is ReadableStream<Uint8Array> => typeof (stream as { getReader?: () => unknown })?.getReader === 'function';

const toNodeStream = (stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream): NodeJS.ReadableStream => {
  if (isWebReadableStream(stream)) {
    // Convert Web ReadableStream to Node.js ReadableStream
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Readable.fromWeb(stream as any);
  }
  return stream as NodeJS.ReadableStream;
};

const buildKey = (filename?: string, prefix = 'uploads') => {
  const ext = filename ? path.extname(filename) : '';
  return `${prefix}/${Date.now()}-${randomUUID()}${ext}`;
};

const getPublicUrl = (key: string, baseUrl?: string) => {
  const base =
    baseUrl
    ?? Env.R2_PUBLIC_BASE_URL
    ?? 'https://bde2a4fb5276f94ba60cec33fbe6ec38.r2.cloudflarestorage.com/images';

  return `${base.replace(/\/$/, '')}/${key}`;
};

const putObject = async (params: PutObjectCommandInput) => {
  await r2Client.send(new PutObjectCommand(params));
};

export const uploadLocalFile = async (
  filePath: string,
  options?: UploadOptions,
): Promise<UploadResult> => {
  // Upload a file from the server filesystem (e.g., after temporary save)
  const key = options?.key ?? buildKey(path.basename(filePath), options?.prefix);
  const body = createReadStream(filePath);
  const { size } = await stat(filePath);

  // Detect content type from file extension if not provided
  const contentType = options?.contentType
    ?? (path.extname(filePath).match(/\.(jpg|jpeg)$/i) ? 'image/jpeg'
      : path.extname(filePath).match(/\.png$/i) ? 'image/png'
      : path.extname(filePath).match(/\.gif$/i) ? 'image/gif'
      : path.extname(filePath).match(/\.webp$/i) ? 'image/webp'
      : 'application/octet-stream');

  await putObject({
    Bucket: getBucket(),
    Key: key,
    Body: body,
    ContentLength: options?.contentLength ?? size,
    ContentType: contentType,
  });

  logger.info('Uploaded file to R2', { key, bucket: getBucket() });

  return {
    key,
    url: getPublicUrl(key, options?.baseUrl),
  };
};

export const uploadImageStream = async (
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream,
  options?: StreamUploadOptions,
): Promise<UploadResult> => {
  // Upload a stream coming from client upload (Request.body or file upload stream)
  const key = options?.key ?? buildKey(options?.filename, options?.prefix ?? 'images');

  // Detect content type from filename extension if not provided
  const contentType = options?.contentType
    ?? (options?.filename?.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg'
      : options?.filename?.match(/\.png$/i) ? 'image/png'
      : options?.filename?.match(/\.gif$/i) ? 'image/gif'
      : options?.filename?.match(/\.webp$/i) ? 'image/webp'
      : 'image/jpeg'); // Default to jpeg for images

  await putObject({
    Bucket: getBucket(),
    Key: key,
    Body: toNodeStream(stream),
    ContentLength: options?.contentLength,
    ContentType: contentType,
  });

  logger.info('Uploaded image stream to R2', { key, bucket: getBucket() });

  return {
    key,
    url: getPublicUrl(key, options?.baseUrl),
  };
};
