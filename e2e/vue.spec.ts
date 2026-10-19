import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('shows the German hero title', async ({ page }) => {
    await page.context().addInitScript(() => localStorage.setItem('locale', 'de'))
    await page.goto('./')
    await expect(page.locator('h1')).toHaveText('Audio Wiedergabeliste Generator')
  })

  test('shows the English hero title', async ({ page }) => {
    await page.context().addInitScript(() => localStorage.setItem('locale', 'en'))
    await page.goto('./')
    await expect(page.locator('h1')).toHaveText('Audio Playlist Generator')
  })
})
