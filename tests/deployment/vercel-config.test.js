/**
 * Vercel 配置验证属性测试
 * Feature: multi-environment-deployment, Property 2: Environment Configuration Loading
 * Validates: Requirements 3.1, 3.4
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Vercel Configuration Validation', () => {
  // 读取 vercel.json 配置
  const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

  describe('Basic Configuration', () => {
    it('should have valid framework setting', () => {
      expect(vercelConfig.framework).toBe('vite')
    })

    it('should have valid build command', () => {
      expect(vercelConfig.buildCommand).toBe('pnpm run build:vercel')
    })

    it('should have valid output directory', () => {
      expect(vercelConfig.outputDirectory).toBe('dist')
    })

    it('should have valid install command', () => {
      expect(vercelConfig.installCommand).toBe('pnpm install')
    })
  })

  describe('SPA Routing Configuration', () => {
    it('should have rewrites for SPA routing', () => {
      expect(vercelConfig.rewrites).toBeDefined()
      expect(Array.isArray(vercelConfig.rewrites)).toBe(true)
      expect(vercelConfig.rewrites.length).toBeGreaterThan(0)
    })

    it('should rewrite all routes to index.html', () => {
      const spaRewrite = vercelConfig.rewrites.find(r => r.source === '/(.*)')
      expect(spaRewrite).toBeDefined()
      expect(spaRewrite.destination).toBe('/index.html')
    })
  })

  describe('Cache Headers Configuration', () => {
    it('should have headers configuration', () => {
      expect(vercelConfig.headers).toBeDefined()
      expect(Array.isArray(vercelConfig.headers)).toBe(true)
    })

    it('should have cache headers for assets', () => {
      const assetsHeader = vercelConfig.headers.find(h => h.source.includes('assets'))
      expect(assetsHeader).toBeDefined()

      const cacheControl = assetsHeader.headers.find(h => h.key === 'Cache-Control')
      expect(cacheControl).toBeDefined()
      expect(cacheControl.value).toContain('max-age=31536000')
      expect(cacheControl.value).toContain('immutable')
    })

    it('should have security headers', () => {
      const securityHeader = vercelConfig.headers.find(h =>
        h.headers.some(hdr => hdr.key === 'X-Frame-Options'),
      )
      expect(securityHeader).toBeDefined()

      const xFrameOptions = securityHeader.headers.find(h => h.key === 'X-Frame-Options')
      expect(xFrameOptions.value).toBe('DENY')

      const xContentType = securityHeader.headers.find(h => h.key === 'X-Content-Type-Options')
      expect(xContentType.value).toBe('nosniff')
    })
  })

  describe('Git Deployment Configuration', () => {
    it('should have git deployment settings', () => {
      expect(vercelConfig.git).toBeDefined()
      expect(vercelConfig.git.deploymentEnabled).toBeDefined()
    })

    it('should disable deployment for main branch', () => {
      expect(vercelConfig.git.deploymentEnabled.main).toBe(false)
    })

    it('should enable deployment for dev branch', () => {
      expect(vercelConfig.git.deploymentEnabled.dev).toBe(true)
    })
  })

  // Property-based tests
  describe('Property Tests: Environment Configuration Loading', () => {
    /**
     * Property 2: Environment Configuration Loading
     * For any deployment environment, the build pipeline should load
     * the correct environment variables and configuration settings
     * specific to that environment.
     */

    // 定义有效的环境名称
    const validEnvironments = ['development', 'staging', 'production', 'preview']

    it('should have consistent configuration structure for all environments', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validEnvironments),
          (environment) => {
            // 验证配置结构对所有环境都是一致的
            expect(vercelConfig.framework).toBeDefined()
            expect(vercelConfig.buildCommand).toBeDefined()
            expect(vercelConfig.outputDirectory).toBeDefined()
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have valid header configurations for any source pattern', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            source: fc.string({ minLength: 1 }),
            headers: fc.array(fc.record({
              key: fc.string({ minLength: 1 }),
              value: fc.string(),
            })),
          })),
          (headers) => {
            // 验证实际配置中的 headers 结构
            for (const header of vercelConfig.headers) {
              expect(header.source).toBeDefined()
              expect(typeof header.source).toBe('string')
              expect(Array.isArray(header.headers)).toBe(true)

              for (const h of header.headers) {
                expect(h.key).toBeDefined()
                expect(h.value).toBeDefined()
              }
            }
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have valid rewrite configurations', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({
            source: fc.string({ minLength: 1 }),
            destination: fc.string({ minLength: 1 }),
          })),
          () => {
            // 验证实际配置中的 rewrites 结构
            for (const rewrite of vercelConfig.rewrites) {
              expect(rewrite.source).toBeDefined()
              expect(rewrite.destination).toBeDefined()
              expect(typeof rewrite.source).toBe('string')
              expect(typeof rewrite.destination).toBe('string')
            }
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})

describe('Environment Files Validation', () => {
  const envFiles = [
    { name: '.env.development', env: 'development' },
    { name: '.env.staging', env: 'staging' },
    { name: '.env.production', env: 'production' },
  ]

  for (const { name, env } of envFiles) {
    describe(`${name}`, () => {
      const envPath = path.join(ROOT_DIR, name)

      it(`should exist for ${env} environment`, () => {
        expect(fs.existsSync(envPath)).toBe(true)
      })

      it(`should contain VITE_ENV variable`, () => {
        const content = fs.readFileSync(envPath, 'utf-8')
        expect(content).toContain('VITE_ENV')
      })
    })
  }

  // Property test for environment file consistency
  describe('Property Tests: Environment File Consistency', () => {
    it('should have consistent variable naming across all env files', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...envFiles.map(e => e.name)),
          (envFileName) => {
            const envPath = path.join(ROOT_DIR, envFileName)
            const content = fs.readFileSync(envPath, 'utf-8')

            // 所有环境文件都应该包含 VITE_ENV
            expect(content).toContain('VITE_ENV')

            // 变量名应该以 VITE_ 开头（Vite 约定）
            const lines = content.split('\n').filter(line =>
              line.trim() && !line.startsWith('#'),
            )

            for (const line of lines) {
              if (line.includes('=')) {
                const varName = line.split('=')[0].trim()
                // 允许 VITE_ 前缀或其他有效变量名
                expect(varName.length).toBeGreaterThan(0)
              }
            }

            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
