import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for CodeSM
 *
 * ─── Ubuntu 26.04 browser compatibility ──────────────────────────────────────
 *
 * Playwright's bundled browsers do NOT support Ubuntu 26.04.
 * We use the SYSTEM-INSTALLED Google Chrome via `channel: 'chrome'`.
 *
 * Firefox is installed as a SNAP package on this machine (/usr/bin/firefox is
 * a shell wrapper, not a real binary). Snap-confined Firefox cannot be
 * controlled by Playwright's remote debugging protocol and hangs indefinitely.
 * Firefox is therefore excluded from the test matrix on this machine.
 *
 * To re-enable Firefox on a machine with a native (non-snap) Firefox build:
 *   1. Install Firefox via: sudo apt install -y firefox (non-snap PPA)
 *   2. Uncomment the Firefox project block below.
 *
 * ─── Running tests ───────────────────────────────────────────────────────────
 *   npm test              – run all tests (Chrome)
 *   npm run test:headed   – run headed (visible browser window)
 *   npm run test:report   – open last HTML report
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  timeout: 30_000,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // video disabled – ffmpeg not supported on Ubuntu 26.04 with Playwright 1.x
    video: 'off',
    headless: true,
  },

  /* ------------------------------------------------------------------ */
  /* Projects                                                             */
  /* ------------------------------------------------------------------ */
  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        // channel:'chrome' resolves to the system Google Chrome binary
        // (/usr/bin/google-chrome) – avoids Playwright's cached Chromium
        // which doesn't exist on Ubuntu 26.04.
        channel: 'chrome',
      },
    },

    // Firefox is a snap on this machine and cannot be driven by Playwright.
    // Uncomment this block if you install a native Firefox (non-snap):
    //
    // {
    //   name: 'Firefox',
    //   use: {
    //     browserName: 'firefox',
    //     headless: true,
    //     viewport: { width: 1280, height: 720 },
    //     launchOptions: { executablePath: '/path/to/native/firefox' },
    //   },
    // },
  ],

  /* ------------------------------------------------------------------ */
  /* Auto-start the Vite dev server before running tests                 */
  /* ------------------------------------------------------------------ */
  webServer: {
    command: 'npm run dev',
    cwd: './Frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
