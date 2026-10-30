<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Post } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { timeAgo } from '@/utils/date'

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
      await navigator.share({ title: 'Iclean', text, url })
    } catch {}
  } else {
    await navigator.clipboard.writeText(url).catch(() => {})
    alert('Link copiado!')
  }
}
</script>

<template>
  <article class="card-ds post-card">
    <div class="post-header">
      <img :src="authorAvatarUrl" :alt="authorName" class="avatar" width="38" height="38" />
      <div class="post-meta">
        <span class="author-name">{{ authorName }}</span>
        <span class="post-time">{{ timeAgo(post.createdAt) }}</span>
      </div>
      <span class="category-badge" :style="{ background: categoryColor + '15', color: categoryColor }">
        {{ categoryLabel }}
      </span>
    </div>

    <p class="post-text">{{ post.text }}</p>
    <img v-if="post.imageUrl" :src="post.imageUrl" :alt="'Imagem do post'" class="post-image" />

    <div class="post-actions">
      <button
        class="action-btn"
        :class="{ liked: post.likedByMe }"
        @click="toggleLike"
        :aria-label="post.likedByMe ? 'Descurtir' : 'Curtir'"
        :id="`like-${post.id}`"
      >
        <i :class="post.likedByMe ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" aria-hidden="true" />
        <span>{{ post.likes }}</span>
      </button>

      <button class="action-btn" @click="toggleComments" :id="`comments-${post.id}`" :aria-label="'Ver comentários'">
        <i class="fa-solid fa-comment" aria-hidden="true" />
        <span>{{ post.comments.length }}</span>
        <i v-if="showComments" class="fa-solid fa-chevron-up" aria-hidden="true" />
        <i v-else class="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>

      <button class="action-btn" @click="share" :id="`share-${post.id}`" :aria-label="'Compartilhar'">
        <i class="fa-solid fa-share-nodes" aria-hidden="true" />
      </button>
    </div>

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

        <div class="comment-input-row">
          <input
            v-model="commentText"
            type="text"
            placeholder="Adicione um comentário..."
            class="comment-input"
            :id="`comment-input-${post.id}`"
            @keydown.enter="submitComment"
            maxlength="500"
          />
          <button
            class="btn-primary"
            style="padding: 0.45rem 0.8rem; font-size: 0.8125rem"
            :disabled="!commentText.trim() || isSubmitting"
            @click="submitComment"
            :id="`comment-submit-${post.id}`"
          >
            <i class="fa-solid fa-paper-plane" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.post-card { padding: 1.125rem 1.25rem; margin-bottom: 0.875rem; }

.post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.post-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1917;
}

.post-time {
  font-size: 0.75rem;
  color: #78716c;
}

.category-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius);
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.post-text {
  margin: 0 0 0.875rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #292524;
}

.post-image {
  width: 100%;
  border-radius: var(--radius);
  margin-bottom: 0.875rem;
  object-fit: cover;
  max-height: 400px;
  border: 1px solid var(--color-border);
}

.post-actions {
  display: flex;
  gap: 0.25rem;
  border-top: 1px solid var(--color-border);
  padding-top: 0.625rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: none;
  border: none;
  border-radius: var(--radius);
  font-size: 0.8125rem;
  font-weight: 500;
  color: #78716c;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover { background: #f5f5f4; color: #1c1917; }
.action-btn.liked { color: #dc2626; }
.action-btn.liked:hover { background: #fef2f2; }

.comments-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.comment {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.comment-bubble {
  background: #f5f5f4;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  flex: 1;
}

.comment-author {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1c1917;
  display: block;
  margin-bottom: 0.125rem;
}

.comment-text {
  margin: 0;
  font-size: 0.8125rem;
  color: #44403c;
  line-height: 1.5;
}

.no-comments {
  font-size: 0.8125rem;
  color: #78716c;
  text-align: center;
  padding: 0.5rem;
  margin: 0 0 0.625rem;
}

.comment-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.8125rem;
  color: #1c1917;
  background: white;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.comment-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}
</style>
