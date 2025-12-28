// ========================================
// 主题切换 Composable
// ========================================

import { onMounted, ref, watch } from 'vue'
import { trackThemeChange } from '@/utils/analytics'
import { STORAGE_KEYS, THEMES } from '@/utils/constants'

const theme = ref(THEMES.LIGHT)

// 应用主题到 DOM
function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme.value)
}

export function useTheme() {
  // 初始化主题
  const initTheme = () => {
    // 优先读取 localStorage
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      theme.value = savedTheme
    }
    else {
      // 检测系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? THEMES.DARK : THEMES.LIGHT
    }
    applyTheme()
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    // 追踪主题切换
    trackThemeChange(theme.value)
  }

  // 设置指定主题
  const setTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      theme.value = newTheme
    }
  }

  // 监听主题变化，保存到 localStorage
  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    applyTheme()
  })

  // 监听系统主题变化
  onMounted(() => {
    initTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // 只有在没有用户手动设置的情况下才跟随系统
      if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
        theme.value = e.matches ? THEMES.DARK : THEMES.LIGHT
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  })

  // 计算属性
  const isDark = () => theme.value === THEMES.DARK

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    initTheme,
  }
}
