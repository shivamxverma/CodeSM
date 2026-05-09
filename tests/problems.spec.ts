import { test, expect } from '@playwright/test';

/**
 * Problems List Page E2E Tests
 *
 * Covers the public /problems page:
 *  - Page structure
 *  - Search functionality
 *  - Problem cards / list items
 *  - Navigation to problem detail
 */

test.describe('Problems list page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/problems');
  });

  test('renders the Problems heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /problems/i })).toBeVisible();
  });

  test('renders the sub-heading / description text', async ({ page }) => {
    await expect(
      page.getByText(/Search, filter by difficulty, and sort by rating/i)
    ).toBeVisible();
  });

  test('search input is present and accepts text', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('two sum');
    await expect(searchInput).toHaveValue('two sum');
  });

  test('page body is non-empty (problems or loading state renders)', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('at least one problem card renders after data loads', async ({ page }) => {
    // Wait up to 10 s for at least one problem card
    const cards = page.locator('[class*="card"], [class*="problem"], article, li');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('clicking a problem card navigates to /problems/:id', async ({ page }) => {
    // Wait for cards to render
    const firstLink = page.locator('a[href*="/problems/"]').first();
    await expect(firstLink).toBeVisible({ timeout: 10_000 });

    const href = await firstLink.getAttribute('href');
    await firstLink.click();
    await expect(page).toHaveURL(/\/problems\/.+/);
    // Make sure the URL we navigated to matches the href we clicked
    if (href) {
      await expect(page).toHaveURL(new RegExp(href.replace(/\//g, '\\/')));
    }
  });

  test('search filters the list', async ({ page }) => {
    // Get initial count (may be loading)
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type something very specific that is unlikely to match everything
    await searchInput.fill('zzz_no_match_expected_zzz');
    // Give React time to re-render filtered list
    await page.waitForTimeout(600);
    // The list should now be empty or show a "no results" message
    const noResults = page.locator('text=/no results|no problems|nothing found|empty/i');
    const cards = page.locator('a[href*="/problems/"]');

    // Either "no results" message appears OR the card count is 0
    const cardCount = await cards.count();
    const noResultsVisible = await noResults.isVisible().catch(() => false);
    expect(cardCount === 0 || noResultsVisible).toBeTruthy();
  });
});
