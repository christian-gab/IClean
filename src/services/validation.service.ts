/**
 * Serviço de validação de fotos com Gemini AI.
 * Chama a API do Gemini DIRETO DO BROWSER para evitar restrições
 * de rede que o servidor Node.js possa ter.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Modelos tentados em ordem. Se o primário retornar 503 todos os retries,
 * o serviço cai automaticamente para o próximo da lista.
 */
const MODEL_FALLBACKS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-1.5-flash']

/** Aguarda `ms` milissegundos (usado entre tentativas). */
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

export interface PhotoValidationResult {
  approved: boolean
  confidence: number
  reasoning: string
  detectedElements: string[]
  warnings: string[]
}

/** Redimensiona e comprime a imagem para no máximo maxSize px, qualidade JPEG. */
function compressImage(base64: string, maxSize = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize }
        else { width = Math.round((width * maxSize) / height); height = maxSize }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

function buildPrompt(actionTitle: string, actionDescription: string, userDescription?: string): string {
  return `Você é um sistema de validação de ações sustentáveis para o aplicativo IClean.

Analise esta imagem e verifique se ela comprova a seguinte ação sustentável:
- Ação: ${actionTitle}
- Descrição: ${actionDescription}
${userDescription ? `- Relato do usuário: ${userDescription}` : ''}

Critérios:
1. A imagem é autêntica (não é screenshot ou imagem da internet)?
2. Mostra elementos compatíveis com a ação descrita?
3. Há indício de manipulação ou fraude?

Responda SOMENTE em JSON válido, sem markdown:
{"approved":boolean,"confidence":number,"reasoning":"string em português","detectedElements":["..."],"warnings":["..."]}`
}

export const validationService = {
  async validatePhoto(
    _actionId: string,
    photoUrl: string,
    actionTitle: string,
    actionDescription: string,
    description?: string
  ): Promise<PhotoValidationResult> {
    if (!GEMINI_API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY não configurada no .env.local')
    }

    // Comprime antes de enviar (~80–150 KB em vez de ~2–5 MB)
    const compressed = await compressImage(photoUrl)

    // Extrai base64 puro e mimeType
    const mimeMatch = compressed.match(/^data:(image\/\w+);base64,/)
    const mimeType = mimeMatch?.[1] ?? 'image/jpeg'
    const base64Data = compressed.replace(/^data:image\/\w+;base64,/, '')

    const body = {
      contents: [{
        parts: [
          { text: buildPrompt(actionTitle, actionDescription, description) },
          { inlineData: { mimeType, data: base64Data } },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    }

    // Tenta cada modelo da lista; em caso de 503 ou timeout passa para o próximo fallback
    const MAX_RETRIES_PER_MODEL = 2
    const TIMEOUT_MS = 60_000  // 60s — análise de imagem pode demorar
    let lastError = ''

    for (const model of MODEL_FALLBACKS) {
      const apiUrl = `${BASE_URL}/${model}:generateContent`

      for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
        let res: Response

        try {
          res = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          })
        } catch (fetchErr) {
          clearTimeout(timeoutId)
          const isTimeout = fetchErr instanceof DOMException && fetchErr.name === 'AbortError'
          lastError = isTimeout ? `${model} timeout após ${TIMEOUT_MS / 1000}s` : String(fetchErr)
          console.warn(`[PhotoValidation] ${isTimeout ? 'Timeout' : 'Erro de rede'} em ${model} – tentativa ${attempt}/${MAX_RETRIES_PER_MODEL}`)
          if (attempt < MAX_RETRIES_PER_MODEL) await sleep(2_000)
          continue  // tenta de novo (ou próximo modelo se esgotou retries)
        } finally {
          clearTimeout(timeoutId)
        }

        if (res.status === 503) {
          lastError = `${model} retornou 503`
          console.warn(`[PhotoValidation] 503 em ${model} – tentativa ${attempt}/${MAX_RETRIES_PER_MODEL}`)
          if (attempt < MAX_RETRIES_PER_MODEL) await sleep(2_000)
          continue
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          lastError = `${model} ${res.status}: ${JSON.stringify(err)}`
          console.warn(`[PhotoValidation] Erro ${res.status} em ${model}, tentando próximo fallback`)
          break  // erro diferente → tenta próximo modelo
        }

        // Sucesso — processa a resposta
        const json = await res.json()
        const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error(`Resposta inválida do Gemini (${model}): ${text.slice(0, 200)}`)

        console.info(`[PhotoValidation] Validado com ${model}`)
        const parsed = JSON.parse(jsonMatch[0]) as PhotoValidationResult
        return {
          approved: Boolean(parsed.approved),
          confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
          reasoning: parsed.reasoning ?? 'Análise concluída.',
          detectedElements: Array.isArray(parsed.detectedElements) ? parsed.detectedElements : [],
          warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        }
      }
      // inner loop esgotado → passa para próximo modelo automaticamente
    }

    throw new Error(`Todos os modelos Gemini estão indisponíveis. Último erro: ${lastError}`)
  },
}
