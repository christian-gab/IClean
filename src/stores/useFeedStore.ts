import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Post, Comment, CreatePostPayload, PostCategory } from '@/types'
import { storage } from '@/utils/storage'
import { nowISO, generateId } from '@/utils/date'
import { initialPosts } from '@/mocks/posts'
import { useAuthStore } from '@/stores/useAuthStore'

const STORAGE_KEY = 'posts'

export const useFeedStore = defineStore('feed', () => {
  const posts = ref<Post[]>(storage.get(STORAGE_KEY, initialPosts))
  const activeCategory = ref<PostCategory | null>(null)

  const filteredPosts = computed(() => {
    if (!activeCategory.value) return posts.value
    return posts.value.filter((p) => p.category === activeCategory.value)
  })

  function save() {
    storage.set(STORAGE_KEY, posts.value)
  }

  function getUser() {
    const auth = useAuthStore()
    return (
      auth.user ?? {
        id: 'user-1',
        name: 'Usuário',
        username: '@usuario',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4',
      }
    )
  }

  function createPost(payload: CreatePostPayload): Post {
    const u = getUser()
    const post: Post = {
      id: generateId(),
      authorId: u.id,
      authorName: u.name,
      authorAvatarUrl: u.avatarUrl,
      text: payload.text,
      imageUrl: payload.imageUrl,
      category: payload.category,
      likes: 0,
      likedByMe: false,
      comments: [],
      createdAt: nowISO(),
    }
    posts.value.unshift(post)
    save()
    return post
  }

  function toggleLike(postId: string) {
    const post = posts.value.find((p) => p.id === postId)
    if (!post) return
    if (post.likedByMe) {
      post.likes -= 1
      post.likedByMe = false
    } else {
      post.likes += 1
      post.likedByMe = true
    }
    save()
  }

  function addComment(postId: string, text: string): Comment | null {
    const post = posts.value.find((p) => p.id === postId)
    if (!post) return null
    const u = getUser()
    const comment: Comment = {
      id: generateId(),
      authorId: u.id,
      authorName: u.name,
      authorAvatarUrl: u.avatarUrl,
      text,
      createdAt: nowISO(),
    }
    post.comments.push(comment)
    save()
    return comment
  }

  function setCategory(cat: PostCategory | null) {
    activeCategory.value = cat
  }

  function syncAuthorData(userId: string, name: string, avatarUrl: string) {
    let changed = false
    for (const post of posts.value) {
      if (post.authorId === userId) {
        post.authorName = name
        post.authorAvatarUrl = avatarUrl
        changed = true
      }
      for (const comment of post.comments) {
        if (comment.authorId === userId) {
          comment.authorName = name
          comment.authorAvatarUrl = avatarUrl
          changed = true
        }
      }
    }
    if (changed) {
      save()
    }
  }

  const auth = useAuthStore()
  watch(
    () => auth.user,
    (u) => {
      if (u) {
        syncAuthorData(u.id, u.name, u.avatarUrl)
      }
    },
    { deep: true, immediate: true }
  )

  function resetPosts() {
    posts.value = JSON.parse(JSON.stringify(initialPosts))
    storage.remove(STORAGE_KEY)
  }

  return {
    posts,
    filteredPosts,
    activeCategory,
    createPost,
    toggleLike,
    addComment,
    setCategory,
    resetPosts,
    syncAuthorData,
  }
})
