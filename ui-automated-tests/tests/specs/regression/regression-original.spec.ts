import { test, expect } from '@playwright/test';
import { CheckoutPage, CheckoutInfo } from '../../pages/CheckoutPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Regression Tests @regression', () => {
  test('should complete end-to-end purchase flow', async ({ page }) => {
    // Complete login and add items
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 3);
    await inventoryPage.goToCart();
    
    // Proceed to checkout
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    // Fill checkout information
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
    await checkoutPage.continueToOverview();
    
    // Complete the order
    const overviewPage = new (await import('../../pages/CheckoutOverviewPage')).CheckoutOverviewPage(page);
    await overviewPage.finishOrder();
    
    // Verify completion
    const completePage = new CheckoutCompletePage(page);
    await expect(completePage.isOrderSuccessful()).resolves.toBe(true);
  });

  test('should handle all error scenarios in checkout', async ({ page }) => {
    // Setup: Login and add item to cart
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 1);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    const checkoutPage = new CheckoutPage(page);
    
    // Test missing first name
    await checkoutPage.fillCheckoutInfo({
      firstName: '',
      lastName: TestData.TEST_USER_INFO.lastName,
      postalCode: TestData.TEST_USER_INFO.postalCode
    });
    await checkoutPage.continueToOverview();
    await expect(checkoutPage.isErrorMessageVisible()).resolves.toBe(true);
    
    // Test missing last name
    await checkoutPage.fillCheckoutInfo({
      firstName: TestData.TEST_USER_INFO.firstName,
      lastName: '',
      postalCode: TestData.TEST_USER_INFO.postalCode
    });
    await checkoutPage.continueToOverview();
    await expect(checkoutPage.isErrorMessageVisible()).resolves.toBe(true);
    
    // Test missing postal code
    await checkoutPage.fillCheckoutInfo({
      firstName: TestData.TEST_USER_INFO.firstName,
      lastName: TestData.TEST_USER_INFO.lastName,
      postalCode: ''
    });
    await checkoutPage.continueToOverview();
    await expect(checkoutPage.isErrorMessageVisible()).resolves.toBe(true);
  });

  test('should verify all sorting options work correctly', async ({ page }) => {
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    
    // Test A to Z sorting
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.NAME_A_TO_Z);
    await TestHelpers.verifyProductsSortedByName(page);
    
    // Test Z to A sorting
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.NAME_Z_TO_A);
    const productNames = await inventoryPage.getProductNames();
    const expectedNames = [...TestData.EXPECTED_PRODUCTS_A_TO_Z].reverse();
    expect(productNames).toEqual(expectedNames);
    
    // Test price low to high
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.PRICE_LOW_TO_HIGH);
    await TestHelpers.verifyProductsSortedByPrice(page);
    
    // Test price high to low
    await inventoryPage.sortProducts(TestData.SORT_OPTIONS.PRICE_HIGH_TO_LOW);
    const productPrices = await inventoryPage.getProductPrices();
    const numericPrices = productPrices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => b - a);
    
    for (let i = 0; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBe(sortedPrices[i]);
    }
  });
});