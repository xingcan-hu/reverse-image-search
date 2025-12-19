import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test('should render the homepage in English', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Upload an image. Find where it lives.' }),
    ).toBeVisible();
  });

  test('should render the sign-in page in English', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByText('Email address')).toBeVisible();
  });
});
