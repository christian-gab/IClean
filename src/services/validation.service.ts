import { httpClient } from './httpClient'

export interface PhotoValidationResult {
  approved: boolean
  confidence: number
  reasoning: string
  detectedElements: string[]
  warnings: string[]
}

function compressImage(base64: string, maxSize = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Não foi possível processar a imagem enviada.'))
        return
      }

      context.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Não foi possível processar a imagem enviada.'))
    img.src = base64
  })
}

export const validationService = {
  async validatePhoto(
    actionId: string,
    photoUrl: string,
    _actionTitle: string,
    _actionDescription: string,
    description?: string
  ): Promise<PhotoValidationResult> {
    const compressedPhoto = await compressImage(photoUrl)
    const response = await httpClient.post<{
      data: PhotoValidationResult
    }>(
      `/actions/${encodeURIComponent(actionId)}/validate-photo`,
      { photoUrl: compressedPhoto, description },
      { timeout: 90_000 }
    )

    return response.data.data
  },
}
