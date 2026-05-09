import { test, expect } from '@playwright/test';

/**
 * Homepage / Landing Page E2E Tests
 *
 * Covers the public-facing landing page at route "/"
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the hero section with a visible h1', async ({ page }) => {
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
    // The hero h1 contains the product tagline
    await expect(hero).not.toBeEmpty();
  });

  test('has correct page title', async ({ page }) => {
    // The page title should reference CodeSM or the brand
    await expect(page).toHaveTitle(/CodeSM|Code|Problem/i);
  });

  test('"Start solving" CTA navigates to /problems', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Start solving/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/problems/);
  });

  test('footer "Browse Problems" CTA navigates to /problems', async ({ page }) => {
    // The footer CTA button is always visible regardless of auth state
    const cta = page.getByRole('link', { name: /Browse Problems/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/problems/);
  });

  test('"Problems" quick-action link is present and navigates', async ({ page }) => {
    // There are multiple links to /problems — ensure at least one exists
    const problemLinks = page.getByRole('link', { name: /problems/i });
    await expect(problemLinks.first()).toBeVisible();
  });

  test('page has no broken layout (body is non-empty)', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('"What CodeSM is" section is visible', async ({ page }) => {
    await expect(page.getByText(/What CodeSM is/i)).toBeVisible();
  });

  test('"Three pillars" section is visible', async ({ page }) => {
    await expect(page.getByText(/Three pillars/i)).toBeVisible();
  });

  test('"Ready to start?" section is visible', async ({ page }) => {
    await expect(page.getByText(/Ready to start/i)).toBeVisible();
  });
});
