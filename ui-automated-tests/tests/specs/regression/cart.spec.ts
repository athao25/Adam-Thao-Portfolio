import { test, expect } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Cart Page Tests', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 2);
    await inventoryPage.goToCart();
    cartPage = new CartPage(page);
  });

  test('should display cart page correctly', async ({ page }) => {
    await expect(cartPage.isCartPageLoaded()).resolves.toBe(true);
    await expect(page).toHaveURL(/.*cart.html/);
  });

  test('should display correct number of items in cart', async ({ page }) => {
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(2);
  });

  test('should display correct item names in cart', async ({ page }) => {
    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames.length).toBe(2);
    
    // Verify items have names
    itemNames.forEach(name => {
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(0);
    });
  });

  test('should display correct item prices in cart', async ({ page }) => {
    const itemPrices = await cartPage.getCartItemPrices();
    expect(itemPrices.length).toBe(2);
    
    // Verify prices are in correct format
    itemPrices.forEach(price => {
      expect(price).toMatch(/^\$\d+\.\d{2}$/);
    });
  });

  test('should remove item from cart', async ({ page }) => {
    await cartPage.removeItemByIndex(0);
    
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(1);
  });

  test('should remove all items from cart', async ({ page }) => {
    await cartPage.removeItemByIndex(0);
    await cartPage.removeItemByIndex(0);
    
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(0);
  });

  test('should continue shopping', async ({ page }) => {
    await cartPage.continueShopping();
    
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should proceed to checkout', async ({ page }) => {
    await cartPage.proceedToCheckout();
    
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });

  test('should handle empty cart', async ({ page }) => {
    // Remove all items
    await cartPage.removeItemByIndex(0);
    await cartPage.removeItemByIndex(0);
    
    // Verify cart is empty
    await expect(cartPage.isEmpty()).resolves.toBe(true);
    
    // Checkout button should still be visible but cart should be empty
    await expect(cartPage.checkoutButton).toBeVisible();
  });
});