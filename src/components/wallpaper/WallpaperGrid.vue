<script setup>
import { TransitionGroup, ref, watch } from 'vue'
import WallpaperCard from './WallpaperCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  wallpapers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

// 用于控制过渡动画的状态
const isTransitioning = ref(false)
let transitionTimer = null

// 监听 wallpapers 变化，添加短暂的过渡状态
watch(() => props.wallpapers, () => {
  isTransitioning.value = true
  if (transitionTimer) clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    isTransitioning.value = false
  }, 100)
}, { deep: false })

const handleSelect = (wallpaper) => {
  emit('select', wallpaper)
}
</script>

<template>
  <div class="wallpaper-grid-wrapper" :class="{ 'is-transitioning': isTransitioning }">
    <!-- Loading State -->
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="grid-loading" key="loading">
        <LoadingSpinner size="lg" />
        <p class="loading-text">加载壁纸中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="wallpapers.length === 0" class="grid-empty" key="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <h3>没有找到壁纸</h3>
        <p>尝试调整搜索条件或筛选器</p>
      </div>

      <!-- Grid -->
      <div v-else class="wallpaper-grid" key="grid">
        <TransitionGroup name="grid" tag="div" class="grid-inner">
          <WallpaperCard
            v-for="(wallpaper, index) in wallpapers"
            :key="wallpaper.id"
            :wallpaper="wallpaper"
            :index="index"
            @click="handleSelect"
          />
        </TransitionGroup>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.wallpaper-grid-wrapper {
  min-height: 400px;
  transition: opacity 0.2s ease;

  &.is-transitioning {
    opacity: 0.7;
  }
}

.wallpaper-grid {
  width: 100%;
}

.grid-inner {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--grid-gap);

  @include respond-to('sm') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to('md') {
    grid-template-columns: repeat(3, 1fr);
  }

  @include respond-to('lg') {
    grid-template-columns: repeat(4, 1fr);
  }

  @include respond-to('xl') {
    grid-template-columns: repeat(5, 1fr);
  }
}

.grid-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
  gap: $spacing-md;
}

.loading-text {
  font-size: $font-size-sm;
  color: var(--color-text-muted);
}

.grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
  text-align: center;

  svg {
    width: 80px;
    height: 80px;
    color: var(--color-text-muted);
    opacity: 0.5;
    margin-bottom: $spacing-lg;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }
}

// Grid transition
.grid-enter-active {
  transition: all 0.4s ease;
}

.grid-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

.grid-leave-active {
  position: absolute;
  transition: all 0.25s ease;
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.grid-move {
  transition: transform 0.4s ease;
}

// Fade transition for loading/empty/grid states
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
