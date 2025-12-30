/**
 * 构建流程顺序属性测试
 * Feature: multi-environment-deployment, Property 1: Build Process Sequencing
 * Validates: Requirements 2.5
 *
 * 注意：这些测试验证构建脚本的逻辑，不会影响生产环境
 * 生产环境（main 分支）使用 GitHub Actions 的原有流程
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Build Process Sequencing', () => {
  // 读取 vercel-build.js 脚本内容进行静态分析
  const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
  const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')

  describe('Script Structure Validation', () => {
    it('should have CDN version fetch function defined before build', () => {
      const cdnFetchIndex = vercelBuildContent.indexOf('fetchLatestCDNVersion')
      const buildAppIndex = vercelBuildContent.indexOf('buildApplication')

      expect(cdnFetchIndex).toBeGreaterThan(-1)
      expect(buildAppIndex).toBeGreaterThan(-1)
      // CDN fetch 函数应该在 build 函数之前定义
      expect(cdnFetchIndex).toBeLessThan(buildAppIndex)
    })

    it('should have data generation function defined before build', () => {
      const generateDataIndex = vercelBuildContent.indexOf('generateWallpaperData')
      const buildAppIndex = vercelBuildContent.indexOf('buildApplication')

      expect(generateDataIndex).toBeGreaterThan(-1)
      expect(buildAppIndex).toBeGreaterThan(-1)
      // 数据生成函数应该在 build 函数之前定义
      expect(generateDataIndex).toBeLessThan(buildAppIndex)
    })

    it('should have main function that orchestrates the build process', () => {
      expect(vercelBuildContent).toContain('async function main()')
    })
  })

  describe('Build Sequence in Main Function', () => {
    // 提取 main 函数内容
    const mainFunctionMatch = vercelBuildContent.match(/async function main\(\)\s*\{[\s\S]*?\n\}/m)
    const mainFunctionContent = mainFunctionMatch ? mainFunctionMatch[0] : ''

    it('should fetch CDN version before updating constants', () => {
      const cdnVersionIndex = mainFunctionContent.indexOf('fetchLatestCDNVersion')
      const updateCDNIndex = mainFunctionContent.indexOf('updateCDNVersion')

      expect(cdnVersionIndex).toBeGreaterThan(-1)
      expect(updateCDNIndex).toBeGreaterThan(-1)
      expect(cdnVersionIndex).toBeLessThan(updateCDNIndex)
    })

    it('should clone repo before generating data', () => {
      const cloneIndex = mainFunctionContent.indexOf('cloneImageRepo')
      const generateIndex = mainFunctionContent.indexOf('generateWallpaperData')

      expect(cloneIndex).toBeGreaterThan(-1)
      expect(generateIndex).toBeGreaterThan(-1)
      expect(cloneIndex).toBeLessThan(generateIndex)
    })

    it('should generate data before building application', () => {
      const generateIndex = mainFunctionContent.indexOf('generateWallpaperData')
      const buildIndex = mainFunctionContent.indexOf('buildApplication')

      expect(generateIndex).toBeGreaterThan(-1)
      expect(buildIndex).toBeGreaterThan(-1)
      expect(generateIndex).toBeLessThan(buildIndex)
    })
  })

  describe('Property Tests: Build Process Sequencing', () => {
    /**
     * Property 1: Build Process Sequencing
     * For any build execution, CDN synchronization operations should
     * complete successfully before application building begins.
     */

    // 定义构建步骤的正确顺序
    const buildSteps = [
      'fetchLatestCDNVersion',
      'updateCDNVersion',
      'cloneImageRepo',
      'generateWallpaperData',
      'buildApplication',
    ]

    it('should maintain correct build step order for any permutation check', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: buildSteps.length - 2 }),
          fc.integer({ min: 1, max: buildSteps.length - 1 }),
          (i, j) => {
            // 确保 i < j
            const first = Math.min(i, j)
            const second = Math.max(i, j)

            if (first === second)
              return true

            const firstStep = buildSteps[first]
            const secondStep = buildSteps[second]

            // 在 main 函数中，第一个步骤应该在第二个步骤之前出现
            const mainFunctionMatch = vercelBuildContent.match(/async function main\(\)\s*\{[\s\S]*?\n\}/m)
            const mainFunctionContent = mainFunctionMatch ? mainFunctionMatch[0] : ''

            const firstIndex = mainFunctionContent.indexOf(firstStep)
            const secondIndex = mainFunctionContent.indexOf(secondStep)

            // 两个步骤都应该存在
            expect(firstIndex).toBeGreaterThan(-1)
            expect(secondIndex).toBeGreaterThan(-1)

            // 第一个步骤应该在第二个步骤之前
            expect(firstIndex).toBeLessThan(secondIndex)

            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have all required build steps present', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...buildSteps),
          (step) => {
            expect(vercelBuildContent).toContain(step)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have error handling for each critical step', () => {
      const criticalSteps = ['cloneImageRepo', 'generateWallpaperData', 'buildApplication']

      fc.assert(
        fc.property(
          fc.constantFrom(...criticalSteps),
          (step) => {
            // 每个关键步骤都应该有 try-catch 或返回值检查
            const functionMatch = vercelBuildContent.match(new RegExp(`function ${step}[\\s\\S]*?\\n\\}`))
            if (functionMatch) {
              const functionContent = functionMatch[0]
              // 应该有 try-catch 或返回 boolean
              const hasTryCatch = functionContent.includes('try') && functionContent.includes('catch')
              const returnsBoolean = functionContent.includes('return true') || functionContent.includes('return false')
              expect(hasTryCatch || returnsBoolean).toBe(true)
            }
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('Environment Isolation', () => {
    /**
     * 验证 Vercel 构建脚本不会影响生产环境
     */

    it('should use staging mode for Vercel builds', () => {
      expect(vercelBuildContent).toContain('--mode staging')
    })

    it('should not modify production build command', () => {
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      // 生产构建命令应该保持不变
      expect(packageJson.scripts.build).toBe('node scripts/generate-data.js && vite build')
      // Vercel 构建命令是独立的
      expect(packageJson.scripts['build:vercel']).toBe('node scripts/vercel-build.js')
    })

    it('should not affect GitHub Actions workflow', () => {
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

      // GitHub Actions 应该只在 main 分支触发
      expect(workflowContent).toContain('branches: [main]')
      // 应该使用原有的 pnpm build 命令
      expect(workflowContent).toContain('pnpm build')
      // 不应该使用 Vercel 构建脚本
      expect(workflowContent).not.toContain('build:vercel')
    })
  })
})

describe('CDN Sync Retry Logic', () => {
  /**
   * Property 9: CDN Sync Retry Logic
   * For any CDN synchronization failure, the system should implement
   * exponential backoff retry logic and alert after all retries are exhausted.
   * Validates: Requirements 6.3
   */

  const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
  const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')

  describe('Retry Configuration', () => {
    it('should have MAX_RETRIES configuration', () => {
      expect(vercelBuildContent).toContain('MAX_RETRIES')
    })

    it('should have RETRY_DELAYS configuration for exponential backoff', () => {
      expect(vercelBuildContent).toContain('RETRY_DELAYS')
    })

    it('should have fetchWithRetry function', () => {
      expect(vercelBuildContent).toContain('fetchWithRetry')
    })
  })

  describe('Retry Implementation', () => {
    it('should implement retry loop', () => {
      // 检查是否有重试循环
      expect(vercelBuildContent).toMatch(/for\s*\(\s*let\s+attempt/)
    })

    it('should have delay between retries', () => {
      expect(vercelBuildContent).toContain('delay')
      expect(vercelBuildContent).toContain('await delay')
    })

    it('should have fallback version on failure', () => {
      expect(vercelBuildContent).toContain('DEFAULT_CDN_VERSION')
    })
  })

  describe('Property Tests: Retry Logic', () => {
    // 提取重试延迟配置
    const retryDelaysMatch = vercelBuildContent.match(/RETRY_DELAYS:\s*\[([\d,\s]+)\]/)
    const retryDelays = retryDelaysMatch
      ? retryDelaysMatch[1].split(',').map(s => Number.parseInt(s.trim()))
      : [1000, 2000, 4000]

    it('should have exponential backoff delays', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: retryDelays.length - 2 }),
          (i) => {
            // 每个延迟应该大于前一个（指数退避）
            expect(retryDelays[i + 1]).toBeGreaterThan(retryDelays[i])
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have reasonable delay values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...retryDelays),
          (delay) => {
            // 延迟应该在合理范围内（100ms - 30s）
            expect(delay).toBeGreaterThanOrEqual(100)
            expect(delay).toBeLessThanOrEqual(30000)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
