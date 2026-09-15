'use client'

import { useRef, useState } from 'react'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// Bakes Cloudinary's on-the-fly transformation (auto format/quality, capped
// width) into the delivered URL, so every consumer downstream — the
// invitation page's plain <img> tags — gets an optimized asset for free
// without any code changes there.
function withTransform(url: string, transform: string): string {
  return url.replace('/upload/', `/upload/${transform}/`)
}

export default function ImageUploader({
  onUploaded,
  transform = 'f_auto,q_auto,w_1600,c_limit',
  label = 'Subir imagen',
}: {
  onUploaded: (url: string) => void
  transform?: string
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary no está configurado. Revisa NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('upload failed')
      const data = await res.json()
      onUploaded(withTransform(data.secure_url as string, transform))
    } catch {
      setError('No se pudo subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: 'var(--gold-light)', color: 'var(--brown-dark)' }}
      >
        {uploading ? 'Subiendo...' : label}
      </button>
      {error && <p className="text-xs mt-1.5" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  )
}
