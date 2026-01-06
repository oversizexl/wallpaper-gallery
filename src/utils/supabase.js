// ========================================
// Supabase 壁纸统计服务
// ========================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * 获取当前时间的 ISO 字符串
 * timestamptz 类型会自动处理时区，直接发送 UTC 时间即可
 * @returns {string} ISO 格式字符串
 */
function getCurrentTimeISO() {
  return new Date().toISOString()
}

/**
 * 通用的事件记录函数
 * @param {string} table - 表名
 * @param {object} data - 数据
 */
async function recordEvent(table, data) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (import.meta.env.DEV) {
      console.log(`📊 [Supabase] 未配置，跳过 ${table} 记录`)
    }
    return
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    if (import.meta.env.DEV) {
      console.log(`📊 [Supabase] ${table} 已记录:`, data.filename)
    }
  }
  catch (error) {
    // 静默失败，不影响用户体验
    if (import.meta.env.DEV) {
      console.warn(`📊 [Supabase] ${table} 记录失败:`, error)
    }
  }
}

/**
 * 记录壁纸下载
 * @param {object} wallpaper - 壁纸对象
 * @param {string} series - 系列 (desktop/mobile/avatar)
 */
export function recordDownload(wallpaper, series) {
  recordEvent('wallpaper_downloads', {
    filename: wallpaper.filename,
    series,
    category: wallpaper.category || null,
    created_at: getCurrentTimeISO(),
  })
}

/**
 * 记录壁纸预览（打开弹窗查看）
 * @param {object} wallpaper - 壁纸对象
 * @param {string} series - 系列 (desktop/mobile/avatar)
 */
export function recordView(wallpaper, series) {
  recordEvent('wallpaper_views', {
    filename: wallpaper.filename,
    series,
    category: wallpaper.category || null,
    created_at: getCurrentTimeISO(),
  })
}

/**
 * 获取下载统计
 * @param {number} limit - 返回数量限制
 * @returns {Promise<Array>} 下载统计数组
 */
export async function getDownloadStats(limit = 50) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/download_stats?limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  }
  catch (error) {
    console.error('获取下载统计失败:', error)
    return []
  }
}

/**
 * 获取热门壁纸（综合下载和浏览）
 * @param {string} series - 系列
 * @param {number} limit - 返回数量
 * @returns {Promise<Array>} 热门壁纸数组
 */
export async function getPopularWallpapers(series = 'desktop', limit = 20) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/popular_wallpapers?series=eq.${series}&limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  }
  catch (error) {
    console.error('获取热门壁纸失败:', error)
    return []
  }
}

/**
 * 获取单个壁纸的下载次数
 * @param {string} filename - 文件名
 * @param {string} series - 系列
 * @returns {Promise<number>} 下载次数
 */
export async function getWallpaperDownloadCount(filename, series) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return 0
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/download_stats?filename=eq.${encodeURIComponent(filename)}&series=eq.${series}&select=download_count`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.length > 0 ? data[0].download_count : 0
  }
  catch (error) {
    console.error('获取下载次数失败:', error)
    return 0
  }
}

/**
 * 获取单个壁纸的访问量
 * @param {string} filename - 文件名
 * @param {string} series - 系列
 * @returns {Promise<number>} 访问量
 */
export async function getWallpaperViewCount(filename, series) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return 0
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/view_stats?filename=eq.${encodeURIComponent(filename)}&series=eq.${series}&select=view_count`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.length > 0 ? data[0].view_count : 0
  }
  catch (error) {
    if (import.meta.env.DEV) {
      console.warn('获取访问量失败:', error)
    }
    return 0
  }
}

/**
 * 获取指定时间范围内的热门壁纸
 * @param {string} series - 系列
 * @param {number} days - 天数 (7 或 30)
 * @param {number} limit - 返回数量
 * @returns {Promise<Array>} 热门壁纸数组
 */
export async function getPopularByTimeRange(series, days, limit = 100) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return []
  }

  // 根据天数选择对应的视图
  const viewName = days <= 7 ? 'popular_wallpapers_weekly' : 'popular_wallpapers_monthly'

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${viewName}?series=eq.${series}&limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  }
  catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`获取${days}天热门壁纸失败:`, error)
    }
    return []
  }
}

/**
 * 检查 Supabase 是否已配置
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}
