import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use(
  (config) => {
    try {
      const raw =
        localStorage.getItem('iclean:auth') ||
        localStorage.getItem('ecosocial:auth') ||
        localStorage.getItem('auth')

      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`
        }
        if (parsed?.user?.id) {
          config.headers['x-user-id'] = parsed.user.id
        }
      }
    } catch (e) {
      console.warn('Erro ao ler credenciais do localStorage:', e)
    }
    return config
  },
  (error) => Promise.reject(error)
)

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Array<{ message: string }> }>) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Erro inesperado na comunicação com o servidor'

    console.error(`[API ERROR ${error.response?.status}]:`, message)
    return Promise.reject(new Error(message))
  }
)
