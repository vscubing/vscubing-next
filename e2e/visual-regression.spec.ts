import { test, expect } from '@playwright/test'

test.describe('Visual regression tests', () => {
  test.describe('Landing page', () => {
    test('matches screenshot', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot('landing.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      })
    })
  })

  test.describe('Privacy policy page', () => {
    test('matches screenshot', async ({ page }) => {
      await page.goto('/privacy-policy')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot('privacy-policy.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      })
    })
  })
})
