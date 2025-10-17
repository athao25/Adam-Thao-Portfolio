import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.inventoryContainer).toBeVisible();
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should display error message with invalid credentials', async ({ page }) => {
    await loginPage.login(TestData.INVALID_USERNAME, TestData.INVALID_PASSWORD);
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(TestData.ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  test('should display error message for locked user', async ({ page }) => {
    await loginPage.login(TestData.LOCKED_USERNAME, TestData.VALID_PASSWORD);
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(TestData.ERROR_MESSAGES.LOCKED_USER);
  });

  test('should display error message when username is empty', async ({ page }) => {
    await loginPage.login('', TestData.VALID_PASSWORD);
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(TestData.ERROR_MESSAGES.MISSING_USERNAME);
  });

  test('should display error message when password is empty', async ({ page }) => {
    await loginPage.login(TestData.VALID_USERNAME, '');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(TestData.ERROR_MESSAGES.MISSING_PASSWORD);
  });

  test('should display error message when both fields are empty', async ({ page }) => {
    await loginPage.login('', '');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(TestData.ERROR_MESSAGES.MISSING_USERNAME);
  });

  test('should login with problem user', async ({ page }) => {
    await loginPage.login(TestData.PROBLEM_USERNAME, TestData.VALID_PASSWORD);
    
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });

  test('should login with performance glitch user', async ({ page }) => {
    await loginPage.login(TestData.PERFORMANCE_USERNAME, TestData.VALID_PASSWORD);
    
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });
});