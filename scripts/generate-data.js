/**
 * 壁纸数据生成脚本
 * 在构建前运行，生成 wallpapers.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const CONFIG = {
  // GitHub 图床仓库信息
  GITHUB_OWNER: 'IT-NuanxinPro',
  GITHUB_REPO: 'nuanXinProPic',
  GITHUB_BRANCH: 'main',
  WALLPAPER_DIR: 'wallpaper',

  // 支持的图片格式
  IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],

  // 输出路径
  OUTPUT_DIR: path.resolve(__dirname, '../public/data'),
  OUTPUT_FILE: 'wallpapers.json'
}

// 使用 raw.githubusercontent.com（更稳定，支持中文文件名）
const RAW_BASE_URL = `https://raw.githubusercontent.com/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.WALLPAPER_DIR}`

/**
 * 通过 GitHub API 获取壁纸列表
 */
async function fetchWallpapersFromGitHub() {
  const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.WALLPAPER_DIR}?ref=${CONFIG.GITHUB_BRANCH}`

  console.log('Fetching wallpapers from GitHub API...')
  console.log(`URL: ${apiUrl}`)

  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Wallpaper-Gallery-Builder'
    }
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  const files = await response.json()

  // 过滤出图片文件
  const imageFiles = files.filter(file => {
    if (file.type !== 'file') return false
    const ext = path.extname(file.name).toLowerCase()
    return CONFIG.IMAGE_EXTENSIONS.includes(ext)
  })

  console.log(`Found ${imageFiles.length} image files`)

  return imageFiles
}

/**
 * 根据文件大小估算分辨率
 */
function estimateResolution(size, format) {
  // 根据文件大小和格式估算分辨率
  // PNG 通常比 JPG 大，所以分开处理
  const isPng = format.toUpperCase() === 'PNG'

  if (isPng) {
    if (size >= 8 * 1024 * 1024) return { width: 3840, height: 2160, label: '4K+' }
    if (size >= 4 * 1024 * 1024) return { width: 2560, height: 1440, label: '2K' }
    if (size >= 2 * 1024 * 1024) return { width: 1920, height: 1080, label: '1080P' }
    return { width: 1280, height: 720, label: '720P' }
  } else {
    if (size >= 5 * 1024 * 1024) return { width: 3840, height: 2160, label: '4K+' }
    if (size >= 2 * 1024 * 1024) return { width: 2560, height: 1440, label: '2K' }
    if (size >= 800 * 1024) return { width: 1920, height: 1080, label: '1080P' }
    return { width: 1280, height: 720, label: '720P' }
  }
}

/**
 * 根据分辨率生成质量标签
 */
function getQualityLabel(resolution) {
  switch (resolution.label) {
    case '4K+': return '超清'
    case '2K': return '4K'
    case '1080P': return '高清'
    default: return '标清'
  }
}

/**
 * 生成壁纸数据
 */
function generateWallpaperData(files) {
  const now = new Date()

  return files.map((file, index) => {
    const ext = path.extname(file.name).replace('.', '').toUpperCase()
    const resolution = estimateResolution(file.size, ext)
    const qualityLabel = getQualityLabel(resolution)

    // 根据索引生成模拟上传时间（越前面的越新）
    const uploadDate = new Date(now.getTime() - index * 3600000) // 每张间隔1小时

    // 使用 raw GitHub URL（更稳定）
    const imageUrl = `${RAW_BASE_URL}/${encodeURIComponent(file.name)}`

    return {
      id: `wallpaper-${index + 1}`,
      filename: file.name,
      url: imageUrl,
      downloadUrl: imageUrl,
      size: file.size,
      format: ext,
      resolution: {
        width: resolution.width,
        height: resolution.height,
        label: resolution.label
      },
      quality: qualityLabel,
      tags: [qualityLabel, ext, resolution.label],
      createdAt: uploadDate.toISOString(),
      sha: file.sha
    }
  })
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(50))
  console.log('Wallpaper Data Generator')
  console.log('='.repeat(50))

  try {
    // 获取壁纸文件列表
    const files = await fetchWallpapersFromGitHub()

    if (files.length === 0) {
      console.warn('No image files found!')
      return
    }

    // 生成壁纸数据
    const wallpapers = generateWallpaperData(files)

    // 按大小降序排列（默认显示最大的在前）
    wallpapers.sort((a, b) => b.size - a.size)

    // 确保输出目录存在
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true })
    }

    // 写入 JSON 文件
    const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_FILE)
    const outputData = {
      generatedAt: new Date().toISOString(),
      total: wallpapers.length,
      source: `https://github.com/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}`,
      baseUrl: RAW_BASE_URL,
      wallpapers
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2))

    console.log('')
    console.log('='.repeat(50))
    console.log('Generation Complete!')
    console.log('='.repeat(50))
    console.log(`Total wallpapers: ${wallpapers.length}`)
    console.log(`Output file: ${outputPath}`)
    console.log(`Base URL: ${RAW_BASE_URL}`)
    console.log('')

    // 输出统计
    const stats = {
      jpg: wallpapers.filter(w => w.format === 'JPG' || w.format === 'JPEG').length,
      png: wallpapers.filter(w => w.format === 'PNG').length,
      hd: wallpapers.filter(w => w.quality === '超清' || w.quality === '4K').length
    }
    console.log('Statistics:')
    console.log(`  JPG: ${stats.jpg}`)
    console.log(`  PNG: ${stats.png}`)
    console.log(`  HD (4K+): ${stats.hd}`)

  } catch (error) {
    console.error('Error generating wallpaper data:', error)
    process.exit(1)
  }
}

main()
