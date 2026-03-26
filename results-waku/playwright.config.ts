import { defineConfig, devices } from '@playwright/test'

const localBaseUrl = process.env.LOCAL_BASE_URL || 'http://localhost:4400'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: {
    timeout: 15_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'output/playwright/report', open: 'never' }],
  ],
  outputDir: 'output/playwright/test-results',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm run dev',
    url: localBaseUrl,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
