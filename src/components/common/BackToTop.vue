<script setup>
import { gsap } from 'gsap'
import { ref, watch } from 'vue'
import { useScrollTop } from '@/composables/useScrollTop'
import { trackBackToTop } from '@/utils/analytics'

const { showButton, scrollToTop } = useScrollTop()
const buttonRef = ref(null)

// 按钮出现/消失动画
watch(showButton, (show) => {
  if (buttonRef.value) {
    if (show) {
      gsap.fromTo(
        buttonRef.value,
        { opacity: 0, scale: 0.5, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(2)' },
      )
    }
    else {
      gsap.to(buttonRef.value, {
        opacity: 0,
        scale: 0.5,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
      })
    }
  }
})

function handleClick() {
  // 追踪返回顶部点击，记录当前滚动位置
  const scrollPosition = window.scrollY || document.documentElement.scrollTop
  trackBackToTop(scrollPosition)

  // 点击动画
  if (buttonRef.value) {
    gsap.to(buttonRef.value, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    })
  }
  scrollToTop()
}
</script>

<template>
  <Transition name="fade">
    <button
      v-show="showButton"
      ref="buttonRef"
      class="back-to-top"
      aria-label="回到顶部"
      @click="handleClick"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>

<style lang="scss" scoped>
.back-to-top {
  position: fixed;
  right: $spacing-lg;
  bottom: $spacing-lg;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-accent);
  border-radius: $radius-full;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
  will-change: transform, opacity;

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    background: var(--color-accent-hover);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(-2px);
  }

  @include mobile-only {
    right: 16px;
    // 移动端底部适配安全区域
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    width: 48px;
    height: 48px;
    // 增强移动端阴影效果
    box-shadow:
      0 4px 12px rgba(99, 102, 241, 0.4),
      0 0 0 3px rgba(99, 102, 241, 0.1);

    svg {
      width: 22px;
      height: 22px;
    }

    &:active {
      transform: scale(0.92);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }
  }
}

// Transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
