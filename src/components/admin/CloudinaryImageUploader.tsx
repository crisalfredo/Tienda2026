import { ImagePlus, LoaderCircle, UploadCloud } from 'lucide-react'
import { useId, useRef, useState, type ChangeEvent } from 'react'
import { adminApi } from '../../services/api'
import { secondaryButton } from './AdminUi'

interface CloudinaryImageUploaderProps {
  folder: 'products' | 'categories'
  onUploaded: (url: string) => void
  disabled?: boolean
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxBytes = 5 * 1024 * 1024

export function CloudinaryImageUploader({ folder, onUploaded, disabled = false }: CloudinaryImageUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!allowedTypes.includes(file.type)) {
      setError('Selecciona una imagen JPG, PNG o WebP.')
      return
    }
    if (file.size > maxBytes) {
      setError('La imagen no puede superar 5 MB.')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const image = await adminApi.uploadImage(file, folder)
      onUploaded(image.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo cargar la imagen.')
    } finally {
      setUploading(false)
    }
  }

  return <div>
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
      onChange={(event) => void upload(event)}
      className="sr-only"
      disabled={disabled || uploading}
    />
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={disabled || uploading}
      className={secondaryButton}
    >
      {uploading ? <LoaderCircle size={17} className="animate-spin" /> : <UploadCloud size={17} />}
      {uploading ? 'Subiendo a Cloudinary...' : 'Subir imagen'}
    </button>
    <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
      <ImagePlus size={14} /> JPG, PNG o WebP · máximo 5 MB
    </p>
    {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
  </div>
}