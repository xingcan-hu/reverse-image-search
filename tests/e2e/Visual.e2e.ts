import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'Upload an image. Find where it lives.' }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the pricing page', async ({ page }, testInfo) => {
      await page.goto('/pricing');

      await expect(
        page.getByRole('heading', { name: 'One-time credits, lifetime access' }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the privacy page', async ({ page }, testInfo) => {
      await page.goto('/privacy');

      await expect(
        page.getByRole('heading', { name: 'Privacy Policy' }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });
  });
});
