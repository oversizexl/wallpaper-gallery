<script setup>
import { ref, watch, nextTick } from 'vue'
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

// 用于控制列表显示的状态，避免闪烁
const isReady = ref(true)
const showGrid = ref(true)

// 监听 wallpapers 变化，添加短暂的隐藏状态避免闪烁
watch(() => props.wallpapers, async (newVal, oldVal) => {
  // 只有当数组内容真正变化时才触发过渡
  if (oldVal && oldVal.length > 0 && newVal.length > 0) {
    showGrid.value = false
    await nextTick()
    // 短暂延迟后显示新内容
    setTimeout(() => {
      showGrid.value = true
    }, 50)
  }
}, { deep: false })

const handleSelect = (wallpaper) => {
  emit('select', wallpaper)
}
</script>

<template>
  <div class="wallpaper-grid-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="grid-loading">
      <LoadingSpinner size="lg" />
      <p class="loading-text">加载壁纸中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="wallpapers.length === 0" class="grid-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <h3>没有找到壁纸</h3>
      <p>尝试调整搜索条件或筛选器</p>
    </div>

    <!-- Grid - 简化过渡，避免闪烁 -->
    <div v-else class="wallpaper-grid" :class="{ 'is-hidden': !showGrid }">
      <WallpaperCard
        v-for="(wallpaper, index) in wallpapers"
        :key="wallpaper.id"
        :wallpaper="wallpaper"
        :index="index"
        @click="handleSelect"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wallpaper-grid-wrapper {
  min-height: 400px;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--grid-gap);
  transition: opacity 0.2s ease;

  &.is-hidden {
    opacity: 0;
  }

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
</style>
