import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 *
 * Covers: Login page, Sign-up page, validation errors, redirect behavior.
 * Uses credential-based login so tests do NOT depend on Google OAuth.
 *
 * Environment variables consumed (optional – tests degrade gracefully):
 *   E2E_USER_EMAIL     – valid registered user email
 *   E2E_USER_PASSWORD  – matching password
 */

const VALID_EMAIL = process.env.E2E_USER_EMAIL ?? '';
const VALID_PASS = process.env.E2E_USER_PASSWORD ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// Login page
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders email and password fields', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('submit button is present', async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows validation error for short password', async ({ page }) => {
    // Fill a valid email so browser native validation passes, but short password triggers Zod
    await page.locator('#email').fill('valid@example.com');
    await page.locator('#password').fill('short');
    await page.locator('button[type="submit"]').click();

    // The login page renders errors in a div with role="alert"
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5_000 });
  });

  test('has a link to the Sign-up page', async ({ page }) => {
    // The login page shows "Create one" as the signup link text
    const signupLink = page.getByRole('link', { name: /create one/i });
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('has a "Forgot password" link', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot/i });
    await expect(forgotLink).toBeVisible();
  });

  // Conditional test – only runs when credentials are supplied
  test.describe('with valid credentials', () => {
    test.skip(() => !VALID_EMAIL || !VALID_PASS, 'Skipped: set E2E_USER_EMAIL / E2E_USER_PASSWORD');

    test('logs in and redirects to home', async ({ page }) => {
      await page.locator('#email').fill(VALID_EMAIL);
      await page.locator('#password').fill(VALID_PASS);
      await page.locator('button[type="submit"]').click();
      // After a successful login the app navigates to "/"
      await expect(page).toHaveURL('/', { timeout: 10_000 });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sign-up page
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sign-up page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('renders the sign-up form fields', async ({ page }) => {
    // The form has dynamic id={id} fields; check for password and confirmPassword which have stable IDs
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#confirmPassword').fill('DifferentPass!');
    await page.locator('button[type="submit"]').click();

    const error = page.locator('[class*="error"], [class*="text-red"], [class*="text-rose"]');
    await expect(error.first()).toBeVisible({ timeout: 5_000 });
  });

  test('has a link back to login', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /log.?in|sign.?in/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Forgot-password page
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Forgot-password page', () => {
  test('renders the forgot-password page', async ({ page }) => {
    await page.goto('/forgot-password');
    // There should be at least one email-type input
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
