import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for CodeSM
 *
 * ─── Environments ─────────────────────────────────────────────────────────────
 *
 *  1. Docker (recommended for teams)
 *     docker compose -f docker-compose.e2e.yml up --build
 *     – Uses the official mcr.microsoft.com/playwright image (Ubuntu 22.04)
 *     – All browsers pre-installed; no OS compatibility issues
 *     – PLAYWRIGHT_BASE_URL env var is set to http://frontend:5173 by compose
 *
 *  2. Local dev (Ubuntu 26.04)
 *     npm test  (or npm run test:chrome)
 *     – Playwright's bundled browsers don't support Ubuntu 26.04 yet
 *     – Falls back to system-installed Google Chrome via channel:'chrome'
 *     – webServer auto-starts the Vite dev server
 *
 *  3. CI / GitHub Actions
 *     Uses the Docker path (docker compose -f docker-compose.e2e.yml ...)
 *     No manual browser install step needed.
 *
 * ─── Detection logic ──────────────────────────────────────────────────────────
 *  PLAYWRIGHT_BASE_URL is set  →  Docker mode  (bundled Chromium + Firefox)
 *  CI=true only                →  CI mode       (bundled Chromium)
 *  neither                     →  Local mode    (system Chrome via channel)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// When running inside Docker, the frontend is a separate container.
const isDocker = !!process.env.PLAYWRIGHT_BASE_URL;
const isCI     = !!process.env.CI;

// Base URL: Docker container hostname | localhost for local dev
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: !isDocker && !isCI,
  forbidOnly: isCI,
  retries: isCI || isDocker ? 2 : 1,
  workers: isDocker || isCI ? 1 : 2,
  timeout: 30_000,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Video requires ffmpeg. Available inside the Playwright Docker image,
    // but not on Ubuntu 26.04 host. Keep off to avoid failures on both paths.
    video: 'off',
    headless: true,
  },

  /* ------------------------------------------------------------------ */
  /* Projects                                                             */
  /* ------------------------------------------------------------------ */
  projects: isDocker || isCI

    // ── Docker / CI: use the Playwright image's pre-installed Chromium ──────
    // Note: Firefox has React hydration issues in headless Docker on this
    // image version. Chromium covers ~70% of global browser market and passes
    // all 37 tests reliably. Firefox can be added as an optional project once
    // the headless rendering issue is investigated.
    ? [
        {
          name: 'Chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        // To enable Firefox in Docker: uncomment + fix headless rendering
        // { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
      ]

    // ── Local (Ubuntu 26.04): system Chrome only ────────────────────────────
    // Playwright's bundled Chromium doesn't support Ubuntu 26.04 yet.
    // Firefox is a snap package and cannot be driven by Playwright.
    : [
        {
          name: 'Google Chrome',
          use: {
            ...devices['Desktop Chrome'],
            // channel:'chrome' resolves to /usr/bin/google-chrome
            channel: 'chrome',
          },
        },
      ],

  /* ------------------------------------------------------------------ */
  /* webServer – only for local dev (Docker handles its own frontend)    */
  /* ------------------------------------------------------------------ */
  ...(!isDocker && {
    webServer: {
      command: 'npm run dev',
      cwd: './Frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
  }),
});
