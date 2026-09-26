import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { env } from '../config/env.js'
import { HttpError } from './http-error.js'

export type ImageFolder = 'products' | 'categories'

let configured = false

function getCloudinaryClient() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new HttpError(503, 'La carga de imágenes todavía no está configurada.', 'UPLOAD_NOT_CONFIGURED')
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }

  return cloudinary
}

export async function uploadStoreImage(buffer: Buffer, folder: ImageFolder) {
  const client = getCloudinaryClient()

  try {
    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = client.uploader.upload_stream(
        {
          folder: `urbano-sv/${folder}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          unique_filename: true,
          use_filename: false,
          overwrite: false,
          transformation: [
            { width: 2000, height: 2000, crop: 'limit', quality: 'auto:good' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary no devolvió el resultado de la carga.'))
            return
          }
          resolve(result)
        },
      )

      stream.end(buffer)
    })

    return {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    }
  } catch (error) {
    console.error('Cloudinary upload failed:', error)
    throw new HttpError(502, 'Cloudinary no pudo procesar la imagen. Intenta nuevamente.', 'IMAGE_UPLOAD_FAILED')
  }
}