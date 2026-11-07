import { httpClient } from './httpClient'
import type { User } from '@/types'

export interface LoginResponse {
  status: string
  data: {
    user: User
    token: string
  }
}

export interface UserResponse {
  status: string
  data: {
    user: User
  }
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return data.data
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await httpClient.post<LoginResponse>('/auth/register', {
      name,
      email,
      password,
    })
    return data.data
  },

  /** Passo 1: envia o código de verificação para o email. */
  async sendVerification(name: string, email: string, password: string): Promise<void> {
    await httpClient.post('/auth/send-verification', { name, email, password })
  },

  /** Passo 2: verifica o código e cria a conta. */
  async verifyAndRegister(
    name: string,
    email: string,
    password: string,
    code: string
  ): Promise<{ user: User; token: string }> {
    const { data } = await httpClient.post<LoginResponse>('/auth/verify-email', {
      name,
      email,
      password,
      code,
    })
    return data.data
  },

  async getMe(): Promise<User> {
    const { data } = await httpClient.get<UserResponse>('/auth/me')
    return data.data.user
  },

  async getUser(id: string): Promise<User> {
    const { data } = await httpClient.get<UserResponse>(`/users/${id}`)
    return data.data.user
  },

  async updateProfile(id: string, updates: { name?: string; bio?: string; avatarUrl?: string }): Promise<User> {
    const { data } = await httpClient.put<UserResponse>(`/users/${id}`, updates)
    return data.data.user
  },
}

