import { defineConfig, devices } from '@playwright/test'

// Real FastAPI server + real production build + published route and Edge-TTS audio.
// Requires `npm run build` and a published demo route (see docs/PROTOTYPE_RUNBOOK.md).
export default defineConfig({
  testDir: './e2e-real', timeout: 90_000, expect: { timeout: 15_000 },
  fullyParallel: false, workers: 1, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8000', trace: 'retain-on-failure' },
  webServer: {
    command: 'uv run uvicorn navigation.main:app --host 127.0.0.1 --port 8000 --no-proxy-headers --no-access-log',
    cwd: '../server', url: 'http://127.0.0.1:8000/health', reuseExistingServer: true, timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' } },
  ],
})
