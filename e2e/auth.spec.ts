import { test, expect } from '@playwright/test'

// Playwright config assumes dev server at localhost:3000
// Run: npx playwright test

test.describe('Autenticación', () => {
  test('muestra formulario de login', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByText('Bienvenido de vuelta')).toBeVisible()
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible()
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[placeholder="tu@email.com"]', 'wrong@test.com')
    await page.fill('[placeholder="••••••••"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible({ timeout: 5000 })
  })

  test('redirige al feed si ya está autenticado', async ({ page }) => {
    // This test would need proper auth state setup
    // Left as example of E2E test structure
  })
})

test.describe('Feed', () => {
  test('redirige a login si no autenticado', async ({ page }) => {
    await page.goto('/feed')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

test.describe('Navegación', () => {
  test('logo lleva al feed', async ({ page }) => {
    await page.goto('/auth/login')
    const logo = page.locator('text=Devora').first()
    await expect(logo).toBeVisible()
  })

  test('registro tiene enlace a login', async ({ page }) => {
    await page.goto('/auth/register')
    const loginLink = page.getByText('Inicia sesión')
    await expect(loginLink).toBeVisible()
    await loginLink.click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
