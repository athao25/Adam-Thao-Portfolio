import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Smoke Tests @smoke', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
  });

  test('should perform basic login and navigation flow', async ({ page }) => {
    // Login with valid credentials
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    
    // Verify inventory page loads
    await expect(inventoryPage.inventoryContainer).toBeVisible();
    
    // Add one item to cart
    await inventoryPage.addFirstItemToCart();
    
    // Verify cart count
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe('1');
    
    // Navigate to cart
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);
  });

  test('should display products and sorting functionality', async ({ page }) => {
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    
    // Verify products are displayed
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);
    
    // Test sorting functionality
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.NAME_A_TO_Z);
    const productNames = await inventoryPage.getProductNames();
    expect(productNames.length).toBe(6);
    
    // Verify logout works
    await inventoryPage.logout();
    await expect(page).toHaveURL(/.*index.html/);
  });

  test('should handle basic cart operations', async ({ page }) => {
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    
    // Add multiple items to cart
    await inventoryPage.addItemToCartByIndex(0);
    await inventoryPage.addItemToCartByIndex(1);
    
    // Verify cart count
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe('2');
    
    // Go to cart
    await inventoryPage.goToCart();
    
    // Verify cart page loads
    await expect(page).toHaveURL(/.*cart.html/);
    
    // Verify items are in cart
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(2);
  });

  test('should handle different user types', async ({ page }) => {
    const userTypes = [
      TestData.VALID_USERNAME,
      TestData.PROBLEM_USERNAME,
      TestData.PERFORMANCE_USERNAME
    ];

    for (const username of userTypes) {
      await loginPage.goto();
      await loginPage.login(username, TestData.VALID_PASSWORD);
      
      // Verify login successful
      await expect(inventoryPage.inventoryContainer).toBeVisible();
      
      // Logout for next iteration
      await inventoryPage.logout();
    }
  });

  test('should handle invalid login gracefully', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(TestData.INVALID_USERNAME, TestData.INVALID_PASSWORD);
    
    // Verify error message appears
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(TestData.ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    
    // Refresh page
    await page.reload();
    
    // Verify still logged in
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });

  test('should handle basic responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.goto();
    
    // Verify login form is visible and functional
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    // Test login on mobile
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });

  test('should handle basic error scenarios', async ({ page }) => {
    await loginPage.goto();
    
    // Test empty username
    await loginPage.login('', TestData.VALID_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    
    // Test empty password
    await loginPage.login(TestData.VALID_USERNAME, '');
    await expect(loginPage.errorMessage).toBeVisible();
    
    // Test both empty
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should verify critical page elements are present', async ({ page }) => {
    await loginPage.goto();
    
    // Verify critical login elements
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    // Login and verify inventory elements
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    await expect(inventoryPage.inventoryContainer).toBeVisible();
    await expect(inventoryPage.sortDropdown).toBeVisible();
  });

  test('should complete basic user journey', async ({ page }) => {
    // Complete login
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    
    // Add item to cart
    await inventoryPage.addFirstItemToCart();
    
    // Go to cart
    await inventoryPage.goToCart();
    
    // Verify cart page
    await expect(cartPage.cartContainer).toBeVisible();
    
    // Continue shopping
    await cartPage.continueShopping();
    
    // Verify back to inventory
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });
});
