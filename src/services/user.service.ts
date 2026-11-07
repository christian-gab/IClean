import { httpClient } from './httpClient'
import type { Post } from '@/types'

export interface PublicUser {
  id: string
  name: string
  username: string
  bio: string
  avatarUrl: string
  joinedAt: string
}

export interface PublicUserWithPosts extends PublicUser {
  posts: Post[]
}

export const userService = {
  async getPublicProfile(userId: string): Promise<PublicUser> {
    const { data } = await httpClient.get<{ status: string; data: { user: PublicUser } }>(
      `/users/${userId}`
    )
    return data.data.user
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    const { data } = await httpClient.get<{ status: string; data: { posts: Post[] } }>(
      `/users/${userId}/posts`
    )
    return data.data.posts
  },

  async getProfileWithPosts(userId: string): Promise<PublicUserWithPosts> {
    const [user, posts] = await Promise.all([
      userService.getPublicProfile(userId),
      userService.getUserPosts(userId),
    ])
    return { ...user, posts }
  },
}

