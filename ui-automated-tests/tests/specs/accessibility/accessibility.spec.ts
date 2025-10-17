import { test, expect } from '@playwright/test';
import { AccessibilityUtils, AccessibilityResults } from '../../utils/AccessibilityUtils';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestData } from '../../utils/TestData';

test.describe('Accessibility Tests @accessibility', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
  });

  test('should pass WCAG 2.1 AA compliance on login page', async ({ page }) => {
    await loginPage.goto();
    
    // Run WCAG 2.1 AA compliance tests
    const results = await AccessibilityUtils.runWCAG21AATests(page);
    
    // Validate accessibility results
    const validation = AccessibilityUtils.validateAccessibilityResults(results);
    
    expect(validation.passed).toBe(true);
    
    if (!validation.passed) {
      console.log('Accessibility violations:', validation);
    }
  });

  test('should pass WCAG 2.1 AA compliance on inventory page', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    // Run WCAG 2.1 AA compliance tests
    const results = await AccessibilityUtils.runWCAG21AATests(page);
    
    // Validate accessibility results
    const validation = AccessibilityUtils.validateAccessibilityResults(results);
    
    expect(validation.passed).toBe(true);
    
    if (!validation.passed) {
      console.log('Accessibility violations:', validation);
    }
  });

  test('should have proper keyboard navigation support', async ({ page }) => {
    await loginPage.goto();
    
    // Check keyboard navigation
    const keyboardCheck = await AccessibilityUtils.checkKeyboardNavigation(page);
    
    expect(keyboardCheck.canTabThrough).toBe(true);
    expect(keyboardCheck.focusableElements).toBeGreaterThan(0);
    expect(keyboardCheck.issues).toHaveLength(0);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await loginPage.goto();
    
    // Check ARIA attributes
    const ariaCheck = await AccessibilityUtils.checkARIAAttributes(page);
    
    expect(ariaCheck.missingLabels).toBe(0);
    expect(ariaCheck.missingRoles).toBe(0);
    expect(ariaCheck.invalidRoles).toBe(0);
    expect(ariaCheck.issues).toHaveLength(0);
  });

  test('should have proper color contrast', async ({ page }) => {
    await loginPage.goto();
    
    // Check color contrast
    const contrastCheck = await AccessibilityUtils.checkColorContrast(page);
    
    expect(contrastCheck.lowContrastElements).toBe(0);
    expect(contrastCheck.issues).toHaveLength(0);
  });

  test('should be navigable with keyboard only', async ({ page }) => {
    await loginPage.goto();
    
    // Test keyboard navigation through login form
    await page.keyboard.press('Tab');
    await page.keyboard.type(TestData.VALID_USERNAME);
    
    await page.keyboard.press('Tab');
    await page.keyboard.type(TestData.VALID_PASSWORD);
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should be able to login using only keyboard
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    await loginPage.goto();
    
    // Check initial focus
    const usernameInput = loginPage.usernameInput;
    await expect(usernameInput).toBeFocused();
    
    // Check tab order
    await page.keyboard.press('Tab');
    const passwordInput = loginPage.passwordInput;
    await expect(passwordInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const loginButton = loginPage.loginButton;
    await expect(loginButton).toBeFocused();
  });

  test('should have proper form labels', async ({ page }) => {
    await loginPage.goto();
    
    // Check that form inputs have proper labels
    const usernameInput = loginPage.usernameInput;
    const passwordInput = loginPage.passwordInput;
    
    // Check for aria-label or associated label
    const usernameLabel = await usernameInput.getAttribute('aria-label');
    const passwordLabel = await passwordInput.getAttribute('aria-label');
    
    expect(usernameLabel).toBeTruthy();
    expect(passwordLabel).toBeTruthy();
  });

  test('should generate accessibility report', async ({ page }) => {
    await loginPage.goto();
    
    // Run comprehensive accessibility tests
    const results = await AccessibilityUtils.runAccessibilityTests(page);
    
    // Generate accessibility report
    const report = AccessibilityUtils.generateAccessibilityReport(results);
    
    // Report should contain expected sections
    expect(report).toContain('Accessibility Test Report');
    expect(report).toContain('URL:');
    expect(report).toContain('Violations:');
    expect(report).toContain('Passes:');
    
    console.log(report);
  });

  test('should handle screen reader compatibility', async ({ page }) => {
    await loginPage.goto();
    
    // Check for screen reader friendly elements
    const heading = page.locator('h1, h2, h3, h4, h5, h6').first();
    await expect(heading).toBeVisible();
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have proper error messaging', async ({ page }) => {
    await loginPage.goto();
    
    // Test error messaging accessibility
    await loginPage.login(TestData.INVALID_USERNAME, TestData.INVALID_PASSWORD);
    
    const errorMessage = loginPage.errorMessage;
    await expect(errorMessage).toBeVisible();
    
    // Check that error message is announced to screen readers
    const errorRole = await errorMessage.getAttribute('role');
    const errorAriaLive = await errorMessage.getAttribute('aria-live');
    
    expect(errorRole === 'alert' || errorAriaLive === 'polite' || errorAriaLive === 'assertive').toBeTruthy();
  });

  test('should maintain accessibility after user interactions', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    // Add items to cart
    await inventoryPage.addFirstItemToCart();
    
    // Check accessibility after interaction
    const results = await AccessibilityUtils.runWCAG21AATests(page);
    const validation = AccessibilityUtils.validateAccessibilityResults(results);
    
    expect(validation.passed).toBe(true);
  });
});
