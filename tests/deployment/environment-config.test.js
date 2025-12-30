/**
 * 环境配置管理属性测试
 * Feature: multi-environment-deployment
 * Property 3: Environment Indicator Display
 * Property 4: CDN Version Management
 * Validates: Requirements 3.2, 3.3, 3.4
 *
 * 注意：这些测试验证环境配置的正确性，不会影响生产环境
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Environment Configuration Management', () => {
  const envFiles = {
    development: path.join(ROOT_DIR, '.env.development'),
    staging: path.join(ROOT_DIR, '.env.staging'),
    production: path.join(ROOT_DIR, '.env.production'),
  }

  describe('Environment Files Existence', () => {
    it('should have all required environment files', () => {
      for (const [env, filePath] of Object.entries(envFiles)) {
        expect(fs.existsSync(filePath), `Missing ${env} env file`).toBe(true)
      }
    })
  })

  describe('Environment Variables Consistency', () => {
    const requiredVars = ['VITE_ENV', 'VITE_SHOW_ENV_BADGE']

    it('should have all required variables in each env file', () => {
      for (const [env, filePath] of Object.entries(envFiles)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        for (const varName of requiredVars) {
          expect(content, `${env} missing ${varName}`).toContain(varName)
        }
      }
    })

    it('should have correct VITE_ENV value for each environment', () => {
      for (const [env, filePath] of Object.entries(envFiles)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        expect(content).toContain(`VITE_ENV=${env}`)
      }
    })
  })

  describe('Property Tests: Environment Indicator Display', () => {
    /**
     * Property 3: Environment Indicator Display
     * For any non-production environment, the application should display
     * appropriate environment indicators to distinguish it from production.
     */

    const envBadgePath = path.join(ROOT_DIR, 'src/components/common/EnvBadge.vue')
    const envBadgeContent = fs.readFileSync(envBadgePath, 'utf-8')

    it('should show badge for non-production environments', () => {
      const nonProdEnvs = ['development', 'staging', 'preview']

      fc.assert(
        fc.property(
          fc.constantFrom(...nonProdEnvs),
          (env) => {
            // EnvBadge 组件应该为非生产环境定义配置
            expect(envBadgeContent).toContain(`case '${env}'`)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should not show badge for production environment', () => {
      // 生产环境不应该显示标识
      const prodEnvContent = fs.readFileSync(envFiles.production, 'utf-8')
      expect(prodEnvContent).toContain('VITE_SHOW_ENV_BADGE=false')

      // EnvBadge 组件应该在生产环境返回 null
      expect(envBadgeContent).toContain('default:')
      expect(envBadgeContent).toContain('return null')
    })

    it('should have distinct colors for each environment', () => {
      const envColors = {
        staging: '#f59e0b',
        preview: '#8b5cf6',
        development: '#10b981',
      }

      fc.assert(
        fc.property(
          fc.constantFrom(...Object.entries(envColors)),
          ([env, color]) => {
            expect(envBadgeContent).toContain(color)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have descriptive labels for each environment', () => {
      const envLabels = {
        staging: '测试环境',
        preview: 'PR 预览',
        development: '开发环境',
      }

      fc.assert(
        fc.property(
          fc.constantFrom(...Object.entries(envLabels)),
          ([env, label]) => {
            expect(envBadgeContent).toContain(label)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('Property Tests: CDN Version Management', () => {
    /**
     * Property 4: CDN Version Management
     * For any environment deployment, the CDN version should be correctly
     * set and consistent throughout the build process.
     */

    const constantsPath = path.join(ROOT_DIR, 'src/utils/constants.js')
    const constantsContent = fs.readFileSync(constantsPath, 'utf-8')

    it('should have CDN_VERSION defined', () => {
      expect(constantsContent).toContain('export const CDN_VERSION')
    })

    it('should have valid CDN version format', () => {
      const versionMatch = constantsContent.match(/CDN_VERSION = '([^']+)'/)
      expect(versionMatch).not.toBeNull()

      const version = versionMatch[1]
      // 版本号应该以 v 开头，后跟数字
      expect(version).toMatch(/^v\d+\.\d+\.\d+$/)
    })

    it('should use CDN_VERSION in URL construction', () => {
      expect(constantsContent).toContain('${CDN_VERSION}')
    })

    it('should have CDN base URL properly constructed', () => {
      expect(constantsContent).toContain('cdn.jsdelivr.net')
      expect(constantsContent).toContain('nuanXinProPic')
    })
  })

  describe('Environment-Specific Settings', () => {
    /**
     * Validates: Requirements 3.4
     * Different analytics, error tracking, and debugging settings per environment
     */

    it('should have different Umami IDs for production vs non-production', () => {
      const prodContent = fs.readFileSync(envFiles.production, 'utf-8')
      const stagingContent = fs.readFileSync(envFiles.staging, 'utf-8')

      const prodUmamiMatch = prodContent.match(/VITE_UMAMI_WEBSITE_ID=([^\n]+)/)
      const stagingUmamiMatch = stagingContent.match(/VITE_UMAMI_WEBSITE_ID=([^\n]+)/)

      expect(prodUmamiMatch).not.toBeNull()
      expect(stagingUmamiMatch).not.toBeNull()

      // 生产环境和测试环境应该使用不同的 Umami ID
      expect(prodUmamiMatch[1]).not.toBe(stagingUmamiMatch[1])
    })

    it('should have Supabase config only in production', () => {
      const prodContent = fs.readFileSync(envFiles.production, 'utf-8')
      const stagingContent = fs.readFileSync(envFiles.staging, 'utf-8')
      const devContent = fs.readFileSync(envFiles.development, 'utf-8')

      // 生产环境应该有 Supabase 配置
      expect(prodContent).toContain('VITE_SUPABASE_URL')
      expect(prodContent).toContain('VITE_SUPABASE_ANON_KEY')

      // 测试和开发环境不应该有 Supabase 配置
      expect(stagingContent).not.toContain('VITE_SUPABASE_URL')
      expect(devContent).not.toContain('VITE_SUPABASE_URL')
    })
  })

  describe('Build Configuration Isolation', () => {
    /**
     * 验证构建配置不会影响生产环境
     */

    it('should have separate build commands for different environments', () => {
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      // 生产构建命令
      expect(packageJson.scripts.build).toBeDefined()
      // Vercel 构建命令
      expect(packageJson.scripts['build:vercel']).toBeDefined()
      // 两个命令应该不同
      expect(packageJson.scripts.build).not.toBe(packageJson.scripts['build:vercel'])
    })

    it('should use staging mode for Vercel builds', () => {
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')

      expect(vercelBuildContent).toContain('--mode staging')
    })

    it('should use production mode for GitHub Actions builds', () => {
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

      // GitHub Actions 使用默认的 pnpm build（生产模式）
      expect(workflowContent).toContain('pnpm build')
      // 不应该使用 staging 模式
      expect(workflowContent).not.toContain('--mode staging')
    })
  })
})

describe('Vercel Environment Variables', () => {
  /**
   * 验证 Vercel 配置中的环境变量设置
   */

  const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

  it('should have git deployment configuration', () => {
    expect(vercelConfig.git).toBeDefined()
    expect(vercelConfig.git.deploymentEnabled).toBeDefined()
  })

  it('should disable deployment for main branch (production)', () => {
    expect(vercelConfig.git.deploymentEnabled.main).toBe(false)
  })

  it('should enable deployment for dev branch (testing)', () => {
    expect(vercelConfig.git.deploymentEnabled.dev).toBe(true)
  })
})
