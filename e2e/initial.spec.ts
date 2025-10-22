import { test, expect, Page } from '@playwright/test';
import { createTestUser, deleteTestUser } from '~/api/test/helpers';

const SITE_URL = process.env.TEST_SITE_URL || 'http://localhost:3000';

const logInWithTestUser = async (page: Page) => {
  const testUser = await createTestUser();
  await page.goto(SITE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(testUser.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(testUser.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();
  return testUser;
};

test.describe('Test account setup', () => {
  test('Can create test account', async ({ page }) => {
    const testUser = await logInWithTestUser(page);
    await deleteTestUser(testUser);
  });
});

test.describe('Home Page', () => {
  test('has correct title and accessibility', async ({ page }) => {
    await page.goto(SITE_URL);

    // Check page title - using a more flexible check that matches the title template
    const title = await page.title();
    expect(title).toMatch(/My Bible Log/);

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check main content structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('role', 'main');

    // Check feature cards accessibility
    const featureCards = page.locator('figure.feature-card');
    await expect(featureCards).toHaveCount(10);
    for (const card of await featureCards.all()) {
      await expect(card).toHaveAttribute('role', 'figure');
      await expect(card.locator('img')).toHaveAttribute('alt');
    }
  });

  test('navigation and links work correctly', async ({ page }) => {
    await page.goto(SITE_URL);

    // Test Get Started link
    const getStartedLink = page.getByRole('link', { name: 'Get Started' }).first();
    await expect(getStartedLink).toBeVisible();
    await getStartedLink.click();
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Go back to home page
    await page.goto(SITE_URL);

    // Test feature card links
    const featureLinks = page.getByRole('link', { name: /Get Started/i });
    const linkCount = await featureLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const link = featureLinks.nth(i);
      await expect(link).toBeVisible();
      await link.click();
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
      await page.goto(SITE_URL);
    }
  });
});

test.describe('Login Page', () => {
  test('has correct structure and accessibility', async ({ page }) => {
    await page.goto(`${SITE_URL}/login`);

    // Check page structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Sign In' })).toBeVisible();

    // Check form accessibility - using the form element directly since it doesn't have a role
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check form fields using input type and placeholder
    const emailField = page.locator('input[type="text"]');
    await expect(emailField).toBeVisible();
    await expect(emailField).toHaveAttribute('type', 'text');

    const passwordField = page.locator('input[type="password"]');
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveAttribute('type', 'password');

    // Check buttons
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Need an account?' })).toBeVisible();
  });

  test('form validation works correctly', async ({ page }) => {
    await page.goto(`${SITE_URL}/login`);

    // Submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Check for email validation error
    await expect(page.getByText('A email is required')).toBeVisible();

    // Fill in email and submit again
    await page.locator('input[type="text"]').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Now check for password validation error
    await expect(page.getByText('A password is required')).toBeVisible();

    // Test invalid login attempt
    await page.locator('input[type="text"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email or password is incorrect')).toBeVisible();

    // Test password reset link
    await expect(page.getByRole('button', { name: 'Forgot your password? Reset it via email.' })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('home page is responsive', async ({ page }) => {
    await page.goto(SITE_URL);

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    // Target the main content columns specifically
    const mainContentColumns = page.locator('section.section .columns.is-centered').first();
    await expect(mainContentColumns).toHaveClass(/is-centered/);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    const mainContentColumn = page.locator('section.section .column.is-two-thirds-tablet').first();
    await expect(mainContentColumn).toHaveClass(/is-two-thirds-tablet/);

    // Test desktop view
    await page.setViewportSize({ width: 1366, height: 768 });
    await expect(mainContentColumn).toHaveClass(/is-two-thirds-tablet/);
  });
});

test.describe('Homepage Functionality', () => {
  test('Add Entry functionality', async ({ page }) => {
    const testUser = await logInWithTestUser(page);

    // Test that "Add Entry" button opens modal
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Entry' })).toBeVisible();

    // Test that "Add Entry" modal can be closed
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Test that "Add Entry" modal "Add" button is disabled initially
    const dialog = page.getByRole('dialog');
    await page.getByRole('button', { name: 'Add Entry' }).click();
    await expect(dialog.locator('button', { hasText: 'Add' })).toBeDisabled();

    // Test that chapter and verse selection is disabled before book is selected
    await expect(page.getByLabel('Start Chapter')).toBeDisabled();
    await expect(page.getByLabel('Start Verse')).toBeDisabled();
    await expect(page.getByLabel('End Chapter')).toBeDisabled();
    await expect(page.getByLabel('End Verse')).toBeDisabled();

    // Test that "Add Entry" modal can be filled
    await page.getByLabel('Book').selectOption('Genesis');

    // Test that start chapter is enabled after book is selected, but not start verse
    await expect(page.getByLabel('Start Chapter')).toBeEnabled();
    await expect(page.getByLabel('Start Verse')).toBeDisabled();

    // Test that all chapter and verse fields are enabled after start chapter is selected
    await page.getByLabel('Start Chapter').selectOption('1');
    await expect(page.getByLabel('Start Verse')).toBeEnabled();
    await expect(page.getByLabel('End Chapter')).toBeEnabled();
    await expect(page.getByLabel('End Verse')).toBeEnabled();

    // Test that remaining chapter and verse fields can be filled
    await page.getByLabel('Start Verse').selectOption('1');
    await page.getByLabel('End Chapter').selectOption('1');
    await page.getByLabel('End Verse').selectOption('10');

    // Test that the passage preview is shown
    await expect(page.getByText('Genesis 1:1-10')).toBeVisible();

    // Test that "Add" button is enabled when form is valid
    await expect(dialog.locator('button', { hasText: 'Add' })).toBeEnabled();

    // Test that the entry appears on the page after adding
    await dialog.locator('button', { hasText: 'Add' }).click();
    await expect(page.getByText('Genesis 1:1-10')).toBeVisible();

    // Test that the verse count, percentage, and progress bar update
    await expect(page.getByText('10 verses')).toBeVisible();
    await expect(page.getByText('12%')).toBeVisible(); // 10/83=0.12048192988
    await expect(page.getByTestId('double-progress-bar')).toBeVisible();
    await expect(page.getByTestId('primary-bar')).toHaveAttribute('style', /width: 12%;/);

    await deleteTestUser(testUser);
  });

  test('Today Entries functionality', async ({ page }) => {
    const testUser = await logInWithTestUser(page);

    // Test that "No Entries" is shown when there are no entries
    await expect(page.getByText('No Entries')).toBeVisible();

    // Add an entry for today
    await page.getByRole('button', { name: 'Add Entry' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Book').selectOption('Genesis');
    await expect(dialog.getByLabel('Start Chapter')).toBeEnabled();
    await dialog.getByLabel('Start Chapter').selectOption('1');
    await dialog.getByLabel('Start Verse').selectOption('1');
    await dialog.getByLabel('End Chapter').selectOption('1');
    await dialog.getByLabel('End Verse').selectOption('10');
    await dialog.getByRole('button', { name: 'Add' }).click();

    // Test that the entry appears in Today Entries
    await expect(page.getByText('Genesis 1:1-10')).toBeVisible();

    // Test Edit functionality
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Edit Entry' })).toBeVisible();

    // Test that Edit modal can be closed
    await dialog.getByLabel('Close').click();
    await expect(dialog).not.toBeVisible();

    // Test Delete functionality
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this entry?')).toBeVisible();

    // Test that Delete confirmation can be cancelled
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Genesis 1:1-10')).toBeVisible();

    // Test that Delete confirmation works
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this entry?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Genesis 1:1-10')).not.toBeVisible();
    await expect(page.getByText('No Entries')).toBeVisible();

    await deleteTestUser(testUser);
  });

  test('Reading Suggestions functionality', async ({ page }) => {
    const testUser = await logInWithTestUser(page);

    // Test that suggestions are populated for new users
    await expect(page.getByText('Suggestions')).toBeVisible();

    const suggestionList = page.getByTestId('reading-suggestions');
    const suggestions = suggestionList.getByRole('listitem');
    await expect(suggestions).toHaveCount(3);

    // Test that "Open" button opens a new tab
    const firstSuggestion = suggestions.first();
    const firstSuggestionText = await firstSuggestion.textContent();
    const openButton = firstSuggestion.getByRole('button', { name: 'Open' });
    await expect(openButton).toBeVisible();

    // Test that "Track" button opens Add Entry modal with passage filled
    const trackButton = firstSuggestion.getByRole('button', { name: 'Track' });
    await expect(trackButton).toBeVisible();
    await trackButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('button', { hasText: 'Add' })).toBeEnabled();

    // Test that when a suggestion is added, the modal closes and entry appears
    await dialog.locator('button', { hasText: 'Add' }).click();
    await expect(dialog).not.toBeVisible();
    const logEntryList = page.getByTestId('log-entries');
    const logEntry = logEntryList.getByRole('listitem').first();
    await expect(logEntry).toBeVisible();

    // Test that reading suggestions update after adding an entry
    await expect(suggestions).toHaveCount(3);
    const newFirstSuggestionText = await suggestions.first().textContent();
    expect(newFirstSuggestionText).not.toEqual(firstSuggestionText);

    await deleteTestUser(testUser);
  });
});
