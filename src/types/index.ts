export interface User {
  id: string
  name: string
  username: string
  email?: string
  bio: string
  avatarUrl: string
  joinedAt: string
}

export type PostCategory =
  | 'recycling'
  | 'water'
  | 'plastic'
  | 'consumption'
  | 'preservation'
  | 'other'

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  recycling: 'Reciclagem',
  water: 'Economia de Agua',
  plastic: 'Reducao de Plastico',
  consumption: 'Consumo Consciente',
  preservation: 'Preservacao Ambiental',
  other: 'Outras Acoes',
}

export const CATEGORY_COLORS: Record<PostCategory, string> = {
  recycling: '#16a34a',
  water: '#0ea5e9',
  plastic: '#7c3aed',
  consumption: '#f59e0b',
  preservation: '#059669',
  other: '#78716c',
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorAvatarUrl: string
  text: string
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorAvatarUrl: string
  text: string
  imageUrl?: string
  category: PostCategory
  likes: number
  likedByMe: boolean
  comments: Comment[]
  createdAt: string
}

export interface CreatePostPayload {
  text: string
  category: PostCategory
  imageUrl?: string
}

export interface SustainableAction {
  id: string
  title: string
  description: string
  category: PostCategory
  points: number
  icon: string
}

export interface CompletedAction {
  id: string
  actionId: string
  actionTitle: string
  points: number
  completedAt: string
}

export interface Level {
  name: string
  minPoints: number
  maxPoints: number
  icon: string
  color: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface UserProgress {
  totalPoints: number
  actionsCompleted: number
  postsCreated: number
  unlockedAchievements: string[]
  history: CompletedAction[]
  sessionCompletedActions: string[]
}

export interface Toast {
  id: string
  message: string
  type: 'default' | 'success' | 'achievement' | 'levelup'
  icon?: string
}
