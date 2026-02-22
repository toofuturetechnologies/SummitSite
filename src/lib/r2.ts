import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

export type MediaType = 'image' | 'video'
export type EntityType = 'guide' | 'trip' | 'review'

interface UploadOptions {
  entityType: EntityType
  entityId: string
  mediaType: MediaType
  filename: string
  contentType: string
}

export function generateKey(options: UploadOptions): string {
  const { entityType, entityId, mediaType, filename } = options
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  return `${entityType}/${entityId}/${mediaType}/${timestamp}.${ext}`
}

export async function getPresignedUploadUrl(options: UploadOptions): Promise<{
  uploadUrl: string
  publicUrl: string
  key: string
}> {
  const key = generateKey(options)
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: options.contentType,
  })

  const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })
  const publicUrl = `${PUBLIC_URL}/${key}`

  return { uploadUrl, publicUrl, key }
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  await R2.send(command)
}

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export function validateFile(
  file: { type: string; size: number },
  mediaType: MediaType
): { valid: boolean; error?: string } {
  const allowedTypes = mediaType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
  const maxSize = mediaType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxSize / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}
