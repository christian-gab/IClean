<script setup lang="ts">
import { ref } from 'vue'
import type { PostCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { useFeedStore } from '@/stores/useFeedStore'
import PostCard from '@/features/feed/PostCard.vue'
import CreatePostModal from '@/features/feed/CreatePostModal.vue'
import { currentUser } from '@/mocks/user'
import { Plus, SlidersHorizontal } from '@lucide/vue'

const feed = useFeedStore()
const showModal = ref(false)

const categories = [
  ['all', 'Tudo'] as const,
  ...Object.entries(CATEGORY_LABELS) as [PostCategory, string][],
]

function setFilter(cat: string) {
  feed.setCategory(cat === 'all' ? null : cat as PostCategory)
}
</script>

<template>
  <div class="feed-page">
    <!-- Create post prompt -->
    <div class="create-prompt eco-card" @click="showModal = true" role="button" id="open-create-post">
      <img :src="currentUser.avatarUrl" :alt="currentUser.name" class="avatar" width="36" height="36" />
      <div class="prompt-placeholder">O que voce quer compartilhar hoje?</div>
      <button class="btn-primary" style="flex-shrink:0" @click.stop="showModal = true" id="btn-new-post">
        <Plus :size="16" /> Publicar
      </button>
    </div>

    <!-- Category filter -->
    <div class="filter-bar">
      <SlidersHorizontal :size="16" color="#a8a29e" />
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

    <!-- Posts -->
    <div v-if="feed.filteredPosts.length" class="posts-list">
      <TransitionGroup name="slide-up">
        <PostCard v-for="post in feed.filteredPosts" :key="post.id" :post="post" />
      </TransitionGroup>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🌿</div>
      <p>Nenhuma publicacao nessa categoria.</p>
      <button class="btn-secondary" @click="setFilter('all')" id="clear-filter">Ver todas</button>
    </div>

    <!-- Modal -->
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

.empty-state {
  text-align: center; padding: 3rem 1rem;
  color: #78716c; font-size: 0.9375rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}

.empty-icon { font-size: 3rem; }
</style>
