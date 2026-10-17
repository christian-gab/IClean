import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Post, Comment, CreatePostPayload, PostCategory } from '@/types'
import { storage } from '@/utils/storage'
import { nowISO, generateId } from '@/utils/date'
import { initialPosts } from '@/mocks/posts'
import { currentUser } from '@/mocks/user'

const STORAGE_KEY = 'posts'

export const useFeedStore = defineStore('feed', () => {
  const posts = ref<Post[]>(storage.get(STORAGE_KEY, initialPosts))
  const activeCategory = ref<PostCategory | null>(null)

  const filteredPosts = computed(() => {
    if (!activeCategory.value) return posts.value
    return posts.value.filter(p => p.category === activeCategory.value)
  })

  function save() {
    storage.set(STORAGE_KEY, posts.value)
  }

  function createPost(payload: CreatePostPayload): Post {
    const post: Post = {
      id: generateId(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatarUrl: currentUser.avatarUrl,
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
    const post = posts.value.find(p => p.id === postId)
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
    const post = posts.value.find(p => p.id === postId)
    if (!post) return null
    const comment: Comment = {
      id: generateId(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatarUrl: currentUser.avatarUrl,
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
  }
})
