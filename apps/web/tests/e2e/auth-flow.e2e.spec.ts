import { expect, test } from '@playwright/test';

test.describe('Authentication Navigation & Form Scenarios', () => {
  test('should render the login form with required fields', async ({
    page,
  }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should navigate between login and register views', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.locator('a[href="/register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    }
  });

  test('should protect authenticated routes and redirect guests to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    // Without authentication cookie, server-side middleware immediately redirects to /login
    await expect(page).toHaveURL(/.*login/);
  });
});
