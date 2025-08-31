import { describe, it, expect } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

describe('Storybook Integration Tests', () => {
  describe('Build Tests', () => {
    it('should build Storybook without errors', async () => {
      const buildOutput = path.join(process.cwd(), 'storybook-static')
      
      // Clean previous build
      if (fs.existsSync(buildOutput)) {
        fs.rmSync(buildOutput, { recursive: true, force: true })
      }

      // Run build (disable telemetry to avoid interactive prompt)
      await execAsync('STORYBOOK_DISABLE_TELEMETRY=1 npm run build')
      
      // Check build completed
      expect(fs.existsSync(buildOutput)).toBe(true)
      expect(fs.existsSync(path.join(buildOutput, 'index.html'))).toBe(true)
      
      // Check for critical files/directories produced by Vite builder
      const critical = ['index.html', 'iframe.html', 'assets']
      const builtEntries = fs.readdirSync(buildOutput)
      for (const entry of critical) {
        const exists = builtEntries.some(f => f.includes(entry))
        expect(exists).toBe(true)
      }
    }, 120000) // 120 second timeout for build

    it('should include all story categories in build', async () => {
      const buildOutput = path.join(process.cwd(), 'storybook-static')
      const assetsDir = path.join(buildOutput, 'assets')
      expect(fs.existsSync(assetsDir)).toBe(true)
      const assets = fs.readdirSync(assetsDir)

      // Check that key story chunks are present (indicates categories made it into the build)
      const expectedStoryChunks = [
        'EpicManagerImproved.stories',
        'NetworkPlayground.stories',
        'StatusDashboard.stories',
        'Playground.stories',
      ]

      for (const chunk of expectedStoryChunks) {
        const found = assets.some(a => a.includes(chunk))
        expect(found).toBe(true)
      }
    })
  })

  describe('Configuration Tests', () => {
    it('should have valid main.ts configuration', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mainConfig = require('../../.storybook/main.ts').default
      
      // Check required fields
      expect(mainConfig).toHaveProperty('stories')
      expect(mainConfig).toHaveProperty('addons')
      expect(mainConfig).toHaveProperty('framework')
      
      // Check framework configuration
      expect(mainConfig.framework.name).toBe('@storybook/react-vite')
      
      // Check addons
      expect(mainConfig.addons).toContain('@storybook/addon-essentials')
      expect(mainConfig.addons).toContain('msw-storybook-addon')
    })

    it('should have valid preview.ts configuration', () => {
      const previewPath = path.join(process.cwd(), '.storybook/preview.tsx')
      const previewContent = fs.readFileSync(previewPath, 'utf-8')
      
      // Check MSW initialization
      expect(previewContent).toContain('initialize')
      expect(previewContent).toContain('mswDecorator')
      
      // Check global types for toolbar
      expect(previewContent).toContain('mswLatencyMs')
      expect(previewContent).toContain('mswErrorRate')
      expect(previewContent).toContain('mswStatus')

      // Check MswInfo overlay wiring
      expect(previewContent).toContain('MswInfoOverlay')
    })
  })

  describe('Story Files Tests', () => {
    it('should have all required story files', () => {
      const storyFiles = [
        'src/stories/Epics/EpicManagerImproved.stories.tsx',
        'src/stories/API/Playground.stories.tsx',
        'src/stories/Dev/NetworkPlayground.stories.tsx',
        'src/stories/Status/StatusDashboard.stories.tsx',
        'src/stories/Docs/DevLog.stories.tsx'
      ]
      
      for (const file of storyFiles) {
        const filePath = path.join(process.cwd(), file)
        expect(fs.existsSync(filePath)).toBe(true)
      }
    })

    it('should have proper story exports', async () => {
      const epicStory: any = await import('../../src/stories/Epics/EpicManagerImproved.stories')
      
      // Check default export (meta)
      expect(epicStory.default).toBeDefined()
      expect(epicStory.default.title).toBeDefined()
      expect(epicStory.default.component).toBeDefined()
      
      // Check story exports
      expect(epicStory.Default).toBeDefined()
    })
  })

  describe('MSW Configuration Tests', () => {
    it('should have MSW handlers configured', async () => {
      const handlers = await import('../../src/mocks/handlers')
      
      expect(handlers.handlers).toBeDefined()
      expect(Array.isArray(handlers.handlers)).toBe(true)
      expect(handlers.handlers.length).toBeGreaterThan(0)
    })
  })
})

describe('Code Quality Checks', () => {
  describe('TypeScript Quality', () => {
    it('should compile without errors', async () => {
      const { stderr } = await execAsync('npx tsc --noEmit')
      expect((stderr ?? '').toString()).toBe('')
    }, 30000)
  })

  describe('Import Structure', () => {
    it('should not have circular dependencies in stories', () => {
      // This is a simplified check - for real projects use madge or similar
      const storyDir = path.join(process.cwd(), 'src/stories')
      const files = fs.readdirSync(storyDir, { recursive: true })
        .filter(f => f.toString().endsWith('.tsx'))
      
      // Basic check: stories shouldn't import other stories
      for (const file of files) {
        if (file.toString().includes('.stories.tsx')) {
          const content = fs.readFileSync(path.join(storyDir, file.toString()), 'utf-8')
          expect(content).not.toMatch(/from\s+['"].*\.stories/)
        }
      }
    })
  })

  describe('Component Quality', () => {
    it('should have consistent component structure', () => {
      const components = [
        'src/stories/Epics/EpicManager.tsx',
        'src/stories/API/ApiPlayground.tsx',
        'src/stories/Dev/NetworkPlayground.tsx'
      ]
      
      for (const comp of components) {
        const content = fs.readFileSync(path.join(process.cwd(), comp), 'utf-8')
        
        // Check for React import
        expect(content).toMatch(/import\s+.*React/)
        
        // Check for proper export
        expect(content).toMatch(/export\s+default/)
        
        // Check for TypeScript types (at least FC or function with types)
        expect(content).toMatch(/:\s*(React\.)?FC|function\s+\w+\s*\(/)
      }
    })
  })
})
