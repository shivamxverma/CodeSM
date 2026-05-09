import { test, expect } from '@playwright/test';

/**
 * Navigation / Layout E2E Tests
 *
 * These tests check the global navigation bar (Navbar) that wraps all
 * Layout-level routes, plus route-level redirect behaviour.
 */

test.describe('Navigation bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the site brand / logo', async ({ page }) => {
    // The navbar typically contains the brand name or logo image
    const brand = page.locator('nav').getByText(/CodeSM/i).first()
      .or(page.locator('header').getByText(/CodeSM/i).first())
      .or(page.locator('[class*="brand"], [class*="logo"]').first());
    await expect(brand).toBeVisible({ timeout: 5_000 });
  });

  test('has a link to /problems', async ({ page }) => {
    const link = page.locator('nav').getByRole('link', { name: /problems/i }).first()
      .or(page.getByRole('link', { name: /problems/i }).first());
    await expect(link).toBeVisible();
  });

  test('"Problems" nav link works', async ({ page }) => {
    const link = page.getByRole('link', { name: /problems/i }).first();
    await link.click();
    await expect(page).toHaveURL(/\/problems/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route protection
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Route protection', () => {
  test('unauthenticated user visiting /dashboard is redirected to /login', async ({ page }) => {
    // Navigate to a valid page first so localStorage is accessible
    await page.goto('/');
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    // Now navigate to the protected route
    await page.goto('/dashboard');
    // ProtectedRoute should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test('unknown route redirects to /login', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
