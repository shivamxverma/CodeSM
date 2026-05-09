import { test, expect } from '@playwright/test';

/**
 * Smoke test – verifies the app serves a response and the root route renders.
 * This is the fastest possible sanity check that the dev server is alive.
 */

test('smoke: root route returns 200 and renders HTML', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
  // At minimum, React mounts something into #root
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 10_000 });
});

test('smoke: /problems route renders without crashing', async ({ page }) => {
  const response = await page.goto('/problems');
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 10_000 });
});

test('smoke: /login route renders without crashing', async ({ page }) => {
  const response = await page.goto('/login');
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 10_000 });
});
