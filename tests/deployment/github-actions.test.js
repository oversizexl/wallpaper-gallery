/**
 * GitHub Actions 协调测试
 * Feature: multi-environment-deployment
 * Validates: Requirements 2.1, 3.3
 *
 * 验证 GitHub Actions 工作流与 Vercel 部署的协调
 * 确保生产环境（main 分支）不受影响
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('GitHub Actions Workflow Configuration', () => {
  const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
  const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

  describe('Trigger Configuration', () => {
    it('should trigger on push to main branch only', () => {
      expect(workflowContent).toContain('push:')
      expect(workflowContent).toContain('branches: [main]')
    })

    it('should have scheduled trigger for daily updates', () => {
      expect(workflowContent).toContain('schedule:')
      expect(workflowContent).toContain('cron:')
    })

    it('should support manual trigger', () => {
      expect(workflowContent).toContain('workflow_dispatch')
    })

    it('should NOT trigger on dev branch', () => {
      // 确保 dev 分支不会触发 GitHub Pages 部署
      expect(workflowContent).not.toContain('branches: [dev]')
      expect(workflowContent).not.toContain('branches: [main, dev]')
    })
  })

  describe('Build Configuration', () => {
    it('should use pnpm for package management', () => {
      expect(workflowContent).toContain('pnpm')
    })

    it('should use Node.js 20', () => {
      expect(workflowContent).toContain("node-version: '20'")
    })

    it('should install ImageMagick for image dimensions', () => {
      expect(workflowContent).toContain('imagemagick')
    })

    it('should use standard build command (not Vercel build)', () => {
      expect(workflowContent).toContain('pnpm build')
      expect(workflowContent).not.toContain('build:vercel')
    })
  })

  describe('CDN Version Synchronization', () => {
    it('should fetch CDN version from GitHub API', () => {
      expect(workflowContent).toContain('api.github.com')
      expect(workflowContent).toContain('nuanXinProPic/tags')
    })

    it('should update CDN version in constants.js', () => {
      expect(workflowContent).toContain('CDN_VERSION')
      expect(workflowContent).toContain('constants.js')
    })

    it('should have fallback CDN version', () => {
      expect(workflowContent).toContain('v1.0.4')
    })

    it('should checkout nuanXinProPic repository', () => {
      expect(workflowContent).toContain('IT-NuanxinPro/nuanXinProPic')
    })
  })

  describe('Deployment Configuration', () => {
    it('should deploy to GitHub Pages', () => {
      expect(workflowContent).toContain('github-pages')
      expect(workflowContent).toContain('deploy-pages')
    })

    it('should have proper permissions', () => {
      expect(workflowContent).toContain('permissions:')
      expect(workflowContent).toContain('pages: write')
    })

    it('should have concurrency control', () => {
      expect(workflowContent).toContain('concurrency:')
      expect(workflowContent).toContain('cancel-in-progress')
    })
  })
})

describe('Environment Isolation', () => {
  describe('Production vs Testing Environment', () => {
    it('should have separate deployment targets', () => {
      // GitHub Actions -> GitHub Pages (production)
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')
      expect(workflowContent).toContain('github-pages')

      // Vercel -> Vercel (testing)
      const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json')
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))
      expect(vercelConfig.git.deploymentEnabled.dev).toBe(true)
      expect(vercelConfig.git.deploymentEnabled.main).toBe(false)
    })

    it('should use different build modes', () => {
      // GitHub Actions uses production mode (default)
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')
      expect(workflowContent).toContain('pnpm build')
      expect(workflowContent).not.toContain('--mode staging')

      // Vercel uses staging mode
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')
      expect(vercelBuildContent).toContain('--mode staging')
    })
  })

  describe('Property Tests: Environment Isolation', () => {
    const productionIndicators = [
      { file: '.github/workflows/deploy.yml', pattern: 'branches: [main]' },
      { file: '.github/workflows/deploy.yml', pattern: 'github-pages' },
      { file: '.github/workflows/deploy.yml', pattern: 'pnpm build' },
    ]

    const testingIndicators = [
      { file: 'vercel.json', pattern: '"dev": true' },
      { file: 'vercel.json', pattern: '"main": false' },
      { file: 'scripts/vercel-build.js', pattern: '--mode staging' },
    ]

    it('should have all production environment indicators', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...productionIndicators),
          (indicator) => {
            const filePath = path.join(ROOT_DIR, indicator.file)
            const content = fs.readFileSync(filePath, 'utf-8')
            expect(content).toContain(indicator.pattern)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have all testing environment indicators', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...testingIndicators),
          (indicator) => {
            const filePath = path.join(ROOT_DIR, indicator.file)
            const content = fs.readFileSync(filePath, 'utf-8')
            expect(content).toContain(indicator.pattern)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})

describe('CDN Version Consistency', () => {
  describe('Version Update Mechanism', () => {
    it('should have same CDN version update logic in both environments', () => {
      // GitHub Actions
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

      // Vercel build script
      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')

      // Both should fetch from same API
      expect(workflowContent).toContain('api.github.com')
      expect(vercelBuildContent).toContain('api.github.com')

      // Both should update constants.js
      expect(workflowContent).toContain('constants.js')
      expect(vercelBuildContent).toContain('constants.js')
    })

    it('should use same CDN repository', () => {
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml')
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8')

      const vercelBuildPath = path.join(ROOT_DIR, 'scripts/vercel-build.js')
      const vercelBuildContent = fs.readFileSync(vercelBuildPath, 'utf-8')

      const constantsPath = path.join(ROOT_DIR, 'src/utils/constants.js')
      const constantsContent = fs.readFileSync(constantsPath, 'utf-8')

      // All should reference same repository
      expect(workflowContent).toContain('nuanXinProPic')
      expect(vercelBuildContent).toContain('nuanXinProPic')
      expect(constantsContent).toContain('nuanXinProPic')
    })
  })

  describe('Property Tests: CDN Consistency', () => {
    const cdnReferences = [
      '.github/workflows/deploy.yml',
      'scripts/vercel-build.js',
      'src/utils/constants.js',
    ]

    it('should reference same CDN repository in all files', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...cdnReferences),
          (filePath) => {
            const fullPath = path.join(ROOT_DIR, filePath)
            const content = fs.readFileSync(fullPath, 'utf-8')
            expect(content).toContain('nuanXinProPic')
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
