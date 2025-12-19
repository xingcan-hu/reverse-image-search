import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { uploadImageStream } from '@/libs/R2Storage';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed image MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const POST = async (request: Request) => {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get Content-Type header
    const contentType = request.headers.get('content-type') || '';

    // Handle multipart/form-data uploads
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 },
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 },
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 },
        );
      }

      // Upload the file stream
      const result = await uploadImageStream(
        file.stream(),
        {
          filename: file.name,
          contentType: file.type,
          contentLength: file.size,
          prefix: 'images',
        },
      );

      logger.info('Image uploaded via multipart/form-data', {
        userId: user.id,
        key: result.key,
        filename: file.name,
      });

      return NextResponse.json({
        success: true,
        key: result.key,
        url: result.url,
      });
    }

    // Handle direct stream uploads (raw body)
    const contentLength = request.headers.get('content-length');
    const contentLengthNum = contentLength ? Number.parseInt(contentLength, 10) : undefined;

    if (contentLengthNum && contentLengthNum > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    // Get content type from header or default to image/jpeg
    const imageContentType = request.headers.get('content-type') || 'image/jpeg';

    if (!ALLOWED_TYPES.includes(imageContentType)) {
      return NextResponse.json(
        { error: `Invalid content type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    // Get filename from Content-Disposition header if available
    const contentDisposition = request.headers.get('content-disposition');
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1];

    // Upload the stream
    const result = await uploadImageStream(
      request.body!,
      {
        filename,
        contentType: imageContentType,
        contentLength: contentLengthNum,
        prefix: 'images',
      },
    );

    logger.info('Image uploaded via stream', {
      userId: user.id,
      key: result.key,
      filename: filename || 'unknown',
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
    });
  } catch (error) {
    logger.error('Failed to upload image', { error });
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 },
    );
  }
};
