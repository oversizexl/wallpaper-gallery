/**
 * 构建优化属性测试
 * Feature: multi-environment-deployment
 * Property 5: Bundle Optimization
 * Property 7: Conditional Build Operations
 * Validates: Requirements 4.2, 4.4
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Build Optimization Configuration', () => {
  const viteConfigPath = path.join(ROOT_DIR, 'vite.config.js')
  const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8')

  describe('Compression Configuration', () => {
    it('should have compression plugin configured', () => {
      expect(viteConfigContent).toContain('compression')
    })

    it('should use Brotli compression for better compression ratio', () => {
      expect(viteConfigContent).toContain('brotliCompress')
    })

    it('should have compression threshold configured', () => {
      expect(viteConfigContent).toContain('threshold')
    })
  })

  describe('Code Splitting Configuration', () => {
    it('should have manual chunks configuration', () => {
      expect(viteConfigContent).toContain('manualChunks')
    })

    it('should split element-plus into separate chunk', () => {
      expect(viteConfigContent).toContain('element-plus')
    })

    it('should split vant into separate chunk', () => {
      expect(viteConfigContent).toContain('vant')
    })
  })

  describe('Build Output Configuration', () => {
    it('should have CSS code splitting enabled', () => {
      expect(viteConfigContent).toContain('cssCodeSplit')
    })

    it('should use esbuild for minification', () => {
      expect(viteConfigContent).toContain("minify: 'esbuild'")
    })

    it('should have chunk size warning limit', () => {
      expect(viteConfigContent).toContain('chunkSizeWarningLimit')
    })

    it('should have organized output file names', () => {
      expect(viteConfigContent).toContain('chunkFileNames')
      expect(viteConfigContent).toContain('entryFileNames')
      expect(viteConfigContent).toContain('assetFileNames')
    })
  })

  describe('Production Optimizations', () => {
    it('should drop console and debugger in production', () => {
      expect(viteConfigContent).toContain('drop:')
      expect(viteConfigContent).toContain('console')
      expect(viteConfigContent).toContain('debugger')
    })

    it('should have obfuscation plugin for sensitive files', () => {
      expect(viteConfigContent).toContain('obfuscatePlugin')
    })
  })

  describe('Property Tests: Bundle Optimization', () => {
    /**
     * Property 5: Bundle Optimization
     * For any build output, the generated bundles should meet
     * size and compression optimization criteria.
     */

    // 定义优化配置项
    const optimizationConfigs = [
      { name: 'compression', pattern: 'compression' },
      { name: 'code-splitting', pattern: 'manualChunks' },
      { name: 'css-splitting', pattern: 'cssCodeSplit' },
      { name: 'minification', pattern: 'minify' },
      { name: 'chunk-naming', pattern: 'chunkFileNames' },
    ]

    it('should have all optimization configurations present', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...optimizationConfigs),
          (config) => {
            expect(viteConfigContent).toContain(config.pattern)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have valid chunk size warning limit', () => {
      const limitMatch = viteConfigContent.match(/chunkSizeWarningLimit:\s*(\d+)/)
      expect(limitMatch).not.toBeNull()

      const limit = Number.parseInt(limitMatch[1])
      // 限制应该在合理范围内 (100KB - 2MB)
      expect(limit).toBeGreaterThanOrEqual(100)
      expect(limit).toBeLessThanOrEqual(2000)
    })

    it('should have valid compression threshold', () => {
      const thresholdMatch = viteConfigContent.match(/threshold:\s*(\d+)/)
      expect(thresholdMatch).not.toBeNull()

      const threshold = Number.parseInt(thresholdMatch[1])
      // 压缩阈值应该在合理范围内 (1KB - 100KB)
      expect(threshold).toBeGreaterThanOrEqual(1024)
      expect(threshold).toBeLessThanOrEqual(102400)
    })
  })
})

describe('Conditional Build Operations', () => {
  /**
   * Property 7: Conditional Build Operations
   * 验证构建操作在不同环境中的行为
   */

  describe('Environment-Specific Build Behavior', () => {
    it('should have production-only obfuscation', () => {
      const viteConfigPath = path.join(ROOT_DIR, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8')

      // 混淆只在生产环境启用
      expect(viteConfigContent).toContain('isProduction')
      expect(viteConfigContent).toContain('isProduction && obfuscatePlugin')
    })

    it('should have production-only external dependencies', () => {
      const viteConfigPath = path.join(ROOT_DIR, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8')

      // CDN 外部依赖只在生产环境使用
      expect(viteConfigContent).toContain('isProduction ?')
      expect(viteConfigContent).toContain('external:')
    })
  })

  describe('Build Script Consistency', () => {
    it('should have consistent data generation across environments', () => {
      const generateDataPath = path.join(ROOT_DIR, 'scripts/generate-data.js')
      const generateDataContent = fs.readFileSync(generateDataPath, 'utf-8')

      // 数据生成脚本应该存在
      expect(fs.existsSync(generateDataPath)).toBe(true)

      // 应该支持图片分辨率检测
      expect(generateDataContent).toContain('getImageDimensions')
    })

    it('should use same data generation for all environments', () => {
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      // 生产构建使用 generate-data.js
      expect(packageJson.scripts.build).toContain('generate-data.js')

      // Vercel 构建也使用相同的数据生成脚本
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')
      expect(vercelBuildContent).toContain('generate-data.js')
    })
  })

  describe('Property Tests: Build Consistency', () => {
    const buildScripts = [
      { name: 'production', script: 'build', file: 'package.json' },
      { name: 'vercel', script: 'build:vercel', file: 'package.json' },
    ]

    it('should have all build scripts defined', () => {
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      fc.assert(
        fc.property(
          fc.constantFrom(...buildScripts),
          (buildScript) => {
            expect(packageJson.scripts[buildScript.script]).toBeDefined()
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should use vite build in all build scripts', () => {
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      // 生产构建直接使用 vite build
      expect(packageJson.scripts.build).toContain('vite build')

      // Vercel 构建通过脚本间接使用 vite build
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')
      expect(vercelBuildContent).toContain('pnpm build')
    })
  })
})

describe('Cache Headers Configuration', () => {
  /**
   * 验证缓存策略配置
   */

  const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

  describe('Static Asset Caching', () => {
    it('should have cache headers for assets', () => {
      const assetsHeader = vercelConfig.headers.find(h => h.source.includes('assets'))
      expect(assetsHeader).toBeDefined()
    })

    it('should use immutable cache for static assets', () => {
      const assetsHeader = vercelConfig.headers.find(h => h.source.includes('assets'))
      const cacheControl = assetsHeader.headers.find(h => h.key === 'Cache-Control')

      expect(cacheControl.value).toContain('immutable')
      expect(cacheControl.value).toContain('max-age=31536000')
    })
  })

  describe('Property Tests: Cache Configuration', () => {
    const cacheableAssets = ['/assets/(.*)', '/(.*).js', '/(.*).css']

    it('should have cache headers for all cacheable asset types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...cacheableAssets),
          (assetPattern) => {
            const header = vercelConfig.headers.find(h => h.source === assetPattern)
            expect(header).toBeDefined()

            const cacheControl = header.headers.find(h => h.key === 'Cache-Control')
            expect(cacheControl).toBeDefined()
            expect(cacheControl.value).toContain('max-age')

            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
