import { test, expect } from '@playwright/test';

test('aidora core flows', async ({ page }) => {
  await page.goto('/post/new');
  await page.getByLabel('Title').fill('Need groceries');
  await page.getByLabel('Description').fill('Call me at 555-555-1234');
  await page.getByLabel('Create post').click();
  await expect(page.getByTestId(/post-/).first()).toContainText('Need groceries');

  await page.goto('/settings');
  await page.getByLabel('My radius').fill('1');
  await page.getByLabel('Save area').click();

  await page.goto('/post/new');
  await page.getByLabel('Post type').selectOption('offer');
  await page.getByLabel('Title').fill('Can deliver groceries');
  await page.getByLabel('Category').fill('errands');
  await page.getByLabel('Create post').click();
  await page.getByTestId(/post-/).filter({ hasText: 'Need groceries' }).first().click();
  await expect(page.getByTestId('matches-list')).toContainText('Can deliver groceries');

  await page.getByLabel('Open post').first().click();
  await page.getByLabel('Start thread').click();
  await page.getByLabel('Thread message').fill('I can help');
  await page.getByLabel('Send message').click();
  await page.getByLabel('Resolve thread').click();
  await page.goto('/reputation');
  await expect(page.getByTestId('reputation-badge')).toContainText('Local Trust 1');

  await page.goto('/sync');
  await page.getByLabel('Generate capsule').click();
  await expect(page.getByLabel('Board pack JSON')).toContainText('[redacted-phone]');

  await page.goto('/verify');
  await expect(page.getByTestId('verify-summary')).toContainText('System Verify');
  await expect(page.getByTestId('verify-check').first()).toContainText('PASS');

});
