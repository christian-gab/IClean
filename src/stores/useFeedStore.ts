import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Post, Comment, CreatePostPayload, PostCategory } from '@/types'
import { postService } from '@/services'

export const useFeedStore = defineStore('feed', () => {
  const posts = ref<Post[]>([])
  const activeCategory = ref<PostCategory | null>(null)
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const error = ref<string | null>(null)

  const filteredPosts = computed(() => {
    if (!activeCategory.value) return posts.value
    return posts.value.filter((p) => p.category === activeCategory.value)
  })

  async function fetchPosts(cat?: PostCategory | null) {
    isLoading.value = true
    error.value = null
    try {
      if (cat !== undefined) {
        activeCategory.value = cat
      }
      const data = await postService.getPosts(activeCategory.value)
      posts.value = data
      return data
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar publicações'
      error.value = msg
      console.error('Erro ao buscar posts:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createPost(payload: CreatePostPayload): Promise<{ post: Post; unlockedAchievements: string[] }> {
    isSubmitting.value = true
    error.value = null
    try {
      const result = await postService.createPost(payload)
      posts.value.unshift(result.post)
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao criar publicação'
      error.value = msg
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  async function toggleLike(postId: string) {
    const post = posts.value.find((p) => p.id === postId)
    if (!post) return

    // Atualização otimista na interface
    const wasLiked = post.likedByMe
    post.likedByMe = !wasLiked
    post.likes += wasLiked ? -1 : 1

    try {
      const res = await postService.toggleLike(postId)
      post.likes = res.likes
      post.likedByMe = res.likedByMe
    } catch (err) {
      // Reverte em caso de erro na rede
      post.likedByMe = wasLiked
      post.likes += wasLiked ? 1 : -1
      console.error('Erro ao curtir post:', err)
    }
  }

  async function addComment(postId: string, text: string): Promise<Comment | null> {
    const post = posts.value.find((p) => p.id === postId)
    if (!post) return null

    try {
      const comment = await postService.addComment(postId, text)
      post.comments.push(comment)
      return comment
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err)
      throw err
    }
  }

  function setCategory(cat: PostCategory | null) {
    activeCategory.value = cat
    return fetchPosts(cat)
  }

  return {
    posts,
    filteredPosts,
    activeCategory,
    isLoading,
    isSubmitting,
    error,
    fetchPosts,
    createPost,
    toggleLike,
    addComment,
    setCategory,
  }
})
