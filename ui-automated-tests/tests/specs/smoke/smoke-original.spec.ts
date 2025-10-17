import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Smoke Tests @smoke', () => {
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
});