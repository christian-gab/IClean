<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PostCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import PostCard from '@/features/feed/PostCard.vue'
import CreatePostModal from '@/features/feed/CreatePostModal.vue'

const feed = useFeedStore()
const auth = useAuthStore()
const showModal = ref(false)

const categories = [
  ['all', 'Tudo'] as const,
  ...Object.entries(CATEGORY_LABELS) as [PostCategory, string][],
]

function setFilter(cat: string) {
  feed.setCategory(cat === 'all' ? null : cat as PostCategory)
}

onMounted(() => {
  feed.fetchPosts()
})
</script>

<template>
  <div class="feed-page">
    <div class="create-prompt eco-card" @click="showModal = true" role="button" id="open-create-post">
      <img :src="auth.user?.avatarUrl" :alt="auth.user?.name" class="avatar" width="36" height="36" />
      <div class="prompt-placeholder">O que você quer compartilhar hoje?</div>
      <button class="btn-primary" style="flex-shrink:0" @click.stop="showModal = true" id="btn-new-post">
        <i class="fa-solid fa-plus" aria-hidden="true" /> Publicar
      </button>
    </div>

    <div class="filter-bar">
      <i class="fa-solid fa-sliders" style="color:#a8a29e" aria-hidden="true" />
      <div class="filter-chips">
        <button
          v-for="[val, label] in categories"
          :key="val"
          class="chip"
          :class="{ active: (val === 'all' && !feed.activeCategory) || feed.activeCategory === val }"
          @click="setFilter(val)"
          :id="`filter-${val}`"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <div v-if="feed.isLoading" class="loading-state">
      <i class="fa-solid fa-spinner spin" style="color:#16a34a" aria-hidden="true" />
      <p>Carregando publicações...</p>
    </div>

    <div v-else-if="feed.filteredPosts.length" class="posts-list">
      <TransitionGroup name="slide-up">
        <PostCard v-for="post in feed.filteredPosts" :key="post.id" :post="post" />
      </TransitionGroup>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon"><i class="fa-solid fa-seedling" aria-hidden="true" /></div>
      <p>Nenhuma publicacao nessa categoria.</p>
      <button class="btn-secondary" @click="setFilter('all')" id="clear-filter">Ver todas</button>
    </div>

    <Transition name="fade">
      <CreatePostModal v-if="showModal" @close="showModal = false" />
    </Transition>
  </div>
</template>

<style scoped>
.feed-page { max-width: 640px; margin: 0 auto; }

.create-prompt {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1rem 1.25rem; margin-bottom: 1rem; cursor: pointer;
}

.prompt-placeholder {
  flex: 1; color: #a8a29e; font-size: 0.9375rem;
  background: #f5f5f4; border-radius: 9999px;
  padding: 0.5rem 1rem;
}

.filter-bar {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 1rem; overflow-x: auto; padding-bottom: 4px;
}

.filter-chips { display: flex; gap: 0.375rem; flex-shrink: 0; }

.chip {
  padding: 0.375rem 0.875rem; border-radius: 9999px;
  border: 1.5px solid #e7e5e4; background: white;
  font-size: 0.8125rem; font-weight: 500; color: #78716c;
  cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
}

.chip:hover { border-color: #86efac; color: #16a34a; }
.chip.active { background: #dcfce7; border-color: #86efac; color: #15803d; font-weight: 600; }

.posts-list { display: flex; flex-direction: column; }

.empty-state, .loading-state {
  text-align: center; padding: 3rem 1rem;
  color: #78716c; font-size: 0.9375rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 3rem; }

@media (max-width: 480px) {
  .create-prompt {
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
  }

  .prompt-placeholder {
    min-width: 0;
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .create-prompt > .btn-primary {
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
}
</style>
