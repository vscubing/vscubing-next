import { test, expect } from '@playwright/test'

/**
 * Production comparison tests.
 *
 * Usage:
 * 1. Capture baselines from production:
 *    PLAYWRIGHT_BASE_URL=https://vscubing.com bunx playwright test e2e/prod-comparison.spec.ts --update-snapshots
 *
 * 2. Compare against local build:
 *    PLAYWRIGHT_BASE_URL=http://localhost:3000 bunx playwright test e2e/prod-comparison.spec.ts
 *
 * Threshold: 0.5% pixel difference to account for font rendering, anti-aliasing, and dynamic content.
 * Dynamic content (contest names, dates, leaderboard data) is masked to avoid false positives
 * from different database state between prod and local environments.
 */

const DIFF_THRESHOLD = 0.005

test.describe('Production vs Local comparison', () => {
  test.beforeEach(async ({ page }) => {
    // Hide scrollbars to avoid cross-environment rendering differences
    await page.addStyleTag({
      content: `
        *::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; }
      `,
    })
  })

  test.describe('Landing page', () => {
    test('matches production screenshot', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Dismiss cookie banner if present to avoid timing/state differences
      const closeCookieBtn = page.locator(
        '[data-sonner-toast] button[aria-label="Close"]',
      )
      if ((await closeCookieBtn.count()) > 0) {
        await closeCookieBtn.click()
        await page.waitForTimeout(500)
      }

      // Re-inject scrollbar hiding after navigation
      await page.addStyleTag({
        content: `
          *::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; }
        `,
      })

      // Mask dynamic content that differs between prod and local environments
      const masks = [
        // Logo area (shows "LOCAL"/"STAGING" badge in non-production envs)
        page.locator('img[alt="vscubing - Virtual Speedcubing"]').locator('..'),
        // Ongoing contest banner (dates, discipline links)
        page.locator('section.bg-card-gradient'),
        // Latest contests list (contest numbers, dates)
        page.locator('section:has(h2:text("Latest contests"))'),
        // Best solves ever (user data from database)
        page.locator('section:has(h2:text("Best solves ever"))'),
      ]

      await expect(page).toHaveScreenshot('prod-landing.png', {
        fullPage: true,
        maxDiffPixelRatio: DIFF_THRESHOLD,
        mask: masks,
      })
    })
  })

  test.describe('Privacy policy page', () => {
    test('matches production screenshot', async ({ page }) => {
      await page.goto('/privacy-policy')
      await page.waitForLoadState('networkidle')

      // Dismiss cookie banner if present
      const closeCookieBtn = page.locator(
        '[data-sonner-toast] button[aria-label="Close"]',
      )
      if ((await closeCookieBtn.count()) > 0) {
        await closeCookieBtn.click()
        await page.waitForTimeout(500)
      }

      // Re-inject scrollbar hiding after navigation
      await page.addStyleTag({
        content: `
          *::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; }
        `,
      })

      await expect(page).toHaveScreenshot('prod-privacy-policy.png', {
        fullPage: true,
        maxDiffPixelRatio: DIFF_THRESHOLD,
      })
    })
  })
})
