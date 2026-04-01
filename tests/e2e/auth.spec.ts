import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a new user to sign up and redirect to dashboard', async ({ page }) => {
    // Generate a unique email to avoid "User already exists" errors
    const randomEmail = `test-${Date.now()}@example.com`;
    
    // 1. Visit signup page
    await page.goto('/auth/signup');

    // 2. Fill in the signup form
    await page.getByPlaceholder('John Doe').fill('Playwright Tester');
    await page.getByPlaceholder('you@example.com').fill(randomEmail);
    await page.getByPlaceholder('Min. 6 characters').fill('password123');

    // 3. Submit the form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // 4. Verify redirection to dashboard (the /chat route)
    // Using a longer timeout to allow for network/db delay
    await expect(page).toHaveURL(/\/chat/, { timeout: 15000 });

    // 5. Verify user is on the dashboard
    await expect(page.getByText('StudyBot')).toBeVisible();
  });

  test('should show error if email already exists', async ({ page }) => {
    // Try to sign up with an email that is definitely already in the DB from the first test
    // or just try to sign up twice with same content in the same test
    const email = 'existing@example.com';
    
    // First, try to visit signup
    await page.goto('/auth/signup');
    await page.getByPlaceholder('John Doe').fill('E2E User');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Min. 6 characters').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // If it succeeds (because it was the first time), this is fine.
    // But if we want to PROVE the error shows, we sign up again.
    await page.goto('/auth/signup');
    await page.getByPlaceholder('John Doe').fill('E2E User');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Min. 6 characters').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Verify error message
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });
});
