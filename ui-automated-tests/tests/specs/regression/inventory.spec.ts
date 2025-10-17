import { test, expect } from '@playwright/test';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Inventory Page Tests', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = await TestHelpers.loginWithValidCredentials(page);
  });

  test('should display all products on inventory page', async ({ page }) => {
    await expect(inventoryPage.inventoryContainer).toBeVisible();
    
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);
  });

  test('should add single item to cart', async ({ page }) => {
    await inventoryPage.addFirstItemToCart();
    
    const cartItemCount = await inventoryPage.getCartItemCount();
    expect(cartItemCount).toBe('1');
  });

  test('should add multiple items to cart', async ({ page }) => {
    await TestHelpers.addItemsToCart(inventoryPage, 3);
    
    const cartItemCount = await inventoryPage.getCartItemCount();
    expect(cartItemCount).toBe('3');
  });

  test('should sort products by name A to Z', async ({ page }) => {
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.NAME_A_TO_Z);
    
    const productNames = await inventoryPage.getProductNames();
    expect(productNames).toEqual(TestData.EXPECTED_PRODUCTS_A_TO_Z);
  });

  test('should sort products by name Z to A', async ({ page }) => {
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.NAME_Z_TO_A);
    
    const productNames = await inventoryPage.getProductNames();
    const expectedNames = [...TestData.EXPECTED_PRODUCTS_A_TO_Z].reverse();
    expect(productNames).toEqual(expectedNames);
  });

  test('should sort products by price low to high', async ({ page }) => {
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.PRICE_LOW_TO_HIGH);
    
    await TestHelpers.verifyProductsSortedByPrice(page);
  });

  test('should sort products by price high to low', async ({ page }) => {
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.PRICE_HIGH_TO_LOW);
    
    const productPrices = await inventoryPage.getProductPrices();
    const numericPrices = productPrices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => b - a);
    
    for (let i = 0; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBe(sortedPrices[i]);
    }
  });

  test('should navigate to cart page', async ({ page }) => {
    await inventoryPage.goToCart();
    
    await expect(page).toHaveURL(/.*cart.html/);
  });

  test('should logout successfully', async ({ page }) => {
    await inventoryPage.logout();
    
    await expect(page).toHaveURL(/.*index.html/);
  });

  test('should display product names and prices correctly', async ({ page }) => {
    const productNames = await inventoryPage.getProductNames();
    const productPrices = await inventoryPage.getProductPrices();
    
    expect(productNames.length).toBe(6);
    expect(productPrices.length).toBe(6);
    
    // Verify all products have names and prices
    productNames.forEach(name => {
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(0);
    });
    
    productPrices.forEach(price => {
      expect(price).toMatch(/^\$\d+\.\d{2}$/);
    });
  });
});