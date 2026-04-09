import { test, expect } from '@playwright/test';

test('app should load', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/kmm-ejercicio-angular-posts/i);
});
