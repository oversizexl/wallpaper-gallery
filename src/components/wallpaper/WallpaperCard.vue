<script setup>
import { ref, computed } from 'vue'
import { formatFileSize, formatRelativeTime } from '@/utils/format'

const props = defineProps({
  wallpaper: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['click'])

const imageLoaded = ref(false)
const imageError = ref(false)

// 使用新的数据结构
const quality = computed(() => props.wallpaper.quality || '高清')
const resolution = computed(() => props.wallpaper.resolution || { label: '1080P' })
const formattedSize = computed(() => formatFileSize(props.wallpaper.size))
const formattedTime = computed(() => formatRelativeTime(props.wallpaper.createdAt))

// 质量标签样式
const qualityClass = computed(() => {
  switch (quality.value) {
    case '超清': return 'tag--warning'
    case '4K': return 'tag--success'
    case '高清': return 'tag--primary'
    default: return 'tag--secondary'
  }
})

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = true
}

const handleClick = () => {
  emit('click', props.wallpaper)
}

// 动画延迟（错开入场效果）
const animationDelay = computed(() => {
  const delay = (props.index % 12) * 60
  return `${delay}ms`
})
</script>

<template>
  <div
    class="wallpaper-card"
    :style="{ '--delay': animationDelay }"
    @click="handleClick"
  >
    <!-- Image Container -->
    <div class="card-image">
      <!-- Skeleton 骨架屏 -->
      <div v-if="!imageLoaded" class="image-skeleton">
        <div class="skeleton-shimmer"></div>
      </div>

      <!-- Error State -->
      <div v-if="imageError && imageLoaded" class="image-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span>加载失败</span>
      </div>

      <!-- Image with fade-in effect -->
      <img
        v-show="imageLoaded && !imageError"
        :src="wallpaper.url"
        :alt="wallpaper.filename"
        loading="lazy"
        :class="{ 'is-loaded': imageLoaded }"
        @load="handleImageLoad"
        @error="handleImageError"
      />

      <!-- Overlay on hover -->
      <div class="card-overlay">
        <div class="overlay-content">
          <span class="overlay-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </span>
          <span class="overlay-text">查看大图</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="card-tags">
        <span class="tag" :class="qualityClass">
          {{ quality }}
        </span>
        <span class="tag tag--dark">{{ resolution.label }}</span>
      </div>
    </div>

    <!-- Card Info -->
    <div class="card-info">
      <p class="card-filename" :title="wallpaper.filename">
        {{ wallpaper.filename }}
      </p>
      <div class="card-meta">
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          {{ formattedSize }}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {{ formattedTime }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wallpaper-card {
  position: relative;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  opacity: 0;
  transform: translateY(20px);
  animation: cardEnter 0.5s ease forwards;
  animation-delay: var(--delay);

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-card-hover);

    .card-overlay {
      opacity: 1;
    }

    .card-image img {
      transform: scale(1.08);
    }
  }
}

@keyframes cardEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-image {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-bg-hover);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition:
      opacity 0.4s ease,
      transform 0.5s ease;

    &.is-loaded {
      opacity: 1;
    }
  }
}

.image-skeleton {
  position: absolute;
  inset: 0;
  background: var(--color-bg-hover);
  overflow: hidden;

  .skeleton-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--color-bg-card) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.image-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  color: var(--color-text-muted);

  svg {
    width: 32px;
    height: 32px;
  }

  span {
    font-size: $font-size-xs;
  }
}

.card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  color: white;
}

.overlay-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-full;
  backdrop-filter: blur(4px);

  svg {
    width: 24px;
    height: 24px;
  }
}

.overlay-text {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
}

.card-tags {
  position: absolute;
  top: $spacing-sm;
  left: $spacing-sm;
  display: flex;
  gap: $spacing-xs;
}

.tag {
  padding: 3px $spacing-sm;
  font-size: 10px;
  font-weight: $font-weight-bold;
  border-radius: $radius-sm;
  backdrop-filter: blur(4px);
  letter-spacing: 0.5px;

  &--primary {
    background: rgba(99, 102, 241, 0.9);
    color: white;
  }

  &--success {
    background: rgba(16, 185, 129, 0.9);
    color: white;
  }

  &--warning {
    background: rgba(245, 158, 11, 0.9);
    color: white;
  }

  &--secondary {
    background: rgba(107, 114, 128, 0.8);
    color: white;
  }

  &--dark {
    background: rgba(0, 0, 0, 0.6);
    color: white;
  }
}

.card-info {
  padding: $spacing-md;
}

.card-filename {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: $spacing-xs;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  font-size: $font-size-xs;
  color: var(--color-text-muted);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
}
</style>
