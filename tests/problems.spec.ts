import { test, expect } from '@playwright/test';

/**
 * Problems List Page E2E Tests
 *
 * Covers the public /problems page:
 *  - Page structure
 *  - Search functionality
 *  - Problem cards / list items
 *  - Navigation to problem detail
 *
 * API calls to the backend are intercepted via page.route() so the tests
 * run reliably regardless of whether the backend server is up.
 */

const MOCK_PROBLEMS = [
  {
    id: 'test-001',
    title: 'Two Sum',
    description: 'Given an array of integers, return indices of the two numbers that add up to a target.',
    difficulty: 'Easy',
    tags: ['array', 'hash-table'],
  },
  {
    id: 'test-002',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    tags: ['string', 'sliding-window'],
  },
  {
    id: 'test-003',
    title: 'Median of Two Sorted Arrays',
    description: 'Find the median of two sorted arrays with O(log(m+n)) time complexity.',
    difficulty: 'Hard',
    tags: ['array', 'binary-search', 'divide-and-conquer'],
  },
];

/** Intercept the backend API and return mock problems data. */
async function mockProblemsApi(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/problem*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          problems: MOCK_PROBLEMS,
          nextCursor: null,
        },
      }),
    });
  });
}

test.describe('Problems list page', () => {
  test.beforeEach(async ({ page }) => {
    await mockProblemsApi(page);
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
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('at least one problem card renders after data loads (mocked)', async ({ page }) => {
    // Wait for mock data to render - Two Sum should appear
    await expect(page.getByText('Two Sum')).toBeVisible({ timeout: 10_000 });
  });

  test('clicking a problem card link navigates to /problems/:id (mocked)', async ({ page }) => {
    // Wait for the mocked problems to render
    await expect(page.getByText('Two Sum')).toBeVisible({ timeout: 10_000 });

    // Find the "Solve Now" link for the first problem
    const firstLink = page.locator('a[href*="/problems/"]').first();
    await expect(firstLink).toBeVisible({ timeout: 10_000 });

    await firstLink.click();
    await expect(page).toHaveURL(/\/problems\/.+/);
  });

  test('problem titles from mocked API are displayed', async ({ page }) => {
    // Use heading role to avoid strict-mode violations (title also appears in description text)
    await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Longest Substring Without Repeating Characters' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Median of Two Sorted Arrays' })).toBeVisible({ timeout: 10_000 });
  });

  test('search filters the list', async ({ page }) => {
    // Wait for mock data
    await expect(page.getByText('Two Sum')).toBeVisible({ timeout: 10_000 });

    const searchInput = page.locator('input[placeholder*="Search"]');
    // Search for something that only matches "Two Sum"
    await searchInput.fill('Two Sum');
    await page.waitForTimeout(400);

    // "Two Sum" should still be visible
    await expect(page.getByText('Two Sum')).toBeVisible();
    // Other problem should not be visible
    await expect(page.getByText('Median of Two Sorted Arrays')).not.toBeVisible();
  });

  test('difficulty filter buttons are present', async ({ page }) => {
    for (const label of ['All', 'Easy', 'Medium', 'Hard']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('sort dropdown is present with correct options', async ({ page }) => {
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select.locator('option', { hasText: 'Sort: A–Z' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'Sort: Z–A' })).toHaveCount(1);
  });
});
