import { computed, ref, watch } from 'vue'
import { trackSeriesSwitch } from '@/utils/analytics'
import { ALL_SERIES, DEFAULT_SERIES, DEVICE_SERIES, SERIES_CONFIG, STORAGE_KEYS } from '@/utils/constants'

// 全局状态
const currentSeries = ref('desktop')

/**
 * 检测当前设备类型
 * @returns {'desktop' | 'mobile'} 设备类型
 */
function getDeviceType() {
  if (typeof window === 'undefined')
    return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

/**
 * 获取当前设备可用的系列列表
 * @param {'desktop' | 'mobile'} deviceType - 设备类型
 * @returns {string[]} 可用的系列ID列表
 */
function getAvailableSeriesForDevice(deviceType) {
  return DEVICE_SERIES[deviceType] || DEVICE_SERIES.desktop
}

/**
 * 获取当前设备的默认系列
 * @param {'desktop' | 'mobile'} deviceType - 设备类型
 * @returns {string} 默认系列ID
 */
function getDefaultSeriesForDevice(deviceType) {
  return DEFAULT_SERIES[deviceType] || DEFAULT_SERIES.desktop
}

/**
 * 验证系列是否对当前设备可用
 * @param {string} series - 系列ID
 * @param {'desktop' | 'mobile'} deviceType - 设备类型
 * @returns {boolean} 是否可用
 */
function isSeriesAvailable(series, deviceType) {
  const available = getAvailableSeriesForDevice(deviceType)
  return available.includes(series)
}

// 初始化：从 localStorage 读取或使用设备默认值
function initCurrentSeries() {
  const deviceType = getDeviceType()
  const savedSeries = localStorage.getItem(STORAGE_KEYS.CURRENT_SERIES)

  // 如果有保存的值且对当前设备可用，使用保存的值
  if (savedSeries && isSeriesAvailable(savedSeries, deviceType)) {
    currentSeries.value = savedSeries
  }
  else {
    // 否则使用当前设备的默认系列
    currentSeries.value = getDefaultSeriesForDevice(deviceType)
  }
}

// 执行初始化
initCurrentSeries()

// 监听变化并保存到 localStorage
watch(currentSeries, (newSeries) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SERIES, newSeries)
})

export function useWallpaperType() {
  // 当前设备类型（响应式）
  const deviceType = ref(getDeviceType())

  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      const newDeviceType = getDeviceType()
      if (deviceType.value !== newDeviceType) {
        deviceType.value = newDeviceType
        // 设备类型变化时，检查当前系列是否仍然可用
        if (!isSeriesAvailable(currentSeries.value, newDeviceType)) {
          currentSeries.value = getDefaultSeriesForDevice(newDeviceType)
        }
      }
    })
  }

  // 当前设备可用的系列列表
  const availableSeries = computed(() => {
    return getAvailableSeriesForDevice(deviceType.value)
  })

  // 当前设备可用的系列配置（带详细信息）
  const availableSeriesOptions = computed(() => {
    return availableSeries.value.map(id => SERIES_CONFIG[id])
  })

  // 当前系列的配置信息
  const currentSeriesConfig = computed(() => {
    return SERIES_CONFIG[currentSeries.value] || SERIES_CONFIG.desktop
  })

  // 当前系列的数据URL
  const currentDataUrl = computed(() => {
    return currentSeriesConfig.value.dataUrl
  })

  /**
   * 设置当前系列
   * @param {string} series - 系列ID
   */
  function setCurrentSeries(series) {
    // 验证系列是否有效
    if (!ALL_SERIES.includes(series)) {
      console.warn(`Invalid series: ${series}`)
      return
    }

    // 验证系列是否对当前设备可用
    if (!isSeriesAvailable(series, deviceType.value)) {
      console.warn(`Series ${series} is not available for ${deviceType.value} device`)
      return
    }

    // 追踪系列切换事件
    const oldSeries = currentSeries.value
    if (oldSeries !== series) {
      trackSeriesSwitch(oldSeries, series)
    }

    currentSeries.value = series
  }

  /**
   * 根据路由参数初始化系列
   * @param {string} routeSeries - 路由中的系列参数
   */
  function initFromRoute(routeSeries) {
    if (routeSeries && ALL_SERIES.includes(routeSeries)) {
      // 如果路由指定的系列对当前设备可用，使用它
      if (isSeriesAvailable(routeSeries, deviceType.value)) {
        currentSeries.value = routeSeries
      }
      else {
        // 否则使用设备默认系列
        currentSeries.value = getDefaultSeriesForDevice(deviceType.value)
      }
    }
  }

  // 兼容旧代码：wallpaperType 作为 currentSeries 的别名
  const wallpaperType = currentSeries

  function setWallpaperType(type) {
    setCurrentSeries(type)
  }

  return {
    // 新API
    currentSeries,
    deviceType,
    availableSeries,
    availableSeriesOptions,
    currentSeriesConfig,
    currentDataUrl,
    setCurrentSeries,
    initFromRoute,

    // 兼容旧API
    wallpaperType,
    setWallpaperType,
  }
}
