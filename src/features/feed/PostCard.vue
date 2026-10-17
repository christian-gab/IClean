<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Post } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { timeAgo } from '@/utils/date'
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Send } from '@lucide/vue'

const props = defineProps<{ post: Post }>()
const feed = useFeedStore()
const auth = useAuthStore()

const showComments = ref(false)
const commentText = ref('')
const isSubmitting = ref(false)

const isAuthorMe = computed(() => !!auth.user && props.post.authorId === auth.user.id)
const authorName = computed(() => (isAuthorMe.value ? auth.user!.name : props.post.authorName))
const authorAvatarUrl = computed(() => (isAuthorMe.value ? auth.user!.avatarUrl : props.post.authorAvatarUrl))

function getCommentAuthorName(comment: { authorId: string; authorName: string }) {
  if (auth.user && comment.authorId === auth.user.id) {
    return auth.user.name
  }
  return comment.authorName
}

function getCommentAvatarUrl(comment: { authorId: string; authorAvatarUrl: string }) {
  if (auth.user && comment.authorId === auth.user.id) {
    return auth.user.avatarUrl
  }
  return comment.authorAvatarUrl
}

const categoryColor = computed(() => CATEGORY_COLORS[props.post.category])
const categoryLabel = computed(() => CATEGORY_LABELS[props.post.category])

function toggleLike() {
  feed.toggleLike(props.post.id)
}

function toggleComments() {
  showComments.value = !showComments.value
}

async function submitComment() {
  if (!commentText.value.trim()) return
  isSubmitting.value = true
  try {
    await feed.addComment(props.post.id, commentText.value.trim())
    commentText.value = ''
    showComments.value = true
  } catch (err) {
    console.error('Erro ao comentar:', err)
  } finally {
    isSubmitting.value = false
  }
}

async function share() {
  const url = window.location.href
  const text = `${authorName.value}: ${props.post.text}`
  if (navigator.share) {
    try {
      await navigator.share({ title: 'EcoSocial', text, url })
    } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(url).catch(() => {})
    alert('Link copiado!')
  }
}
</script>

<template>
  <article class="eco-card post-card">
    <!-- Header -->
    <div class="post-header">
      <img :src="authorAvatarUrl" :alt="authorName" class="avatar" width="40" height="40" />
      <div class="post-meta">
        <span class="author-name">{{ authorName }}</span>
        <span class="post-time">{{ timeAgo(post.createdAt) }}</span>
      </div>
      <span class="category-badge" :style="{ background: categoryColor + '18', color: categoryColor }">
        {{ categoryLabel }}
      </span>
    </div>

    <!-- Body -->
    <p class="post-text">{{ post.text }}</p>
    <img v-if="post.imageUrl" :src="post.imageUrl" :alt="'Imagem do post'" class="post-image" />

    <!-- Actions -->
    <div class="post-actions">
      <button
        class="action-btn"
        :class="{ liked: post.likedByMe }"
        @click="toggleLike"
        :aria-label="post.likedByMe ? 'Descurtir' : 'Curtir'"
        :id="`like-${post.id}`"
      >
        <Heart :size="18" :fill="post.likedByMe ? 'currentColor' : 'none'" />
        <span>{{ post.likes }}</span>
      </button>

      <button class="action-btn" @click="toggleComments" :id="`comments-${post.id}`" :aria-label="'Ver comentarios'">
        <MessageCircle :size="18" />
        <span>{{ post.comments.length }}</span>
        <ChevronUp v-if="showComments" :size="14" />
        <ChevronDown v-else :size="14" />
      </button>

      <button class="action-btn" @click="share" :id="`share-${post.id}`" :aria-label="'Compartilhar'">
        <Share2 :size="18" />
      </button>
    </div>

    <!-- Comments -->
    <Transition name="slide-up">
      <div v-if="showComments" class="comments-section">
        <div v-if="post.comments.length" class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment">
            <img :src="getCommentAvatarUrl(comment)" :alt="getCommentAuthorName(comment)" class="avatar" width="28" height="28" />
            <div class="comment-bubble">
              <span class="comment-author">{{ getCommentAuthorName(comment) }}</span>
              <p class="comment-text">{{ comment.text }}</p>
            </div>
          </div>
        </div>
        <p v-else class="no-comments">Seja o primeiro a comentar.</p>

        <!-- Comment input -->
        <div class="comment-input-row">
          <input
            v-model="commentText"
            type="text"
            placeholder="Adicione um comentario..."
            class="comment-input"
            :id="`comment-input-${post.id}`"
            @keydown.enter="submitComment"
            maxlength="500"
          />
          <button
            class="btn-primary"
            style="padding:0.4rem 0.8rem;font-size:0.8rem"
            :disabled="!commentText.trim() || isSubmitting"
            @click="submitComment"
            :id="`comment-submit-${post.id}`"
          >
            <Send :size="14" />
          </button>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.post-card { padding: 1.25rem; margin-bottom: 1rem; }

.post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}

.post-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.author-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1c1917;
}

.post-time {
  font-size: 0.75rem;
  color: #a8a29e;
}

.category-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.post-text {
  margin: 0 0 1rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #292524;
}

.post-image {
  width: 100%;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  object-fit: cover;
  max-height: 400px;
}

.post-actions {
  display: flex;
  gap: 0.25rem;
  border-top: 1px solid #f5f5f4;
  padding-top: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #78716c;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover { background: #f5f5f4; color: #44403c; }
.action-btn.liked { color: #ef4444; }
.action-btn.liked:hover { background: #fff1f2; }

.comments-section {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f5f5f4;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.comment {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.comment-bubble {
  background: #f5f5f4;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  flex: 1;
}

.comment-author {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1c1917;
  display: block;
  margin-bottom: 0.125rem;
}

.comment-text {
  margin: 0;
  font-size: 0.875rem;
  color: #44403c;
  line-height: 1.5;
}

.no-comments {
  font-size: 0.875rem;
  color: #a8a29e;
  text-align: center;
  padding: 0.5rem;
  margin: 0 0 0.75rem;
}

.comment-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #e7e5e4;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #1c1917;
  background: #fafaf9;
  transition: border-color 0.15s ease;
}

.comment-input:focus {
  border-color: #22c55e;
  background: white;
}
</style>
