import { afterEach, expect, test, vi } from 'vitest'

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}))

vi.mock('./httpClient', () => ({
  httpClient: { post: postMock },
}))

import { validationService } from './validation.service'

afterEach(() => {
  postMock.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('sends compressed proof to the authenticated backend validation endpoint', async () => {
  const expected = {
    approved: true,
    confidence: 0.9,
    reasoning: 'A imagem comprova a ação.',
    detectedElements: ['garrafa reutilizável'],
    warnings: [],
  }
  postMock.mockResolvedValue({ data: { data: expected } })
  class LoadedImage {
    width = 640
    height = 480
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      this.onload?.()
    }
  }
  vi.stubGlobal('Image', LoadedImage)
  vi.spyOn(document, 'createElement').mockReturnValue({
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toDataURL: () => 'data:image/jpeg;base64,Y29tcHJlc3NlZA==',
  } as unknown as HTMLCanvasElement)

  const result = await validationService.validatePhoto(
    'action-1',
    'data:image/jpeg;base64,aGVsbG8=',
    'Usar garrafa reutilizável',
    'Use uma garrafa reutilizável',
    'Levei a garrafa para o parque'
  )

  expect(postMock).toHaveBeenCalledWith(
    '/actions/action-1/validate-photo',
    {
      photoUrl: 'data:image/jpeg;base64,Y29tcHJlc3NlZA==',
      description: 'Levei a garrafa para o parque',
    },
    { timeout: 90_000 }
  )
  expect(result).toEqual(expected)
})
