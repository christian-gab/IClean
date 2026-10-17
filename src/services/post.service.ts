import { httpClient } from './httpClient'
import type { Post, Comment, CreatePostPayload, PostCategory } from '@/types'

export interface PostsResponse {
  status: string
  results: number
  data: {
    posts: Post[]
  }
}

export interface SinglePostResponse {
  status: string
  data: {
    post: Post
    unlockedAchievements?: string[]
  }
}

export interface LikeResponse {
  status: string
  data: {
    postId: string
    likes: number
    likedByMe: boolean
  }
}

export interface CommentResponse {
  status: string
  data: {
    comment: Comment
  }
}

export const postService = {
  async getPosts(category?: PostCategory | 'all' | null): Promise<Post[]> {
    const params = category && category !== 'all' ? { category } : {}
    const { data } = await httpClient.get<PostsResponse>('/posts', { params })
    return data.data.posts
  },

  async getPostById(id: string): Promise<Post> {
    const { data } = await httpClient.get<SinglePostResponse>(`/posts/${id}`)
    return data.data.post
  },

  async createPost(payload: CreatePostPayload): Promise<{ post: Post; unlockedAchievements: string[] }> {
    const { data } = await httpClient.post<SinglePostResponse>('/posts', payload)
    return {
      post: data.data.post,
      unlockedAchievements: data.data.unlockedAchievements || [],
    }
  },

  async toggleLike(postId: string): Promise<{ postId: string; likes: number; likedByMe: boolean }> {
    const { data } = await httpClient.post<LikeResponse>(`/posts/${postId}/like`)
    return data.data
  },

  async addComment(postId: string, text: string): Promise<Comment> {
    const { data } = await httpClient.post<CommentResponse>(`/posts/${postId}/comments`, { text })
    return data.data.comment
  },
}
