/**
 * 完整部署流程集成测试
 * Feature: multi-environment-deployment
 * Validates: Requirements 2.1, 2.2, 2.3
 *
 * 验证整个多环境部署系统的完整性和一致性
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Complete Deployment Pipeline Integration', () => {
  describe('All Required Files Exist', () => {
    const requiredFiles = [
      // Vercel 配置
      'vercel.json',
      'scripts/vercel-build.js',
      // GitHub Actions
      '.github/workflows/deploy.yml',
      // 环境配置
      '.env.development',
      '.env.staging',
      '.env.production',
      // 核心配置
      'package.json',
      'vite.config.js',
      'src/utils/constants.js',
      // 环境指示器
      'src/components/common/EnvBadge.vue',
    ]

    it('should have all required deployment files', () => {
      for (const file of requiredFiles) {
        const filePath = path.join(ROOT_DIR, file)
        expect(fs.existsSync(filePath), `Missing: ${file}`).toBe(true)
      }
    })
  })

  describe('Production Environment (GitHub Pages)', () => {
    it('should have complete production deployment configuration', () => {
      // GitHub Actions workflow
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

      expect(workflowContent).toContain('branches: [main]')
      expect(workflowContent).toContain('github-pages')
      expect(workflowContent).toContain('pnpm build')
    })

    it('should have production environment variables', () => {
      const envPath = path.join(ROOT_DIR, '.env.production')
      const envContent = fs.readFileSync(envPath, 'utf-8')

      expect(envContent).toContain('VITE_ENV=production')
      expect(envContent).toContain('VITE_SHOW_ENV_BADGE=false')
    })

    it('should NOT be affected by Vercel configuration', () => {
      const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

      // Vercel 不应该部署 main 分支
      expect(vercelConfig.git.deploymentEnabled.main).toBe(false)
    })
  })

  describe('Testing Environment (Vercel)', () => {
    it('should have complete Vercel deployment configuration', () => {
      const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

      expect(vercelConfig.framework).toBe('vite')
      expect(vercelConfig.buildCommand).toBe('pnpm run build:vercel')
      expect(vercelConfig.outputDirectory).toBe('dist')
      expect(vercelConfig.git.deploymentEnabled.dev).toBe(true)
    })

    it('should have staging environment variables', () => {
      const envPath = path.join(ROOT_DIR, '.env.staging')
      const envContent = fs.readFileSync(envPath, 'utf-8')

      expect(envContent).toContain('VITE_ENV=staging')
      expect(envContent).toContain('VITE_SHOW_ENV_BADGE=true')
    })

    it('should have Vercel build script', () => {
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')

      expect(vercelBuildContent).toContain('fetchLatestCDNVersion')
      expect(vercelBuildContent).toContain('generateWallpaperData')
      expect(vercelBuildContent).toContain('buildApplication')
      expect(vercelBuildContent).toContain('--mode staging')
    })
  })

  describe('Cross-Environment Consistency', () => {
    it('should use same CDN repository across all environments', () => {
      const files = [
        '.github/workflows/deploy.yml',
        'scripts/vercel-build.js',
        'src/utils/constants.js',
      ]

      for (const file of files) {
        const filePath = path.join(ROOT_DIR, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        expect(content, `${file} should reference nuanXinProPic`).toContain('nuanXinProPic')
      }
    })

    it('should use same data generation script', () => {
      // Production build
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      expect(packageJson.scripts.build).toContain('generate-data.js')

      // Vercel build
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')
      expect(vercelBuildContent).toContain('generate-data.js')
    })

    it('should have consistent output directory', () => {
      // Vite config
      const viteConfigPath = path.join(ROOT_DIR, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8')

      // Vercel config
      const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

      // GitHub Actions
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

      // All should use 'dist' as output
      expect(vercelConfig.outputDirectory).toBe('dist')
      expect(workflowContent).toContain('./dist')
    })
  })

  describe('Property Tests: Complete Integration', () => {
    const environments = ['development', 'staging', 'production']

    it('should have valid environment configuration for all environments', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...environments),
          (env) => {
            const envPath = path.join(ROOT_DIR, `.env.${env}`)
            expect(fs.existsSync(envPath)).toBe(true)

            const content = fs.readFileSync(envPath, 'utf-8')
            expect(content).toContain(`VITE_ENV=${env}`)
            expect(content).toContain('VITE_SHOW_ENV_BADGE')

            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have environment indicator for non-production environments', () => {
      const nonProdEnvs = ['development', 'staging']

      fc.assert(
        fc.property(
          fc.constantFrom(...nonProdEnvs),
          (env) => {
            const envPath = path.join(ROOT_DIR, `.env.${env}`)
            const content = fs.readFileSync(envPath, 'utf-8')
            expect(content).toContain('VITE_SHOW_ENV_BADGE=true')
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('No Netlify Configuration Remaining', () => {
    it('should not have netlify.toml file', () => {
      const netlifyPath = path.join(ROOT_DIR, 'netlify.toml')
      expect(fs.existsSync(netlifyPath)).toBe(false)
    })

    it('should not reference Netlify in documentation', () => {
      const readmePath = path.join(ROOT_DIR, 'README.md')
      const readmeContent = fs.readFileSync(readmePath, 'utf-8')

      // README 不应该单独提到 Netlify 作为部署选项
      expect(readmeContent).not.toContain('Netlify')
    })

    it('should reference Vercel in deployment guide', () => {
      const guidePath = path.join(ROOT_DIR, 'docs/部署指南.md')
      const guideContent = fs.readFileSync(guidePath, 'utf-8')

      expect(guideContent).toContain('Vercel')
      expect(guideContent).not.toContain('Netlify')
    })
  })
})

describe('Build Scripts Validation', () => {
  describe('Package.json Scripts', () => {
    const packageJsonPath = path.join(ROOT_DIR, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

    it('should have all required scripts', () => {
      const requiredScripts = ['dev', 'build', 'build:vercel', 'preview', 'generate', 'test']

      for (const script of requiredScripts) {
        expect(packageJson.scripts[script], `Missing script: ${script}`).toBeDefined()
      }
    })

    it('should have separate build commands for different environments', () => {
      expect(packageJson.scripts.build).not.toBe(packageJson.scripts['build:vercel'])
    })
  })

  describe('Test Configuration', () => {
    it('should have vitest configuration', () => {
      const vitestConfigPath = path.join(ROOT_DIR, 'vitest.config.js')
      expect(fs.existsSync(vitestConfigPath)).toBe(true)
    })

    it('should have test dependencies installed', () => {
      const packageJsonPath = path.join(ROOT_DIR, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      expect(packageJson.devDependencies.vitest).toBeDefined()
      expect(packageJson.devDependencies['fast-check']).toBeDefined()
    })
  })
})

describe('Security Configuration', () => {
  describe('Vercel Security Headers', () => {
    const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

    it('should have X-Frame-Options header', () => {
      const securityHeader = vercelConfig.headers.find(h =>
        h.headers.some(hdr => hdr.key === 'X-Frame-Options'),
      )
      expect(securityHeader).toBeDefined()
    })

    it('should have X-Content-Type-Options header', () => {
      const securityHeader = vercelConfig.headers.find(h =>
        h.headers.some(hdr => hdr.key === 'X-Content-Type-Options'),
      )
      expect(securityHeader).toBeDefined()
    })

    it('should have Referrer-Policy header', () => {
      const securityHeader = vercelConfig.headers.find(h =>
        h.headers.some(hdr => hdr.key === 'Referrer-Policy'),
      )
      expect(securityHeader).toBeDefined()
    })
  })
})
